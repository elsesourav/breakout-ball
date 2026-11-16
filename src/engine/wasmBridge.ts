import { getPhysicsWasmBytes } from './wasm/physics_wasm_bytes';
import { CollisionEvent, CollisionEventType, BallState, PaddleState, BlockEngineState } from './types';
import { BlockData } from '../types/game';

const EVENT_TYPE_MAP: Record<number, CollisionEventType> = {
  1: 'wall',
  2: 'paddle',
  3: 'block_damage',
  4: 'block_destroy',
  5: 'ball_lost',
  6: 'portal_warp',
  7: 'emp_explode',
  8: 'shield_bounce',
  9: 'crit_damage',
  10: 'powerup_collect',
};

const SOURCE_MAP: Record<number, 'ball' | 'emp' | 'laser'> = {
  0: 'ball',
  1: 'emp',
  2: 'laser',
};

export class WasmPhysicsBridge {
  private instance: WebAssembly.Instance | null = null;
  private memory: WebAssembly.Memory | null = null;

  // Cached pointers for zero-allocation per-frame polling
  private paddleBufPtr: number = 0;       // 64 bytes
  private ballsBufPtr: number = 0;        // 512 bytes (up to 8 balls * 10 floats)
  private blockStatesBufPtr: number = 0;  // 8192 bytes (up to 512 blocks * 4 floats)
  private eventsBufPtr: number = 0;       // 4096 bytes (up to 60 events * 8 floats)
  private blocksLoadBufPtr: number = 0;   // Dynamic size for level loading
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
      this.paddleBufPtr = malloc(64);
      this.ballsBufPtr = malloc(512);
      this.blockStatesBufPtr = malloc(8192);
      this.eventsBufPtr = malloc(4096);

      this.isReady = true;
      console.log('⚡ WebAssembly Breakout Physics Engine (v2 full-feature) initialized successfully.');
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
    speed: number,
    blockW: number,
    blockH: number
  ) {
    if (!this.instance) return;
    const fn = this.instance.exports.engine_init as (
      w: number, h: number, pw: number, ph: number, br: number, sp: number, bw: number, bh: number
    ) => void;
    fn(width, height, paddleW, paddleH, ballR, speed, blockW, blockH);
  }

  public loadBlocks(blocks: BlockData[], blockW: number, blockH: number) {
    if (!this.instance || !this.memory) return;

    const count = blocks.length;
    const requiredBytes = count * 4 * 4; // 4 ints per block (col, row, hp, portalPairId)

    const malloc = this.instance.exports.malloc as (bytes: number) => number;
    const free = this.instance.exports.free as (ptr: number) => void;

    if (this.blocksLoadBufPtr && this.maxBlocksAllocated < count) {
      free(this.blocksLoadBufPtr);
      this.blocksLoadBufPtr = 0;
    }

    if (!this.blocksLoadBufPtr) {
      this.blocksLoadBufPtr = malloc(Math.max(requiredBytes, 1024 * 4));
      this.maxBlocksAllocated = Math.max(count, 340);
    }

    // Write block data directly into WASM linear memory: col, row, hp, portalPairId
    const intView = new Int32Array(this.memory.buffer, this.blocksLoadBufPtr, count * 4);
    for (let i = 0; i < count; i++) {
      intView[i * 4 + 0] = blocks[i].x;
      intView[i * 4 + 1] = blocks[i].y;
      intView[i * 4 + 2] = blocks[i].h;
      intView[i * 4 + 3] = blocks[i].portalPairId ?? 0;
    }

    const loadFn = this.instance.exports.engine_load_blocks as (
      ptr: number, c: number, bw: number, bh: number
    ) => void;
    loadFn(this.blocksLoadBufPtr, count, blockW, blockH);
  }

  public pairPortals() {
    if (!this.instance) return;
    const fn = this.instance.exports.engine_pair_portals as () => void;
    fn();
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

  public setModifiers(hasShield: boolean, isMega: boolean, impactLvl: number, maxPadSpeed: number) {
    if (!this.instance) return;
    const fn = this.instance.exports.engine_set_modifiers as (
      hs: number, im: number, il: number, mps: number
    ) => void;
    fn(hasShield ? 1 : 0, isMega ? 1 : 0, impactLvl, maxPadSpeed);
  }

  public spawnExtraBalls(count: number = 2) {
    if (!this.instance) return;
    const fn = this.instance.exports.engine_spawn_extra_balls as (c: number) => void;
    fn(count);
  }

  public damageBlock(blockIndex: number, damage: number = 1) {
    if (!this.instance) return;
    const fn = this.instance.exports.engine_damage_block as ((idx: number, dmg: number) => void) | undefined;
    if (typeof fn === 'function') {
      fn(blockIndex, damage);
    }
  }

  public detonateEmp(blockIndex: number) {
    if (!this.instance) return;
    const fn = this.instance.exports.engine_detonate_emp as ((idx: number) => void) | undefined;
    if (typeof fn === 'function') {
      fn(blockIndex);
    }
  }

  public update(substeps: number = 6) {
    if (!this.instance) return;
    const fn = this.instance.exports.engine_update as (ss: number) => void;
    fn(substeps);
  }

  public getBallCount(): number {
    if (!this.instance) return 0;
    const fn = this.instance.exports.engine_get_ball_count as () => number;
    return fn();
  }

  public syncBallStates(outBalls: BallState[]): BallState[] {
    if (!this.instance || !this.memory) return outBalls;

    const countFn = this.instance.exports.engine_get_ball_count as () => number;
    const ballCount = countFn();
    if (ballCount <= 0) return [];

    const getStatesFn = this.instance.exports.engine_get_ball_states as (ptr: number) => void;
    getStatesFn(this.ballsBufPtr);

    const fView = new Float32Array(this.memory.buffer, this.ballsBufPtr, ballCount * 10);
    const result: BallState[] = [];

    for (let i = 0; i < ballCount; i++) {
      const offset = i * 10;
      const x = fView[offset + 0];
      const y = fView[offset + 1];
      const prevX = fView[offset + 2];
      const prevY = fView[offset + 3];
      const vx = fView[offset + 4];
      const vy = fView[offset + 5];
      const radius = fView[offset + 6];
      const speed = fView[offset + 7];
      const isActive = fView[offset + 8] > 0.5;
      const isMega = fView[offset + 9] > 0.5;

      const existing = outBalls[i];
      if (existing) {
        existing.x = x;
        existing.y = y;
        existing.prevX = prevX;
        existing.prevY = prevY;
        existing.vx = vx;
        existing.vy = vy;
        existing.radius = radius;
        existing.speed = speed;
        existing.isActive = isActive;
        existing.isMega = isMega;
        result.push(existing);
      } else {
        result.push({
          x,
          y,
          prevX,
          prevY,
          vx,
          vy,
          radius,
          speed,
          baseSpeed: speed,
          isActive,
          isMega,
          trail: [],
        });
      }
    }

    return result;
  }

  public getPaddleState(existing?: PaddleState): PaddleState {
    if (!this.instance || !this.memory) {
      return existing || { x: 0, y: 0, width: 0, height: 0, vx: 0, targetX: 0 };
    }
    const fn = this.instance.exports.engine_get_paddle_state as (ptr: number) => void;
    fn(this.paddleBufPtr);

    const fView = new Float32Array(this.memory.buffer, this.paddleBufPtr, 6);
    if (existing) {
      existing.x = fView[0];
      existing.y = fView[1];
      existing.prevX = fView[2];
      existing.width = fView[3];
      existing.height = fView[4];
      existing.vx = fView[5];
      return existing;
    }

    return {
      x: fView[0],
      y: fView[1],
      prevX: fView[2],
      width: fView[3],
      height: fView[4],
      vx: fView[5],
      targetX: fView[0],
    };
  }

  public syncBlockStates(blocks: BlockEngineState[]): void {
    if (!this.instance || !this.memory) return;

    const countFn = this.instance.exports.engine_get_block_count as () => number;
    const blockCount = Math.min(blocks.length, countFn());
    if (blockCount <= 0) return;

    const getStatesFn = this.instance.exports.engine_get_block_states as (ptr: number) => void;
    getStatesFn(this.blockStatesBufPtr);

    const fView = new Float32Array(this.memory.buffer, this.blockStatesBufPtr, blockCount * 4);
    for (let i = 0; i < blockCount; i++) {
      const offset = i * 4;
      blocks[i].health = Math.round(fView[offset + 0]);
      blocks[i].isDead = fView[offset + 1] > 0.5;
      blocks[i].hitAnim = fView[offset + 2];
      blocks[i].portalRechargeTimer = Math.round(fView[offset + 3]);
    }
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

    const fn = this.instance.exports.engine_get_events_v2 as (ptr: number, max: number) => number;
    const eventCount = fn(this.eventsBufPtr, 50);
    if (eventCount <= 0) return [];

    const fView = new Float32Array(this.memory.buffer, this.eventsBufPtr, eventCount * 8);
    const events: CollisionEvent[] = [];

    for (let i = 0; i < eventCount; i++) {
      const offset = i * 8;
      const rawType = Math.round(fView[offset + 0]);
      const blockIndex = Math.round(fView[offset + 1]);
      const hitX = fView[offset + 2];
      const hitY = fView[offset + 3];
      const combo = Math.round(fView[offset + 4]);
      const rawSource = Math.round(fView[offset + 5]);
      const epicenterX = fView[offset + 6];
      const epicenterY = fView[offset + 7];

      events.push({
        type: EVENT_TYPE_MAP[rawType] || 'wall',
        blockIndex,
        hitX,
        hitY,
        combo,
        source: SOURCE_MAP[rawSource] || 'ball',
        epicenterX: epicenterX !== 0 ? epicenterX : undefined,
        epicenterY: epicenterY !== 0 ? epicenterY : undefined,
      });
    }

    return events;
  }
}
