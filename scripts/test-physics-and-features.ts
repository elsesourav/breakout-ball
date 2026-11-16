import { POWER_UPGRADES, BALL_UPGRADES } from '../src/constants/upgrades';
import { PowerUpManager } from '../src/engine/powerUps';
import { calculateTrajectoryGuideline, getTrajectoryMaxDistance } from '../src/engine/trajectoryGuideline';
import { PhysicsWorld } from '../src/engine/physics';
import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('========================================================');
console.log('🧪 VERIFYING USER REQUIREMENTS');
console.log('========================================================\n');

// 1. VERIFY SHIELD DURATION (2x default, 3x max)
console.log('--- 1. Shield Power Duration ---');
const shieldDef = POWER_UPGRADES.find(p => p.id === 'shield_power');
if (!shieldDef) throw new Error('shield_power not found');

console.log('Shield Level 1 Stat Label:', shieldDef.statLabel(1));
console.log('Shield Level 4 (Max) Stat Label:', shieldDef.statLabel(4));

if (!shieldDef.statLabel(1).includes('16.0s')) {
  throw new Error(`Expected default shield duration 16.0s (2x of 8.0s), got: ${shieldDef.statLabel(1)}`);
}
if (!shieldDef.statLabel(4).includes('48.0s')) {
  throw new Error(`Expected max shield duration 48.0s (3x of 16.0s), got: ${shieldDef.statLabel(4)}`);
}
console.log('✅ Shield Upgrade Definition: Default 16.0s (2x), Max 48.0s (3x default).\n');

// Verify in PowerUpManager
const pum = new PowerUpManager();
if (pum.maxDurations.shield !== 16.0) {
  throw new Error(`Expected PowerUpManager.maxDurations.shield to be 16.0, got: ${pum.maxDurations.shield}`);
}
console.log('✅ PowerUpManager defaults: shield duration = 16.0s.\n');

// 2. VERIFY TRAJECTORY MATRIX DISTANCE (slide more default, 3x max)
console.log('--- 2. Trajectory Matrix Distance ---');
const trajDef = BALL_UPGRADES.find(b => b.id === 'ball_trajectory');
if (!trajDef) throw new Error('ball_trajectory not found');

const d1 = getTrajectoryMaxDistance(1);
const d8 = getTrajectoryMaxDistance(8);
console.log('Level 1 Max Distance:', d1, 'px (Label:', trajDef.statLabel(1), ')');
console.log('Level 8 Max Distance:', d8, 'px (Label:', trajDef.statLabel(8), ')');

if (d1 !== 600) throw new Error(`Expected Level 1 distance 600px, got ${d1}`);
if (d8 !== 1800) throw new Error(`Expected Level 8 distance 1800px (3x 600), got ${d8}`);
if (d8 !== d1 * 3) throw new Error(`Expected Level 8 to be exactly 3x Level 1 (${d1 * 3}), got ${d8}`);
console.log('✅ Trajectory Matrix: Default 600px, Max 1800px (3x default).\n');

// 3. VERIFY TRAJECTORY GUIDELINE FADE BEHAVIOR (slowly visible, slowly disappear)
console.log('--- 3. Trajectory Guideline Smooth Fade ---');
const paddle = { x: 576, y: 1843, width: 140, height: 24, vx: 0 };
const ballDescending = { isActive: true, x: 576, y: 1400, vx: 100, vy: 600, radius: 10, speed: 720 };

// Step 1: Start at alpha 0, descending into 600px range (distToPaddle = 1843 - 10 - 1400 = 433px < 600px)
const step1 = calculateTrajectoryGuideline(ballDescending, paddle, 1152, 2048, 1, 0.0, 1/60);
console.log('Fade In Step 1 Alpha (from 0):', step1.nextFadeAlpha.toFixed(4));
if (step1.nextFadeAlpha <= 0 || step1.nextFadeAlpha >= 1.0) {
  throw new Error('Expected gradual fade in');
}

// Step 2: Next frame fades in higher
const step2 = calculateTrajectoryGuideline(ballDescending, paddle, 1152, 2048, 1, step1.nextFadeAlpha, 1/60);
console.log('Fade In Step 2 Alpha:', step2.nextFadeAlpha.toFixed(4));
if (step2.nextFadeAlpha <= step1.nextFadeAlpha) {
  throw new Error('Alpha should increase as ball approaches');
}

// Step 3: Ball moving away from paddle (vy = -600): should slowly dissolve
const ballAscending = { isActive: true, x: 576, y: 1400, vx: 100, vy: -600, radius: 10, speed: 720 };
const fadeOut1 = calculateTrajectoryGuideline(ballAscending, paddle, 1152, 2048, 1, 0.8, 1/60);
console.log('Fade Out Step 1 Alpha (from 0.8):', fadeOut1.nextFadeAlpha.toFixed(4));
if (fadeOut1.nextFadeAlpha >= 0.8 || fadeOut1.nextFadeAlpha <= 0.0) {
  throw new Error('Expected smooth dissolution when moving away from paddle');
}
console.log('✅ Trajectory Guideline: Smooth gradual fade-in and slow dissolution verified.\n');

// 4. VERIFY PORTAL COOLDOWN PASS-THROUGH (Acts like nothing during cooldown)
console.log('--- 4. Portal Cooldown Pass-Through ---');
const world = new PhysicsWorld({
  width: 1152,
  height: 2048,
  paddleWidth: 140,
  paddleHeight: 24,
  ballRadius: 10,
  ballSpeed: 15,
  blockWidth: 128,
  blockHeight: 64,
});

// Setup 2 portal blocks (type 7)
const blocksData = [
  { x: 2, y: 5, h: 7 }, // Portal A at col 2, row 5
  { x: 6, y: 5, h: 7 }, // Portal B at col 6, row 5
];
world.loadBlocks(blocksData as any);
console.log('Loaded blocks:', world.blocks.map(b => ({ x: b.x, y: b.y, h: b.health, pair: b.portalPairIndex })));

// Test A: Normal Portal touch (portalRechargeTimer == 0) -> WARP
const ballA = world.balls[0];
ballA.isActive = true;
ballA.x = 256 + 64; // Center of Portal A
ballA.y = 310;
ballA.vx = 0;
ballA.vy = 15;
world.step(6); // Step physics

// Ball should have warped to Portal B vicinity
console.log('After touching active portal: Ball position:', ballA.x, ballA.y);
if (Math.abs(ballA.x - (768 + 64)) > 30) {
  throw new Error(`Expected ball to warp to Portal B (x~832), got x=${ballA.x}`);
}
console.log('Portal A recharge timer after warp:', world.blocks[0].portalRechargeTimer);
if ((world.blocks[0].portalRechargeTimer ?? 0) <= 0) {
  throw new Error('Expected portal to be in cooldown after warp');
}
console.log('✅ Active portal warps ball properly.\n');

// Test B: Portal in cooldown (portalRechargeTimer > 0) -> PASS RIGHT THROUGH (acts like nothing!)
// Move ball directly towards Portal A while it is in cooldown
world.blocks[0].portalRechargeTimer = 100;
ballA.warpCooldown = 0;
ballA.x = 256 + 64; // Center of Portal A
ballA.y = 310;      // Just above Portal A
ballA.vx = 0;
ballA.vy = 15;     // Moving straight down through Portal A

const initialVy = ballA.vy;
world.step(6); // Step physics through Portal A

console.log('After passing portal in cooldown: Ball y:', ballA.y, 'vy:', ballA.vy);
if (ballA.vy !== initialVy) {
  throw new Error(`Portal in cooldown deflected the ball! vy changed from ${initialVy} to ${ballA.vy}`);
}
if (ballA.y <= 300) {
  throw new Error(`Ball did not advance through portal in cooldown! y=${ballA.y}`);
}
console.log('✅ Portal in cooldown acts like NOTHING (ball passes straight through without bouncing).\n');

// 5. VERIFY C++ WEBASSEMBLY ENGINE BINARY
console.log('--- 5. WebAssembly Binary & Symbol Verification ---');
const wasmPath = resolve(process.cwd(), 'src/engine/wasm/physics.wasm');
const wasmBytes = readFileSync(wasmPath);
console.log('physics.wasm size:', wasmBytes.length, 'bytes');
if (wasmBytes.length < 20000) throw new Error('WASM binary seems truncated');

const wasmModule = await WebAssembly.compile(wasmBytes);
const imports = WebAssembly.Module.imports(wasmModule);
const exports = WebAssembly.Module.exports(wasmModule);

console.log('Exported WASM functions count:', exports.length);
const exportedNames = new Set(exports.map(e => e.name));
[
  'engine_init',
  'engine_load_blocks',
  'engine_pair_portals',
  'engine_reset_ball',
  'engine_set_paddle_pos',
  'engine_set_modifiers',
  'engine_update',
  'engine_get_ball_count',
  'engine_get_ball_states',
  'engine_get_paddle_state',
  'engine_get_block_count',
  'engine_get_block_states',
  'engine_get_remaining_breakable',
  'engine_get_combo',
  'engine_get_events_v2',
].forEach(fn => {
  if (!exportedNames.has(fn)) throw new Error(`Missing WASM export: ${fn}`);
});
console.log('✅ WebAssembly physics binary compiled and all native C-ABI exports verified.\n');

console.log('🎉 ALL REQUIREMENTS FULLY VERIFIED AND WORKING 100%!');
