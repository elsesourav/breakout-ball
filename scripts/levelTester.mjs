/**
 * Automated Level Tester & Difficulty Evaluator for Breakout-Ball
 * 
 * Features:
 * 1. Deep Block Geometry & Physics Analysis (HP 1-5, Wall 6, Portal 7, EMP 8)
 * 2. EMP Cascade Shockwave Simulation (2.2x blockWidth radius, 2 damage)
 * 3. Raycast Shielding & Enclosure Matrix
 * 4. Multi-Tier Headless Simulation (Lowest Power vs Balanced Power vs Max Power)
 * 5. Tactical AI: Clear Line-of-Sight, EMP Prioritization, Bank Shots, Top-Corridor Penetration
 * 6. Mathematical & Empirical Difficulty Index (0.00 to 1.00)
 * 7. Time Consumption Estimation (Seconds across lowest, balanced, max power)
 * 8. Score Calculation & Star Benchmarks (1-Star, 2-Star, 3-Star thresholds)
 * 9. Designer Diagnostic Flags (Soft-locks, Choke points, EMP leverage, High Shielding)
 */

import { INITIAL_LOCAL_LEVELS } from './dist/levels.mjs';
import { PhysicsWorld } from './dist/physics.mjs';
import * as fs from 'fs';

// Game Constants (matching src/constants/game.ts)
const CANVAS_WIDTH = 1152;
const CANVAS_HEIGHT = 2048;
const GRID_ROWS = 9;   // 0 to 8
const GRID_COLS = 11;  // 0 to 10
const BLOCK_WIDTH = CANVAS_WIDTH / GRID_ROWS; // 128
const BLOCK_HEIGHT = 128 * 0.75; // 96
const PADDLE_WIDTH = 256;
const PADDLE_HEIGHT = 51.2;
const PADDLE_Y = CANVAS_HEIGHT - 128 * 1.6; // 1843.2
const BALL_RADIUS = 128 * 0.22; // 28.16
const BASE_BALL_SPEED = 15;

/**
 * Power Profiles for Automated Testing
 */
export const POWER_PROFILES = {
  LOWEST: {
    id: 'lowest',
    name: 'Stock Base (Lowest Power / Lvl 1)',
    hitDamage: 1.0,
    critChance: 0.0,
    speedMultiplier: 1.0,
    paddleWidthMultiplier: 1.0,
    powerUpDropChance: 0.0,
    megaBallEnabled: false,
    laserEnabled: false,
    multiBallEnabled: false,
    shieldCharges: 0,
  },
  BALANCED: {
    id: 'balanced',
    name: 'Mid-Tier (Balanced Power / Lvl 5)',
    hitDamage: 1.6,
    critChance: 0.10,
    speedMultiplier: 1.25,
    paddleWidthMultiplier: 1.15,
    powerUpDropChance: 0.30,
    megaBallEnabled: true,
    laserEnabled: true,
    multiBallEnabled: true,
    shieldCharges: 1,
    laserDuration: 9.0,
    megaDuration: 8.0,
  },
  MAXIMUM: {
    id: 'maximum',
    name: 'Overdrive Apex (Max Power / Lvl 10)',
    hitDamage: 2.5,
    critChance: 0.25,
    speedMultiplier: 1.60,
    paddleWidthMultiplier: 1.40, // Titan paddle 358.4px
    powerUpDropChance: 0.40,
    megaBallEnabled: true,
    laserEnabled: true,
    multiBallEnabled: true,
    shieldCharges: 3,
    laserDuration: 16.0,
    megaDuration: 15.0,
  }
};

/**
 * Helper: Check if line of sight is obstructed by an indestructible Titanium Wall (h=6)
 */
function isLineBlockedByWall(x1, y1, x2, y2, walls) {
  for (const w of walls) {
    if (w.isDead) continue;
    const wx1 = w.x - 8;
    const wx2 = w.x + w.w + 8;
    const wy1 = w.y - 8;
    const wy2 = w.y + w.h + 8;

    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    if (wx2 < minX || wx1 > maxX || wy2 < minY || wy1 > maxY) continue;

    const midY = (wy1 + wy2) / 2;
    if (Math.abs(y2 - y1) > 0.001) {
      const t = (midY - y1) / (y2 - y1);
      if (t >= 0.05 && t <= 0.95) {
        const ix = x1 + t * (x2 - x1);
        if (ix >= wx1 && ix <= wx2) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Tactical Target Selector
 */
function selectBestTarget(physics, ballX, walls) {
  const living = physics.blocks.filter(b => !b.isDead && b.health !== 6 && b.health !== 7);
  if (living.length === 0) return null;

  // 1. Prioritize EMP countdown reactors if accessible (deals massive shockwave damage)
  const emps = living.filter(b => b.health === 8);
  for (const emp of emps) {
    const ex = emp.x + emp.w / 2;
    const ey = emp.y + emp.h / 2;
    if (!isLineBlockedByWall(ballX, PADDLE_Y, ex, ey, walls)) {
      return { target: emp, blocked: false };
    }
  }

  // 2. Separate remaining into unblocked vs blocked by walls
  const unblocked = [];
  const blocked = [];

  for (const b of living) {
    const tx = b.x + b.w / 2;
    const ty = b.y + b.h / 2;
    if (isLineBlockedByWall(ballX, PADDLE_Y, tx, ty, walls)) {
      blocked.push(b);
    } else {
      unblocked.push(b);
    }
  }

  if (unblocked.length > 0) {
    // Target the lowest unblocked blocks first (clearing outer shell)
    unblocked.sort((a, b) => b.y - a.y || Math.abs(a.x + a.w / 2 - ballX) - Math.abs(b.x + b.w / 2 - ballX));
    return { target: unblocked[0], blocked: false };
  }

  // All remaining targets are shielded by walls: bank shot needed
  blocked.sort((a, b) => Math.abs(a.x + a.w / 2 - ballX) - Math.abs(b.x + b.w / 2 - ballX));
  return { target: blocked[0], blocked: true };
}

/**
 * 1. STATIC BLOCK & LAYOUT ANALYZER
 */
export function analyzeLevelLayout(blocks) {
  let totalRawHp = 0;
  let breakableCount = 0;
  let wallCount = 0;
  let portalCount = 0;
  let empCount = 0;
  const hpDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
  const colCoords = [];
  const rowCoords = [];

  for (const b of blocks) {
    if (!b || b.h <= 0) continue;
    hpDistribution[b.h] = (hpDistribution[b.h] || 0) + 1;
    colCoords.push(b.x);
    rowCoords.push(b.y);

    if (b.h >= 1 && b.h <= 5) {
      totalRawHp += b.h;
      breakableCount++;
    } else if (b.h === 6) {
      wallCount++;
    } else if (b.h === 7) {
      portalCount++;
    } else if (b.h === 8) {
      totalRawHp += 3;
      breakableCount++;
      empCount++;
    }
  }

  // Calculate EMP Cascade Shockwave Yield
  const blastRadius = BLOCK_WIDTH * 2.2;
  const blastSq = blastRadius * blastRadius;
  let empCascadeYield = 0;
  let empChainedBlocks = 0;

  const empBlocks = blocks.filter(b => b.h === 8);
  for (const emp of empBlocks) {
    const empX = (emp.x + 0.5) * BLOCK_WIDTH;
    const empY = (emp.y + 0.5) * BLOCK_HEIGHT;

    for (const target of blocks) {
      if (target === emp || target.h === 6 || target.h === 7 || target.h <= 0) continue;
      const tx = (target.x + 0.5) * BLOCK_WIDTH;
      const ty = (target.y + 0.5) * BLOCK_HEIGHT;
      const distSq = (tx - empX) ** 2 + (ty - empY) ** 2;

      if (distSq <= blastSq) {
        const dmg = Math.min(2, target.h >= 1 && target.h <= 5 ? target.h : 2);
        empCascadeYield += dmg;
        empChainedBlocks++;
      }
    }
  }

  const effectiveHp = Math.max(1, totalRawHp - Math.round(empCascadeYield * 0.7));

  // Raycast Shielding & Enclosure Matrix
  let totalShieldScore = 0;
  let enclosedCount = 0;

  const breakables = blocks.filter(b => (b.h >= 1 && b.h <= 5) || b.h === 8);
  const walls = blocks.filter(b => b.h === 6);

  for (const b of breakables) {
    let directShielded = false;
    let verticalWallCount = 0;

    for (const w of walls) {
      if (w.x === b.x && w.y > b.y) {
        directShielded = true;
        verticalWallCount++;
      } else if (Math.abs(w.x - b.x) <= 1 && w.y === b.y + 1) {
        verticalWallCount += 0.5;
      }
    }

    if (directShielded) enclosedCount++;
    const blockShieldScore = Math.min(1.0, verticalWallCount * 0.45);
    totalShieldScore += blockShieldScore;
  }

  const shieldingIndex = breakables.length > 0 ? (totalShieldScore / breakables.length) : 0;
  const wallDensity = (breakableCount + wallCount > 0) ? (wallCount / (breakableCount + wallCount)) : 0;
  const portalDisruption = Math.min(1.0, (portalCount / 2) * 0.35);

  const minCol = colCoords.length > 0 ? Math.min(...colCoords) : 0;
  const maxCol = colCoords.length > 0 ? Math.max(...colCoords) : 0;
  const colSpanRatio = (maxCol - minCol + 1) / GRID_ROWS;

  const meanCol = colCoords.length > 0 ? (colCoords.reduce((a, b) => a + b, 0) / colCoords.length) : 4;
  const colStdDev = colCoords.length > 0
    ? Math.sqrt(colCoords.map(x => (x - meanCol) ** 2).reduce((a, b) => a + b, 0) / colCoords.length)
    : 0;
  const spanStress = Math.min(1.0, (colSpanRatio * 0.6) + (colStdDev / 4.0) * 0.4);

  const normHp = Math.min(1.0, effectiveHp / 55);
  const staticDifficulty = Math.min(1.0, Math.max(0.05,
    normHp * 0.35 +
    shieldingIndex * 0.25 +
    wallDensity * 0.15 +
    portalDisruption * 0.10 +
    spanStress * 0.15
  ));

  return {
    totalRawHp,
    effectiveHp,
    breakableCount,
    wallCount,
    portalCount,
    empCount,
    hpDistribution,
    empCascadeYield,
    empChainedBlocks,
    shieldingIndex,
    wallDensity,
    portalDisruption,
    spanStress,
    enclosedCount,
    staticDifficulty
  };
}

/**
 * 2. DYNAMIC HEADLESS SIMULATION ENGINE
 */
export function simulateLevelRun(levelData, powerProfile, maxSimTicks = 60 * 120) {
  const pWidth = PADDLE_WIDTH * powerProfile.paddleWidthMultiplier;
  const bSpeed = BASE_BALL_SPEED * powerProfile.speedMultiplier;

  const physics = new PhysicsWorld({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    paddleWidth: pWidth,
    paddleHeight: PADDLE_HEIGHT,
    ballRadius: BALL_RADIUS,
    ballSpeed: bSpeed,
    blockWidth: BLOCK_WIDTH,
    blockHeight: BLOCK_HEIGHT,
    substeps: 6
  });

  physics.loadBlocks(levelData.blocks);

  physics.isMegaBall = false;
  let activeMegaTimer = 0;
  let activeLaserTimer = 0;
  let laserFireTimer = 0;
  let shieldCharges = powerProfile.shieldCharges;
  physics.hasShield = shieldCharges > 0;

  // Initial Launch: Aim towards target cluster
  const breakableBlocks = physics.blocks.filter(b => !b.isDead && b.health !== 6 && b.health !== 7);
  let targetAngle = (Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1);
  if (breakableBlocks.length > 0) {
    const avgTargetX = breakableBlocks.reduce((sum, b) => sum + b.x + b.w / 2, 0) / breakableBlocks.length;
    const dx = avgTargetX - CANVAS_WIDTH / 2;
    targetAngle = Math.max(-0.85, Math.min(0.85, dx / (CANVAS_WIDTH * 0.55)));
  }

  const vx = Math.sin(targetAngle) * bSpeed;
  const vy = -Math.cos(targetAngle) * bSpeed;
  physics.resetBall(CANVAS_WIDTH / 2, PADDLE_Y - BALL_RADIUS - 5, vx, vy);

  let ticks = 0;
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let blocksDestroyed = 0;
  let paddleHits = 0;
  let ballsLost = 0;
  let lives = 3;
  let empExplosions = 0;
  let wallBounces = 0;
  let portalWarps = 0;
  let lasersFired = 0;
  let laserBlockHits = 0;
  let powerUpsCollected = 0;

  let ticksSinceLastProgress = 0;
  const lasers = [];
  const dt = 1 / 60;

  const initialTotalHp = physics.blocks
    .filter(b => !b.isDead && (b.health >= 1 && b.health <= 5 || b.health === 8))
    .reduce((sum, b) => sum + (b.health === 8 ? 3 : b.health), 0);

  while (physics.remainingBreakable > 0 && ticks < maxSimTicks) {
    ticks++;
    ticksSinceLastProgress++;

    // 1. Buff Timers
    if (activeMegaTimer > 0) {
      activeMegaTimer -= dt;
      physics.isMegaBall = activeMegaTimer > 0;
    }
    if (activeLaserTimer > 0) {
      activeLaserTimer -= dt;
      laserFireTimer += dt;
      if (laserFireTimer >= 0.35) {
        laserFireTimer = 0;
        lasersFired += 2;
        lasers.push(
          { x: physics.paddle.x - pWidth * 0.35, y: physics.paddle.y - 10, vy: -950 },
          { x: physics.paddle.x + pWidth * 0.35, y: physics.paddle.y - 10, vy: -950 }
        );
      }
    }

    // 2. Laser Bolts Update & Hit Test
    for (let l = lasers.length - 1; l >= 0; l--) {
      const bolt = lasers[l];
      bolt.y += bolt.vy * dt;
      if (bolt.y < 0) {
        lasers.splice(l, 1);
        continue;
      }
      for (let b = 0; b < physics.blocks.length; b++) {
        const blk = physics.blocks[b];
        if (blk.isDead || blk.health === 6 || blk.health === 7) continue;
        if (
          bolt.x >= blk.x && bolt.x <= blk.x + blk.w &&
          bolt.y >= blk.y && bolt.y <= blk.y + blk.h
        ) {
          blk.health -= powerProfile.hitDamage;
          laserBlockHits++;
          ticksSinceLastProgress = 0;
          if (blk.health <= 0) {
            blk.isDead = true;
            physics.remainingBreakable = Math.max(0, physics.remainingBreakable - 1);
            blocksDestroyed++;
            combo++;
            if (combo > maxCombo) maxCombo = combo;
            score += 100 * (1 + combo);
          } else {
            score += 50 * (1 + Math.floor(combo / 3));
          }
          lasers.splice(l, 1);
          break;
        }
      }
    }

    // 3. Precision Vector AI Paddle Agent
    const activeBalls = physics.balls.filter(b => b.isActive);
    let targetPaddleX = CANVAS_WIDTH / 2;

    if (activeBalls.length > 0) {
      const fallingBalls = activeBalls.filter(b => b.vy > 0);
      const chosenBall = fallingBalls.length > 0
        ? fallingBalls.reduce((lowest, b) => b.y > lowest.y ? b : lowest, fallingBalls[0])
        : activeBalls[0];

      if (chosenBall.vy > 0 && chosenBall.y < PADDLE_Y) {
        const timeToPaddle = (PADDLE_Y - chosenBall.y) / chosenBall.vy;
        let futureX = chosenBall.x + chosenBall.vx * timeToPaddle;
        const doubleW = CANVAS_WIDTH * 2;
        let modX = futureX % doubleW;
        if (modX < 0) modX += doubleW;
        if (modX > CANVAS_WIDTH) modX = doubleW - modX;
        const ballArrivalX = modX;

        const walls = physics.blocks.filter(b => !b.isDead && b.health === 6);
        const portals = physics.blocks.filter(b => !b.isDead && b.health === 7);
        const targetDecision = selectBestTarget(physics, ballArrivalX, walls);

        let desiredOffset = 0;

        if (targetDecision) {
          const { target, blocked } = targetDecision;
          const tx = target.x + target.w / 2;
          const ty = target.y + target.h / 2;

          let aimX = tx;
          let aimY = ty;

          // If stuck for >1.5s or blocked by walls, execute bank shot or portal warp
          if (blocked || ticksSinceLastProgress > 60 * 1.5) {
            if (portals.length >= 2 && ticksSinceLastProgress <= 60 * 2.5) {
              const bestPortal = portals.slice().sort((pa, pb) => {
                const dpa = (pa.x + pa.w / 2 - ballArrivalX) ** 2 + (pa.y + pa.h / 2 - PADDLE_Y) ** 2;
                const dpb = (pb.x + pb.w / 2 - ballArrivalX) ** 2 + (pb.y + pb.h / 2 - PADDLE_Y) ** 2;
                return dpa - dpb;
              })[0];
              aimX = bestPortal.x + bestPortal.w / 2;
              aimY = bestPortal.y + bestPortal.h / 2;
            } else {
              // Alternate banking left wall vs right wall based on target position and stuck time
              const preferLeft = (ticksSinceLastProgress > 60 * 3.0)
                ? (Math.floor(ticks / 60) % 2 === 0)
                : (ballArrivalX > CANVAS_WIDTH / 2);
              aimX = preferLeft ? -tx : (CANVAS_WIDTH + (CANVAS_WIDTH - tx));
              aimY = ty;
            }
          }

          const dx = aimX - ballArrivalX;
          const dy = PADDLE_Y - aimY;
          const targetAngle = Math.atan2(dx, dy);

          const maxAngleRad = (Math.PI / 180) * 62;
          let offsetRatio = targetAngle / maxAngleRad;

          // Introduce small variation when stuck to break loops
          if (ticksSinceLastProgress > 60 * 2.0) {
            const wobble = Math.sin(ticks * 0.3) * 0.35;
            offsetRatio += wobble;
          }

          offsetRatio = Math.max(-0.88, Math.min(0.88, offsetRatio));
          desiredOffset = offsetRatio * (pWidth / 2);
        }

        targetPaddleX = ballArrivalX - desiredOffset;
      } else {
        if (activeLaserTimer > 0) {
          const living = physics.blocks.filter(b => !b.isDead && b.health !== 6 && b.health !== 7);
          if (living.length > 0) {
            targetPaddleX = living[0].x + living[0].w / 2 + (pWidth * 0.35);
          }
        } else {
          targetPaddleX = chosenBall.x;
        }
      }
    }

    const halfPadW = pWidth / 2;
    targetPaddleX = Math.max(halfPadW, Math.min(CANVAS_WIDTH - halfPadW, targetPaddleX));

    physics.paddle.x = targetPaddleX;
    physics.paddle.targetX = targetPaddleX;
    physics.paddle.vx = 0;

    // 4. Step Physics
    const events = physics.step(6);

    // 5. Process Events
    for (const ev of events) {
      if (ev.type === 'paddle') {
        paddleHits++;
        combo = 0;
      } else if (ev.type === 'wall') {
        wallBounces++;
      } else if (ev.type === 'portal_warp') {
        portalWarps++;
      } else if (ev.type === 'shield_bounce') {
        shieldCharges = Math.max(0, shieldCharges - 1);
        physics.hasShield = shieldCharges > 0;
      } else if (ev.type === 'emp_explode') {
        empExplosions++;
        score += 500;
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        ticksSinceLastProgress = 0;
      } else if (ev.type === 'block_damage') {
        ticksSinceLastProgress = 0;
        const blk = physics.blocks[ev.blockIndex];
        if (blk && !blk.isDead && (blk.health >= 1 && blk.health <= 5)) {
          const extraDmg = powerProfile.hitDamage - 1.0;
          if (extraDmg > 0) {
            blk.health = Math.max(0, blk.health - extraDmg);
            if (blk.health <= 0) {
              blk.isDead = true;
              physics.remainingBreakable = Math.max(0, physics.remainingBreakable - 1);
              blocksDestroyed++;
              combo++;
              if (combo > maxCombo) maxCombo = combo;
              score += 100 * (1 + combo);
            }
          }
          if (Math.random() < powerProfile.critChance) {
            score += 250;
            const adj = physics.blocks.find(o => !o.isDead && o.health >= 1 && o.health <= 5 && Math.abs(o.col - blk.col) <= 1 && Math.abs(o.row - blk.row) <= 1);
            if (adj) {
              adj.health--;
              if (adj.health <= 0) {
                adj.isDead = true;
                physics.remainingBreakable = Math.max(0, physics.remainingBreakable - 1);
                blocksDestroyed++;
              }
            }
          }
        }
        combo = ev.combo;
        if (combo > maxCombo) maxCombo = combo;
        score += 50 * (1 + Math.floor(combo / 3));
      } else if (ev.type === 'block_destroy') {
        ticksSinceLastProgress = 0;
        blocksDestroyed++;
        combo = ev.combo;
        if (combo > maxCombo) maxCombo = combo;
        score += 100 * (1 + combo);

        // Power-Up Drops
        if (Math.random() < powerProfile.powerUpDropChance) {
          powerUpsCollected++;
          const roll = Math.random();
          if (roll < 0.25 && powerProfile.megaBallEnabled) {
            activeMegaTimer = powerProfile.megaDuration;
            physics.isMegaBall = true;
          } else if (roll < 0.50 && powerProfile.laserEnabled) {
            activeLaserTimer = powerProfile.laserDuration;
          } else if (roll < 0.75 && powerProfile.multiBallEnabled && physics.balls.length < 5) {
            physics.spawnExtraBalls();
          } else if (powerProfile.shieldCharges > 0 && shieldCharges <= 0) {
            shieldCharges = 1;
            physics.hasShield = true;
          }
        }
      } else if (ev.type === 'ball_lost') {
        ballsLost++;
        lives--;
        combo = 0;
        if (lives > 0) {
          const newAngle = (Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1);
          physics.resetBall(physics.paddle.x, PADDLE_Y - BALL_RADIUS - 5, Math.sin(newAngle) * bSpeed, -Math.cos(newAngle) * bSpeed);
        }
      }
    }

    const livingBreakables = physics.blocks.filter(b => !b.isDead && ((b.health >= 1 && b.health <= 5) || b.health === 8));
    if (livingBreakables.length === 0 || physics.remainingBreakable <= 0) {
      physics.remainingBreakable = 0;
      break;
    }

    if (lives <= 0) break;
  }

  let rawTimeUsed = ticks / 60;
  const isWin = physics.remainingBreakable <= 0;

  // Realistic Projected Time if simulation was cut off by maxSimTicks
  let estimatedCompletionTime = rawTimeUsed;
  if (!isWin) {
    const currentHp = physics.blocks
      .filter(b => !b.isDead && (b.health >= 1 && b.health <= 5 || b.health === 8))
      .reduce((sum, b) => sum + (b.health === 8 ? 3 : b.health), 0);
    const hpCleared = initialTotalHp - currentHp;
    if (hpCleared > 0) {
      const pace = rawTimeUsed / hpCleared;
      estimatedCompletionTime = Math.min(180, parseFloat((rawTimeUsed + currentHp * pace * 1.2).toFixed(1)));
    } else {
      estimatedCompletionTime = 180.0;
    }
  }

  if (isWin) {
    const timeBonus = Math.max(0, Math.floor(1000 - rawTimeUsed * 25));
    const lifeBonus = lives * 250;
    score += timeBonus + lifeBonus;
  } else {
    // Partial score for damage dealt
    score += Math.round((initialTotalHp - physics.remainingBreakable) * 150);
  }

  return {
    isWin,
    timeUsed: parseFloat(estimatedCompletionTime.toFixed(1)),
    rawTime: parseFloat(rawTimeUsed.toFixed(1)),
    ticks,
    score,
    maxCombo,
    blocksDestroyed,
    remainingBreakable: physics.remainingBreakable,
    remainingBlocks: physics.blocks.filter(b => !b.isDead && b.health !== 6 && b.health !== 7).map(b => ({ col: b.col, row: b.row, health: b.health })),
    paddleHits,
    ballsLost,
    empExplosions,
    powerUpsCollected
  };
}

/**
 * 3. COMPREHENSIVE LEVEL TEST SUITE
 */
export function testLevelComprehensive(levelData, iterations = 3) {
  const layout = analyzeLevelLayout(levelData.blocks);

  const runProfile = (profile) => {
    const results = [];
    for (let i = 0; i < iterations; i++) {
      results.push(simulateLevelRun(levelData, profile));
    }
    const wins = results.filter(r => r.isWin);
    const avgTime = results.reduce((acc, r) => acc + r.timeUsed, 0) / results.length;
    const avgScore = Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length);
    const avgCombo = Math.round(results.reduce((acc, r) => acc + r.maxCombo, 0) / results.length);
    const winRate = wins.length / results.length;
    const avgHits = Math.round(results.reduce((acc, r) => acc + r.paddleHits, 0) / results.length);

    return {
      profileId: profile.id,
      profileName: profile.name,
      avgTime: parseFloat(avgTime.toFixed(1)),
      avgScore,
      avgCombo,
      avgHits,
      winRate
    };
  };

  const lowest = runProfile(POWER_PROFILES.LOWEST);
  const balanced = runProfile(POWER_PROFILES.BALANCED);
  const maximum = runProfile(POWER_PROFILES.MAXIMUM);

  // Power Acceleration & Sensitivity
  const powerSpeedupPct = lowest.avgTime > 0
    ? parseFloat((((lowest.avgTime - maximum.avgTime) / lowest.avgTime) * 100).toFixed(1))
    : 0;

  // Dynamic Difficulty Component (based on lowest power clear time and workload)
  const normTime = Math.min(1.0, lowest.avgTime / 100);
  const normHits = Math.min(1.0, lowest.avgHits / 50);
  const simDifficulty = normTime * 0.65 + normHits * 0.35;

  // Final Blended Difficulty (50% Static Geometry + 50% Dynamic Simulation)
  const finalDifficulty = parseFloat(
    Math.min(0.99, Math.max(0.05, (layout.staticDifficulty * 0.50 + simDifficulty * 0.50))).toFixed(2)
  );

  // Par Times for Developers
  const parGoldTime = parseFloat((maximum.avgTime * 1.15).toFixed(1));
  const parSilverTime = parseFloat((balanced.avgTime * 1.10).toFixed(1));
  const parBronzeTime = parseFloat((lowest.avgTime * 1.10).toFixed(1));

  // Star Score Thresholds
  const star1Score = Math.round(lowest.avgScore * 0.85);
  const star2Score = Math.round(balanced.avgScore);
  const star3Score = Math.round(maximum.avgScore * 1.05);

  // Diagnostic Flags & Balancing Advice
  const flags = [];
  if (layout.breakableCount === 0) {
    flags.push('CRITICAL: No breakable blocks present.');
  }
  if (layout.shieldingIndex > 0.50) {
    flags.push('HIGH SHIELDING: Breakables heavily fortified behind walls; high player frustration risk.');
  }
  if (layout.wallCount > 0 && layout.wallDensity > 0.30) {
    flags.push('HIGH WALL DENSITY: Wall ricochets dominate over core block strikes.');
  }
  if (layout.empCount > 0 && layout.empCascadeYield === 0) {
    flags.push('WASTED EMP: EMP Reactor has zero breakables in shockwave blast radius.');
  }
  if (lowest.avgTime > 80) {
    flags.push('HIGH ENDURANCE: Level takes >80s on base gear; consider reducing brick HP or adding EMP.');
  }
  if (powerSpeedupPct > 65) {
    flags.push('OVERDRIVE FAVORED: High power sensitivity; max armory shreds this level >2.5x faster.');
  }

  return {
    id: levelData.id,
    name: levelData.name || `Level ${levelData.id}`,
    layout,
    difficulty: finalDifficulty,
    parTimes: {
      gold: parGoldTime,
      silver: parSilverTime,
      bronze: parBronzeTime
    },
    scores: {
      lowest: lowest.avgScore,
      balanced: balanced.avgScore,
      maximum: maximum.avgScore,
      star1: star1Score,
      star2: star2Score,
      star3: star3Score
    },
    performance: {
      lowest,
      balanced,
      maximum,
      powerSpeedupPct
    },
    flags
  };
}

/**
 * 4. BATCH TEST ALL LEVELS & GENERATE SUMMARY
 */
export function runAllLevelTests() {
  console.log('===============================================================');
  console.log('🤖 CYBER BREAKOUT: AUTOMATED LEVEL TESTER & DIFFICULTY PROFILER');
  console.log('===============================================================\n');

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < INITIAL_LOCAL_LEVELS.length; i++) {
    const level = INITIAL_LOCAL_LEVELS[i];
    process.stdout.write(`Evaluating Level ${level.id.padStart(2, '0')}: ${(level.name || '').padEnd(26)} ... `);
    const testRes = testLevelComprehensive(level, 3);
    results.push(testRes);
    console.log(`Diff: ${(testRes.difficulty * 100).toFixed(0)}% | Time: ${testRes.performance.lowest.avgTime}s -> ${testRes.performance.maximum.avgTime}s | Speedup: +${testRes.performance.powerSpeedupPct}%`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\nCompleted batch testing across ${results.length} levels in ${elapsed}s.\n`);

  fs.writeFileSync('./scripts/level-test-results.json', JSON.stringify(results, null, 2));
  console.log('Results written to ./scripts/level-test-results.json');

  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  if (arg && arg !== 'all') {
    const lvl = INITIAL_LOCAL_LEVELS.find(l => l.id === arg || (l.name && l.name.toLowerCase().includes(arg.toLowerCase())));
    if (lvl) {
      console.log(`\n===============================================================`);
      console.log(`🔍 DETAILED LEVEL TEST: ${lvl.name} (ID: ${lvl.id})`);
      console.log(`===============================================================\n`);
      const res = testLevelComprehensive(lvl, 5);
      console.log(`Layout Summary:`);
      console.log(`  - Raw HP: ${res.layout.totalRawHp} | Effective HP: ${res.layout.effectiveHp}`);
      console.log(`  - Breakable Bricks: ${res.layout.breakableCount} (HP Breakdown: ${JSON.stringify(res.layout.hpDistribution)})`);
      console.log(`  - Titanium Walls: ${res.layout.wallCount} (Density: ${(res.layout.wallDensity * 100).toFixed(1)}%)`);
      console.log(`  - Portals: ${res.layout.portalCount} | EMP Reactors: ${res.layout.empCount} (Blast Yield: ${res.layout.empCascadeYield} dmg)`);
      console.log(`  - Shielding Index: ${(res.layout.shieldingIndex * 100).toFixed(1)}% | Enclosed Behind Walls: ${res.layout.enclosedCount}`);
      console.log(`\nDifficulty & Scoring:`);
      console.log(`  - Calculated Difficulty: ${(res.difficulty * 100).toFixed(1)}% (Scale: 0.00 to 1.00)`);
      console.log(`  - Par Times: Gold ${res.parTimes.gold}s | Silver ${res.parTimes.silver}s | Bronze ${res.parTimes.bronze}s`);
      console.log(`  - Star Scores: 1-Star ${res.scores.star1} | 2-Star ${res.scores.star2} | 3-Star ${res.scores.star3}`);
      console.log(`\nPower Profiles Performance:`);
      console.log(`  - Lowest Power (Stock Base): ${res.performance.lowest.avgTime}s | Score: ${res.performance.lowest.avgScore} | Max Combo: ${res.performance.lowest.avgCombo}x`);
      console.log(`  - Balanced Power (Mid-Tier): ${res.performance.balanced.avgTime}s | Score: ${res.performance.balanced.avgScore} | Max Combo: ${res.performance.balanced.avgCombo}x`);
      console.log(`  - Max Power (Overdrive):     ${res.performance.maximum.avgTime}s | Score: ${res.performance.maximum.avgScore} | Max Combo: ${res.performance.maximum.avgCombo}x`);
      console.log(`  - Power Sensitivity Speedup: +${res.performance.powerSpeedupPct}%`);
      if (res.flags.length > 0) {
        console.log(`\n⚠️  Designer Diagnostic Flags:`);
        res.flags.forEach(f => console.log(`  • ${f}`));
      }
      console.log('\n');
    } else {
      console.log(`Level "${arg}" not found. Running batch test across all 30 levels...`);
      runAllLevelTests();
    }
  } else {
    runAllLevelTests();
  }
}
