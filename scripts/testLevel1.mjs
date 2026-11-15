import { INITIAL_LOCAL_LEVELS } from './dist/levels.mjs';
import { PhysicsWorld } from './dist/physics.mjs';

const level1 = INITIAL_LOCAL_LEVELS[0];
console.log('Testing Level 1:', level1.name, 'Blocks:', level1.blocks.length);

const physics = new PhysicsWorld({
  width: 1152,
  height: 2048,
  paddleWidth: 256,
  paddleHeight: 51.2,
  ballRadius: 28.16,
  ballSpeed: 15,
  blockWidth: 128,
  blockHeight: 96,
  substeps: 6
});

physics.loadBlocks(level1.blocks);
console.log('Remaining breakable blocks:', physics.remainingBreakable);

// Launch ball
const angle = (Math.PI / 4);
const vx = Math.sin(angle) * 15;
const vy = -Math.cos(angle) * 15;
physics.resetBall(1152 / 2, 1843 - 35, vx, vy);

let ticks = 0;
let eventsCount = 0;
const maxTicks = 60 * 120; // 120 seconds max

while (physics.remainingBreakable > 0 && ticks < maxTicks) {
  // Simple AI paddle tracking
  const activeBalls = physics.balls.filter(b => b.isActive);
  if (activeBalls.length > 0) {
    const ball = activeBalls[0];
    // If falling, track target x
    physics.setPaddleTarget(ball.x);
  }

  const events = physics.step(6);
  if (events.length > 0) {
    eventsCount += events.length;
    for (const ev of events) {
      if (ev.type === 'ball_lost') {
        // relaunch
        physics.resetBall(physics.paddle.x, 1843 - 35, (Math.random() > 0.5 ? 1 : -1) * 10, -11);
      }
    }
  }
  ticks++;
}

console.log(`Simulation finished in ${ticks} ticks (${(ticks / 60).toFixed(2)}s). Remaining blocks: ${physics.remainingBreakable}, Total collision events: ${eventsCount}`);
