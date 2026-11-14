#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CPP_DIR="$DIR/../cpp"

echo "Compiling Standalone C++ WebAssembly Physics Engine..."

em++ -std=c++14 -O3 -sSTANDALONE_WASM=1 --no-entry \
  -Wl,--export=engine_init \
  -Wl,--export=engine_load_blocks \
  -Wl,--export=engine_reset_ball \
  -Wl,--export=engine_set_paddle_pos \
  -Wl,--export=engine_update \
  -Wl,--export=engine_get_ball_state \
  -Wl,--export=engine_get_paddle_state \
  -Wl,--export=engine_get_block_count \
  -Wl,--export=engine_get_block_state \
  -Wl,--export=engine_get_remaining_breakable \
  -Wl,--export=engine_get_combo \
  -Wl,--export=engine_get_events \
  -Wl,--export=malloc \
  -Wl,--export=free \
  -o "$DIR/physics.wasm" \
  "$CPP_DIR/physics.cpp" "$CPP_DIR/engine.cpp"

echo "Packing WASM binary into TypeScript Base64 module..."
node -e '
const fs = require("fs");
const wasm = fs.readFileSync("'"$DIR"'/physics.wasm");
const b64 = wasm.toString("base64");
const content = `// Auto-generated standalone WebAssembly binary
// Size: ${wasm.length} bytes

export const PHYSICS_WASM_BASE64 = "${b64}";

export function getPhysicsWasmBytes(): Uint8Array {
  const binary = atob(PHYSICS_WASM_BASE64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
`;
fs.writeFileSync("'"$DIR"'/physics_wasm_bytes.ts", content);
console.log("Successfully generated physics_wasm_bytes.ts");
'

echo "Done!"
