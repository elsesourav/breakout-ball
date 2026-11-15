import { getPhysicsWasmBytes } from './wasm/physics_wasm_bytes';
import { CollisionEvent, CollisionEventType, BallState, PaddleState, BlockEngineState } from './types';
import { BlockData } from '../types/game';

export class WasmPhysicsBridge {
  private instance: WebAssembly.Instance | null = null;
  private memory: WebAssembly.Memory | null = null;

  // Cached pointers for zero-allocation per-frame polling
  private floatBufPtr: number = 0; // 32 bytes (8 floats)
  private intBufPtr: number = 0;   // 32 bytes (8 ints)
  private eventsBufPtr: number = 0; // 50 * 5 * 4 = 1000 bytes (up to 50 events)
  private blocksBufPtr: number = 0; // Dynamic size for level loading
  private maxBlocksAllocated: number = 0;

  private isReady: boolean = false;

  public async initialize(): Promise<boolean> {
    try {
      const wasmBytes = getPhysicsWasmBytes();
      const result = await WebAssembly.instantiate(wasmBytes.buffer as ArrayBuffer, {
        env: {
          memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
        },
      });

      const instance = ((result as any).instance || result) as WebAssembly.Instance;
      this.instance = instance;
      this.memory = (instance.exports.memory as WebAssembly.Memory) || null;

      // Allocate fixed query buffers in WASM linear memory
      const malloc = instance.exports.malloc as (bytes: number) => number;
      this.floatBufPtr = malloc(64);
      this.intBufPtr = malloc(64);
      this.eventsBufPtr = malloc(1024);

      this.isReady = true;
      console.log('WebAssembly Breakout Physics Module initialized successfully.');
      return true;
    } catch (err) {
      console.warn('WASM instantiation failed, using TypeScript physics engine fallback:', err);
      this.isReady = false;
      return false;
    }
  }

  public get ready(): boolean {
    return this.isReady;
  }

  public initEngine(
    width: number,
    height: number,
    paddleW: number,
    paddleH: number,
    ballR: number,
    speed: number
  ) {
    if (!this.instance) return;
    const fn = this.instance.exports.engine_init as (
      w: number, h: number, pw: number, ph: number, br: number, sp: number
    ) => void;
    fn(width, height, paddleW, paddleH, ballR, speed);
  }

  public loadBlocks(blocks: BlockData[], blockW: number, blockH: number) {
    if (!this.instance || !this.memory) return;

    const count = blocks.length;
    const requiredBytes = count * 3 * 4; // 3 ints per block (col, row, hp)

    const malloc = this.instance.exports.malloc as (bytes: number) => number;
    const free = this.instance.exports.free as (ptr: number) => void;

    if (this.blocksBufPtr && this.maxBlocksAllocated < count) {
      free(this.blocksBufPtr);
      this.blocksBufPtr = 0;
    }

    if (!this.blocksBufPtr) {
      this.blocksBufPtr = malloc(Math.max(requiredBytes, 1024 * 4));
      this.maxBlocksAllocated = Math.max(count, 340);
    }

    // Write block data directly into WASM linear memory
    const intView = new Int32Array(this.memory.buffer, this.blocksBufPtr, count * 3);
    for (let i = 0; i < count; i++) {
      intView[i * 3 + 0] = blocks[i].x;
      intView[i * 3 + 1] = blocks[i].y;
      intView[i * 3 + 2] = blocks[i].h;
    }

    const loadFn = this.instance.exports.engine_load_blocks as (
      ptr: number, c: number, bw: number, bh: number
    ) => void;
    loadFn(this.blocksBufPtr, count, blockW, blockH);
  }

  public resetBall(x: number, y: number, vx: number, vy: number) {
    if (!this.instance) return;
    const fn = this.instance.exports.engine_reset_ball as (
      x: number, y: number, vx: number, vy: number
    ) => void;
    fn(x, y, vx, vy);
  }

  public setPaddleTarget(targetX: number) {
    if (!this.instance) return;
    const fn = this.instance.exports.engine_set_paddle_pos as (tx: number) => void;
    fn(targetX);
  }

  public update(substeps: number = 4) {
    if (!this.instance) return;
    const fn = this.instance.exports.engine_update as (ss: number) => void;
    fn(substeps);
  }

  public getBallState(): { x: number; y: number; vx: number; vy: number; speed: number } {
    if (!this.instance || !this.memory) {
      return { x: 0, y: 0, vx: 0, vy: 0, speed: 0 };
    }
    const fn = this.instance.exports.engine_get_ball_state as (ptr: number) => void;
    fn(this.floatBufPtr);

    const fView = new Float32Array(this.memory.buffer, this.floatBufPtr, 5);
    return {
      x: fView[0],
      y: fView[1],
      vx: fView[2],
      vy: fView[3],
      speed: fView[4],
    };
  }

  public getPaddleState(): { x: number; y: number; width: number; height: number; vx: number } {
    if (!this.instance || !this.memory) {
      return { x: 0, y: 0, width: 0, height: 0, vx: 0 };
    }
    const fn = this.instance.exports.engine_get_paddle_state as (ptr: number) => void;
    fn(this.floatBufPtr);

    const fView = new Float32Array(this.memory.buffer, this.floatBufPtr, 5);
    return {
      x: fView[0],
      y: fView[1],
      width: fView[2],
      height: fView[3],
      vx: fView[4],
    };
  }

  public getBlockCount(): number {
    if (!this.instance) return 0;
    const fn = this.instance.exports.engine_get_block_count as () => number;
    return fn();
  }

  public getBlockState(index: number): { health: number; isDead: boolean; initialHealth: number } {
    if (!this.instance || !this.memory) {
      return { health: 0, isDead: true, initialHealth: 0 };
    }
    const fn = this.instance.exports.engine_get_block_state as (idx: number, ptr: number) => void;
    fn(index, this.intBufPtr);

    const iView = new Int32Array(this.memory.buffer, this.intBufPtr, 3);
    return {
      health: iView[0],
      isDead: iView[1] === 1,
      initialHealth: iView[2],
    };
  }

  public getRemainingBreakable(): number {
    if (!this.instance) return 0;
    const fn = this.instance.exports.engine_get_remaining_breakable as () => number;
    return fn();
  }

  public getCombo(): number {
    if (!this.instance) return 0;
    const fn = this.instance.exports.engine_get_combo as () => number;
    return fn();
  }

  public pollEvents(): CollisionEvent[] {
    if (!this.instance || !this.memory) return [];

    const fn = this.instance.exports.engine_get_events as (ptr: number, max: number) => number;
    const eventCount = fn(this.eventsBufPtr, 40);
    if (eventCount <= 0) return [];

    const iView = new Int32Array(this.memory.buffer, this.eventsBufPtr, eventCount * 5);
    const events: CollisionEvent[] = [];

    const typeMap: Record<number, CollisionEventType> = {
      1: 'wall',
      2: 'paddle',
      3: 'block_damage',
      4: 'block_destroy',
      5: 'ball_lost',
    };

    for (let i = 0; i < eventCount; i++) {
      const rawType = iView[i * 5 + 0];
      events.push({
        type: typeMap[rawType] || 'wall',
        blockIndex: iView[i * 5 + 1],
        hitX: iView[i * 5 + 2],
        hitY: iView[i * 5 + 3],
        combo: iView[i * 5 + 4],
      });
    }

    return events;
  }
}
