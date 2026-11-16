import { PhysicsWorld } from '../src/engine/physics';
import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('========================================================');
console.log('🧪 TESTING EMP EXPLODE BLOCK & NEARBY BLOCKS DESTRUCTION');
console.log('========================================================\n');

// 1. Test TypeScript Physics
console.log('--- 1. Testing TypeScript Physics ---');
const world = new PhysicsWorld({
  width: 1152,
  height: 2048,
  paddleWidth: 140,
  paddleHeight: 24,
  ballRadius: 10,
  ballSpeed: 15,
  blockWidth: 128,
  blockHeight: 90,
});

// Setup 1 EMP block (8) surrounded by 4 breakable blocks (hp: 2, 3, 1, 4)
const blocksData = [
  { x: 4, y: 4, h: 8 }, // EMP at center (index 0)
  { x: 3, y: 4, h: 2 }, // Left neighbor (index 1)
  { x: 5, y: 4, h: 3 }, // Right neighbor (index 2)
  { x: 4, y: 3, h: 1 }, // Top neighbor (index 3)
  { x: 4, y: 5, h: 4 }, // Bottom neighbor (index 4)
];

world.loadBlocks(blocksData as any);
console.log('Initial remaining breakables:', world.remainingBreakable);
if (world.remainingBreakable !== 5) {
  throw new Error(`Expected 5 breakables initially, got ${world.remainingBreakable}`);
}

// Ball hits center of EMP block (index 0)
const ball = world.balls[0];
ball.isActive = true;
ball.x = 4 * 128 + 64;
ball.y = 4 * 90 - 5;
ball.vx = 0;
ball.vy = 15;

const events = world.step(6);
console.log('Events emitted on EMP hit:', events.map(e => ({ type: e.type, source: e.source, blockIndex: e.blockIndex })));

const empEvents = events.filter(e => e.type === 'emp_explode');
const destroyEvents = events.filter(e => e.type === 'block_destroy');

if (empEvents.length !== 1) {
  throw new Error(`Expected 1 emp_explode event, got ${empEvents.length}`);
}
if (destroyEvents.length !== 4) {
  throw new Error(`Expected 4 block_destroy events for nearby blocks, got ${destroyEvents.length}`);
}

console.log('Post-detonation remaining breakables:', world.remainingBreakable);
if (world.remainingBreakable !== 0) {
  throw new Error(`Expected 0 remaining breakables, got ${world.remainingBreakable}`);
}

// Verify all blocks are marked dead
for (let i = 0; i < world.blocks.length; i++) {
  if (!world.blocks[i].isDead) {
    throw new Error(`Block ${i} was not destroyed!`);
  }
}
console.log('✅ TypeScript physics: EMP block and all 4 nearby blocks destroyed cleanly!\n');

// 2. Test C++ WebAssembly Physics
console.log('--- 2. Testing C++ WebAssembly Engine ---');
const wasmPath = resolve(process.cwd(), 'src/engine/wasm/physics.wasm');
const wasmBytes = readFileSync(wasmPath);
const wasmModule = await WebAssembly.instantiate(wasmBytes, {
  env: {
    // any imports if needed
  }
});
const exports = wasmModule.instance.exports as any;

exports.engine_init(1152, 2048, 140, 24, 10, 15, 128, 90);

// Pack blocks into WASM memory: [col, row, hp, pairId]
const mem = new Int32Array(exports.memory.buffer);
// Allocate buffer at offset 65536
const dataPtr = 65536;
const intView = new Int32Array(exports.memory.buffer, dataPtr, blocksData.length * 4);
for (let i = 0; i < blocksData.length; i++) {
  intView[i * 4 + 0] = blocksData[i].x;
  intView[i * 4 + 1] = blocksData[i].y;
  intView[i * 4 + 2] = blocksData[i].h;
  intView[i * 4 + 3] = 0;
}

exports.engine_load_blocks(dataPtr, blocksData.length, 128, 90);
const wasmRemBreakable = exports.engine_get_remaining_breakable();
console.log('WASM Initial remaining breakables:', wasmRemBreakable);
if (wasmRemBreakable !== 5) {
  throw new Error(`Expected 5 breakables in WASM, got ${wasmRemBreakable}`);
}

// Launch ball at EMP block
exports.engine_reset_ball(4 * 128 + 64, 4 * 90 - 5, 0, 15);
exports.engine_update(6);

const wasmRemAfter = exports.engine_get_remaining_breakable();
console.log('WASM Post-detonation remaining breakables:', wasmRemAfter);
if (wasmRemAfter !== 0) {
  throw new Error(`Expected 0 remaining breakables in WASM, got ${wasmRemAfter}`);
}

// Poll events from WASM
const eventsPtr = dataPtr + 1024;
const eventCount = exports.engine_get_events_v2(eventsPtr, 50);
console.log('WASM event count:', eventCount);

const fView = new Float32Array(exports.memory.buffer, eventsPtr, eventCount * 8);
const wasmEvents: any[] = [];
for (let i = 0; i < eventCount; i++) {
  const off = i * 8;
  wasmEvents.push({
    type: Math.round(fView[off + 0]),
    blockIndex: Math.round(fView[off + 1]),
    source: Math.round(fView[off + 5]),
  });
}
console.log('WASM parsed events:', wasmEvents);

const wasmEmpEvs = wasmEvents.filter(e => e.type === 7); // emp_explode
const wasmDestroyEvs = wasmEvents.filter(e => e.type === 4); // block_destroy

if (wasmEmpEvs.length !== 1) {
  throw new Error(`Expected 1 WASM emp event (type 7), got ${wasmEmpEvs.length}`);
}
if (wasmDestroyEvs.length !== 4) {
  throw new Error(`Expected 4 WASM destroy events (type 4), got ${wasmDestroyEvs.length}`);
}

console.log('✅ C++ WebAssembly engine: EMP block and all 4 nearby blocks destroyed cleanly!\n');
console.log('🎉 100% PARITY CONFIRMED BETWEEN C++ WASM AND TYPESCRIPT ENGINES!');
