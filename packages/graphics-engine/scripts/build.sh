#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> Compiling C++ to Standalone WebAssembly..."
mkdir -p "$PACKAGE_DIR/src"

emcc "$PACKAGE_DIR/cpp/engine.cpp" \
  -O3 \
  -std=c++17 \
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
  -o "$PACKAGE_DIR/engine.wasm"

echo "==> Embedding WASM binary into TypeScript..."
python3 << 'EOF'
import base64
import os

pkg_dir = os.path.abspath('packages/graphics-engine')
wasm_path = os.path.join(pkg_dir, 'engine.wasm')
out_path = os.path.join(pkg_dir, 'src', 'wasm_binary_bytes.ts')

with open(wasm_path, 'rb') as f:
    raw_wasm = f.read()

b64 = base64.b64encode(raw_wasm).decode('ascii')

header = "// Auto-generated embedded WebAssembly binary\n// Enables 100% offline, zero-network instantaneous initialization\n"
body = f"const WASM_BASE64 = '{b64}';\n"
code = """let cachedBuffer: Uint8Array | null = null;

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
"""

with open(out_path, 'w') as out:
    out.write(header + body + code)

print(f"Done! Successfully packaged {len(raw_wasm)} bytes into TypeScript: {out_path}")
EOF
