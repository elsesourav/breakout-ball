# WebAssembly (WASM) & WebGL Interactive Graphics & Game Engineering Guide

**Platform:** ElseSourav Interactive Graphics & Game Systems  
**Core Technologies:** C++17, Emscripten 3.1+, WebGL 1.0/2.0, GLSL, TypeScript 5.8+, React 19  

---

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

```bash
emcc engine.cpp \
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
  -o engine.wasm
```

---

## 5. The Zero-Copy TypeScript / WASM Memory Bridge

```typescript
export class GraphicsEngineBridge {
  public getVertexDataView(): { buffer: Float32Array; count: number } {
    const count = this.wasmExports.engine_get_vertex_count(this.enginePtr);
    const ptr = this.wasmExports.engine_get_vertex_buffer(this.enginePtr);
    const floatCount = count * 7;
    const directView = new Float32Array(this.wasmExports.memory.buffer, ptr, floatCount);
    return { buffer: directView, count };
  }
}
```

---

## 6. High-Performance WebGL Point-Sprite Pipeline

- **Vertex Shader**: Converts pixel coordinates to NDC $[-1.0 .. 1.0]$, inverts Y axis, scales `gl_PointSize` with `uDpr`.
- **Fragment Shader**: Discards outside circular radius (`dist > 0.5`) with `smoothstep(0.5, 0.38, dist)` edge falloff.
- **Blending**: `gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)`.

---

## 7. Generalizing to 2D/3D Games & Simulations
1. **Bullet Hell & Projectile Engines**: Pre-allocate C++ pool of 50,000 bullets (`Bullet bullets[50000]`).
2. **Fluid & Smoke Simulations**: Eulerian Navier-Stokes grids rendered via point sprites or offscreen textures.
3. **Spatial Hash Grids**: $O(N)$ collision detection using uniform cells.
