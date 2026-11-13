import { getEngineWasmBinary } from './wasm_binary_bytes';

export interface EngineWasmExports {
  memory: WebAssembly.Memory;
  engine_create: (width: number, height: number, maxParticles: number) => number;
  engine_init: (ptr: number) => void;
  engine_update: (ptr: number, dt: number) => void;
  engine_add_burst: (ptr: number, x: number, y: number, radius: number, force: number) => void;
  engine_set_cursor: (ptr: number, x: number, y: number, isDown: number) => void;
  engine_get_vertex_buffer: (ptr: number) => number;
  engine_get_vertex_count: (ptr: number) => number;
  engine_destroy: (ptr: number) => void;
}

export class GraphicsEngineBridge {
  private wasmExports!: EngineWasmExports;
  private enginePtr: number = 0;
  private initialized: boolean = false;

  public async initialize(
    width: number,
    height: number,
    maxParticles: number = 30000
  ): Promise<void> {
    const wasmBytes = getEngineWasmBinary();
    const result = await WebAssembly.instantiate(wasmBytes, {
      env: {
        sin: Math.sin,
        cos: Math.cos,
        sqrtf: Math.sqrt,
      },
    });

    const instance = (
      'instance' in result ? (result as any).instance : result
    ) as WebAssembly.Instance;

    this.wasmExports = instance.exports as unknown as EngineWasmExports;
    this.enginePtr = this.wasmExports.engine_create(width, height, maxParticles);
    this.wasmExports.engine_init(this.enginePtr);
    this.initialized = true;
  }

  public isReady(): boolean {
    return this.initialized && this.enginePtr !== 0;
  }

  public update(dt: number): void {
    if (!this.enginePtr) return;
    this.wasmExports.engine_update(this.enginePtr, dt);
  }

  public addBurst(x: number, y: number, radius: number = 140, force: number = 550): void {
    if (!this.enginePtr) return;
    this.wasmExports.engine_add_burst(this.enginePtr, x, y, radius, force);
  }

  public setCursor(x: number, y: number, isDown: boolean): void {
    if (!this.enginePtr) return;
    this.wasmExports.engine_set_cursor(this.enginePtr, x, y, isDown ? 1 : 0);
  }

  /**
   * Returns a direct zero-copy TypedArray view over WASM memory.
   * This view is passed straight to gl.bufferSubData without memory allocation!
   */
  public getVertexDataView(): { buffer: Float32Array; count: number } {
    if (!this.enginePtr) {
      return { buffer: new Float32Array(0), count: 0 };
    }
    const count = this.wasmExports.engine_get_vertex_count(this.enginePtr);
    const ptr = this.wasmExports.engine_get_vertex_buffer(this.enginePtr);
    // 7 floats per vertex: x, y, r, g, b, a, size
    const floatCount = count * 7;
    const directView = new Float32Array(this.wasmExports.memory.buffer, ptr, floatCount);
    return { buffer: directView, count };
  }

  public destroy(): void {
    if (this.enginePtr) {
      this.wasmExports.engine_destroy(this.enginePtr);
      this.enginePtr = 0;
      this.initialized = false;
    }
  }
}
