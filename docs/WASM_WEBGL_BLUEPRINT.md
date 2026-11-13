# Master Engineering Blueprint: High-Performance WebAssembly (WASM) & WebGL Interactive Graphics & Game Systems

## 1. System Architecture & High-Level Data Flow

Modern web applications often struggle with complex particle physics or collision detection in JavaScript due to single-threaded CPU contention and Garbage Collection (GC) pauses. By offloading intensive simulation math to WebAssembly (compiled from C++) and streaming vertex structures directly to WebGL point sprites on the GPU, we achieve locked 60/120 FPS performance with up to 200,000+ interactive entities.

### Core Data Flow Architecture
```
┌────────────────────────────────┐
│      C++ Simulation Core       │
│  (Data-Oriented POD Arrays)    │
│  - Symplectic Euler Hooke's    │
│  - Radial Shockwave Dispersal  │
│  - Spatial Proximity Lighting  │
└───────────────┬────────────────┘
                │ Direct Memory Ptr
                ▼
┌────────────────────────────────┐
│    Zero-Copy Memory Bridge     │
│   Float32Array(wasm.memory)    │
│  (Zero JavaScript Allocation)  │
└───────────────┬────────────────┘
                │ gl.bufferSubData
                ▼
┌────────────────────────────────┐
│   WebGL Point-Sprite Pipeline  │
│    gl.drawArrays(gl.POINTS)    │
│   - Circular Discard Shader    │
│   - Separate Alpha Blending    │
│   - DPR-Scaled Quad Generation │
└────────────────────────────────┘
```

---

## 2. Toolchain & Environment Setup

To compile C++ code into WebAssembly without bloated Emscripten runtimes, we employ a standalone WASM configuration (`-sSTANDALONE_WASM=1 --no-entry`). This generates a pure `.wasm` binary that requires zero JavaScript glue code and can be embedded directly into TypeScript as a Base64 string for instantaneous, zero-network offline loading.

### Prerequisite Installations
- **Emscripten SDK**: `emcc` compiler (3.1.x+)
- **Python 3**: used for Base64 packaging and automated TypeScript generation

### Directory Structure Blueprint
```
packages/graphics-engine/
├── cpp/
│   ├── engine.hpp            # Master engine class declaration
│   ├── engine.cpp            # Core update and lifecycle implementations
│   ├── particle.hpp          # Entity structures (Position, Velocity, Color, Mass)
│   ├── physics.hpp           # Vector math, spring forces, and collision solvers
│   ├── lighting.hpp          # Proximity light emitters & spatial accumulation
│   └── contour.hpp           # Edge detection and equidistant path resampling
├── scripts/
│   └── build.sh              # Automated compilation & TypeScript packager
└── src/
    ├── wasm_binary_bytes.ts   # Auto-generated Base64 / Uint8Array embedded module
    ├── engine.bridge.ts      # Zero-copy memory bridge & C-ABI bindings
    ├── engine.renderer.ts    # WebGL context, shaders, and draw calls
    └── EngineCanvas.tsx      # React/Next.js canvas mount & pointer listener
```

---

## 3. C++ Simulation Engine Design (Data-Oriented Architecture)

In high-performance simulations and games, object-oriented pointer hierarchies (`std::vector<Entity*>`) create cache misses and memory fragmentation. Instead, we use **Data-Oriented Design (DOD)** with contiguous arrays and flat Plain Old Data (POD) structs.

### 3.1 Entity and Vertex Structures
```cpp
// POD Vertex structure aligned for WebGL gl.bufferSubData streaming
// 7 floats = 28 bytes per point sprite
struct WebGLVertex {
    float x;      // World X coordinate
    float y;      // World Y coordinate
    float r;      // Red channel [0.0 .. 1.0]
    float g;      // Green channel [0.0 .. 1.0]
    float b;      // Blue channel [0.0 .. 1.0]
    float a;      // Alpha channel [0.0 .. 1.0]
    float size;   // Per-particle point size in pixels
};

// Internal particle state representation
struct Particle {
    float originX, originY;  // Home anchor position
    float x, y;              // Current position
    float vx, vy;            // Velocity vector
    float r, g, b, a;        // Base pigment
    float mass;              // Inertia weight
    float size;              // Visual footprint
};
```

### 3.2 Physics: Hooke's Law Spring Return with Viscous Damping
When particles are disturbed by cursor drag or shockwaves, each particle acts as a damped harmonic oscillator seeking its anchor origin:

$$F_{\text{spring}} = -k \cdot (x - x_{\text{origin}})$$
$$F_{\text{damping}} = -c \cdot v$$
$$a = \frac{F_{\text{spring}} + F_{\text{damping}} + F_{\text{external}}}{m}$$

```cpp
void update_physics(Particle& p, float dt, float springK, float damping) {
    // 1. Hooke's Law elastic return force
    float dx = p.originX - p.x;
    float dy = p.originY - p.y;
    float fx = dx * springK;
    float fy = dy * springK;
    // 2. Viscous damping against current velocity
    fx -= p.vx * damping;
    fy -= p.vy * damping;
    // 3. Symplectic Euler integration
    p.vx += (fx / p.mass) * dt;
    p.vy += (fy / p.mass) * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
}
```

### 3.3 Shockwave Dispersal
When the user clicks or an explosive game event occurs, radial shockwaves propagate outward:

```cpp
struct Shockwave {
    float x, y;
    float radius;
    float maxRadius;
    float force;
    int active;
};

void apply_shockwave(Particle& p, const Shockwave& sw) {
    if (!sw.active) return;
    float dx = p.x - sw.x;
    float dy = p.y - sw.y;
    float distSq = dx * dx + dy * dy;
    float r = sw.radius;
    // Evaluate proximity to the shockwave perimeter shell
    float ringThickness = 32.0f;
    float dist = sqrtf(distSq);
    float diff = fabsf(dist - r);
    if (diff < ringThickness && dist > 0.001f) {
        float factor = (1.0f - diff / ringThickness) * (sw.force / (1.0f + r * 0.02f));
        float nx = dx / dist;
        float ny = dy / dist;
        p.vx += nx * factor;
        p.vy += ny * factor;
    }
}
```

---

## 4. WebAssembly Compilation & Packaging Automation

We compile the C++ source using Emscripten in standalone mode (`-sSTANDALONE_WASM=1 --no-entry`), exporting C functions directly via the linker. Then, a Python post-processor converts the raw binary into an inline TypeScript constant.

### Build Script (`scripts/build.sh`)
```bash
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> Compiling C++ to Standalone WebAssembly..."
emcc "$ROOT_DIR/cpp/engine.cpp" \
  -O3 \
  -sSTANDALONE_WASM=1 \
  --no-entry \
  -sTOTAL_MEMORY=67108864 \
  -Wl,--export=engine_create \
  -Wl,--export=engine_init \
  -Wl,--export=engine_update \
  -Wl,--export=engine_add_burst \
  -Wl,--export=engine_set_cursor \
  -Wl,--export=engine_get_vertex_buffer \
  -Wl,--export=engine_get_vertex_count \
  -Wl,--export=engine_destroy \
  -o "$ROOT_DIR/engine.wasm"

echo "==> Embedding WASM binary into TypeScript..."
python3 -c "
import base64
with open('$ROOT_DIR/engine.wasm', 'rb') as f:
    raw_wasm = f.read()
b64 = base64.b64encode(raw_wasm).decode('ascii')
ts_content = f'''// Auto-generated embedded WebAssembly binary
// Enables 100% offline, zero-network instantaneous initialization
const WASM_BASE64 = '{b64}';
let cachedBuffer: Uint8Array | null = null;
export function getEngineWasmBinary(): Uint8Array {
  if (cachedBuffer) return cachedBuffer;
  const binaryString = atob(WASM_BASE64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  cachedBuffer = bytes;
  return bytes;
}
'''
with open('$ROOT_DIR/src/wasm_binary_bytes.ts', 'w') as out:
    out.write(ts_content)
print(f'Done! Successfully packaged {len(raw_wasm)} bytes into TypeScript.')
"
```

> [!TIP]
> **Why Embed as Base64?**
> Standard `fetch('/engine.wasm')` suffers from path resolution breaks in monorepos, CORS issues in local testing, CDN 404s, and SSR hydration mismatches. Inline base64 instantiation is 100% synchronous, offline-first, and bulletproof across all bundlers (Vite, Turbopack, Webpack).

---

## 5. Zero-Copy TypeScript / WASM Memory Bridge

The key to locked 120 FPS performance is zero allocations in the render loop. We do NOT copy data into JavaScript arrays. Instead, we obtain the raw C++ memory pointer and instantiate a lightweight `Float32Array` view directly over the WebAssembly memory buffer.

```typescript
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

  public async initialize(width: number, height: number, maxParticles: number = 20000): Promise<void> {
    const wasmBytes = getEngineWasmBinary();
    const { instance } = await WebAssembly.instantiate(wasmBytes, {
      env: {
        sin: Math.sin,
        cos: Math.cos,
        sqrtf: Math.sqrt,
      },
    });
    this.wasmExports = instance.exports as unknown as EngineWasmExports;
    this.enginePtr = this.wasmExports.engine_create(width, height, maxParticles);
    this.wasmExports.engine_init(this.enginePtr);
  }

  public update(dt: number): void {
    if (!this.enginePtr) return;
    this.wasmExports.engine_update(this.enginePtr, dt);
  }

  public addBurst(x: number, y: number, radius: number, force: number): void {
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
    }
  }
}
```

---

## 6. High-Performance WebGL Point-Sprite Pipeline

Rather than drawing individual quad polygons (which requires 6 vertices and 2 triangles per particle), WebGL provides Point Sprites (`gl.POINTS`). This draws a whole quad from a single vertex, reducing memory footprint by 75%.

### 6.1 GLSL Shaders

**Vertex Shader:**
```glsl
attribute vec2 aPosition;   // World coordinates (0 .. canvasWidth, 0 .. canvasHeight)
attribute vec4 aColor;      // RGBA color
attribute float aSize;      // Diameter in physical pixels
uniform vec2 uResolution;   // Canvas width and height
uniform float uDpr;         // Device pixel ratio
varying vec4 vColor;

void main() {
    // 1. Convert pixel coordinates to Normalized Device Coordinates [-1.0 .. 1.0]
    vec2 zeroToOne = aPosition / uResolution;
    vec2 clipSpace = (zeroToOne * 2.0) - 1.0;
    
    // Invert Y axis for standard canvas coordinates (top-left 0,0)
    gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
    
    // 2. Scale point sprite footprint by Device Pixel Ratio
    gl_PointSize = aSize * uDpr;
    
    // 3. Pass color to fragment shader
    vColor = aColor;
}
```

**Fragment Shader:**
```glsl
precision mediump float;
varying vec4 vColor;

void main() {
    // gl_PointCoord gives [0.0 .. 1.0] coordinates inside the point sprite
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    // Discard pixels outside circular boundary to create smooth circular particles
    if (dist > 0.5) {
        discard;
    }
    
    // Smooth anti-aliased edge falloff
    float alpha = smoothstep(0.5, 0.4, dist) * vColor.a;
    gl_FragColor = vec4(vColor.rgb, alpha);
}
```

### 6.2 Zero-Copy Stream Rendering Loop
```typescript
export class ParticleRenderer {
  private gl: WebGLRenderingContext;
  private vertexBuffer: WebGLBuffer;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    })!;

    // Enable high-fidelity alpha blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFuncSeparate(
      this.gl.SRC_ALPHA,
      this.gl.ONE_MINUS_SRC_ALPHA,
      this.gl.ONE,
      this.gl.ONE_MINUS_SRC_ALPHA
    );
    this.vertexBuffer = this.gl.createBuffer()!;
  }

  public render(vertexData: Float32Array, count: number): void {
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    
    // Direct zero-copy GPU upload from WASM memory view
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertexData);
    // Render all particles in a single draw call
    gl.drawArrays(gl.POINTS, 0, count);
  }
}
```

---

## 7. Interactive Physics, Touch & Game Controls
Maps mouse drags, touch points, and device orientation to physical forces with zero lag.

---

## 8. Generalizing to 2D/3D Games & Simulations
- **Bullet Hell & Projectile Engines**: Pre-allocate 50,000 bullets in flat memory, update in < 0.8ms, stream via one `gl.drawArrays`.
- **Fluid & Smoke Simulations**: Eulerian Navier-Stokes grids with point-sprite or offscreen texture rendering.
- **Spatial Hash Grids**: $O(N)$ uniform cell partitioning for massive collisions.

---

## 9. Production Best Practices & Verification
| Category | Optimization | Why It Matters |
| :--- | :--- | :--- |
| **Memory** | Pre-allocate fixed buffers (`MAX_PARTICLES`) | Eliminates heap allocations and avoids memory leaks. |
| **Zero-Copy** | Use `Float32Array(wasmMemory.buffer, ptr, len)` | Zero garbage collector overhead; data streams directly to GPU. |
| **Packaging** | Base64 embedded WASM | Zero network latency, offline support, immune to CDN 404s. |
| **GPU State** | Minimize WebGL state changes | Keep shaders and buffers bound; single `gl.drawArrays`. |
| **Battery** | Pause loop when tab is hidden | Stop `requestAnimationFrame` on `document.visibilityState === 'hidden'`. |
| **A11y** | Respect `prefers-reduced-motion` | Clamp velocities or provide a static fallback visual. |
