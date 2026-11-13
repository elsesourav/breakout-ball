# @elsesourav/graphics-engine

High-Performance WebAssembly (WASM) & WebGL Interactive Graphics & Game Systems.

## Features
- **Standalone WebAssembly (Emscripten)**: `-sSTANDALONE_WASM=1 --no-entry` generating a lean, zero-runtime 9.4 KB binary.
- **Embedded Base64 Delivery**: Zero-network offline loading immune to CDN 404s, CORS hurdles, and bundler path mismatches.
- **Zero-Copy Memory Bridge**: Direct `Float32Array` view over WASM linear memory streamed straight to WebGL with `gl.bufferSubData`.
- **WebGL Point-Sprite Pipeline**: `gl.POINTS` with circular discard fragments and high-fidelity alpha blending.
- **Data-Oriented C++ Physics**: Symplectic Euler Hooke's Law spring oscillator, viscous damping, radial shockwave dispersal, and touch/cursor forces.
- **React Integration**: `<EngineCanvas />` ready to mount with visibility pause and device pixel ratio handling.

## Usage

```tsx
import { EngineCanvas } from '@elsesourav/graphics-engine';

export function InteractiveHero() {
  return (
    <div className="relative w-full h-[500px]">
      <EngineCanvas
        maxParticles={25000}
        onReady={(bridge) => {
          console.log('Graphics engine initialized!');
        }}
      />
    </div>
  );
}
```
