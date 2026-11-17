/**
 * Armory Paddle Upgrade Live Preview Renderers
 * Provides real-time looping canvas animations for Paddle Width and Speed.
 */

import { drawPaddleWithPreset } from '../../../engine/draw/paddleDrawers';

/**
 * 1. Paddle Width Comparison Preview (Current vs Upgraded Wing Extension)
 * Scaled precisely to fit within the 160px preview boundaries.
 * Strictly width extension only — zero fire thrusters.
 */
export function renderPaddleWidthPreview(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  currentLevel: number,
  isMax: boolean,
  tick: number
): void {
  const leftCenterX = w * 0.25;
  const rightCenterX = w * 0.75;
  const centerY = h * 0.52;

  // Clean proportional width that never clips preview borders or overlaps the divider
  const curW = 44 + (currentLevel - 1) * 3.5;
  const targetNextW = 44 + (isMax ? currentLevel - 1 : currentLevel) * 3.5;

  // Cycle: 2.2s expansion animation + 1.4s rest gap = 3.6s
  const cycleTotal = 3.6;
  const cycleT = tick % cycleTotal;
  const isExpanding = cycleT < 2.2;
  const expandProg = isExpanding ? Math.min(1, cycleT / 1.6) : 1.0;
  const nextW = curW + (targetNextW - curW) * expandProg;

  // Left: CURRENT Paddle (speedLevel: 1 -> Cold idle nozzles, NO fire)
  drawPaddleWithPreset(
    ctx,
    { x: leftCenterX, y: centerY, width: curW, height: 14, vx: 0, targetX: leftCenterX },
    1,
    {
      animTick: tick,
      widthLevel: currentLevel,
      speedLevel: 1,
    }
  );

  // Right: UPGRADED Paddle with Wingtip Extension Bracket
  drawPaddleWithPreset(
    ctx,
    { x: rightCenterX, y: centerY, width: nextW, height: 14, vx: 0, targetX: rightCenterX },
    1,
    {
      animTick: tick,
      widthLevel: isMax ? currentLevel : currentLevel + 1,
      speedLevel: 1,
    }
  );

  // Green Extension Bracket Lines indicating added width
  ctx.save();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  const leftWing = rightCenterX - nextW / 2;
  const rightWing = rightCenterX + nextW / 2;
  ctx.beginPath();
  ctx.moveTo(leftWing, centerY - 12);
  ctx.lineTo(leftWing, centerY + 12);
  ctx.moveTo(rightWing, centerY - 12);
  ctx.lineTo(rightWing, centerY + 12);
  ctx.stroke();

  if (!isExpanding) {
    // During 1.4s resting gap: show clear measurement lock indicator
    ctx.font = 'bold 8px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#34d399';
    ctx.fillText('MAX SPAN', rightCenterX, centerY - 16);
  }
  ctx.restore();
}

/**
 * 2. Paddle Speed Comparison Preview (Sprint Agility Test with 1.4s Resting Gap)
 * Demonstrates speed acceleration and upgraded fire exhaust plumes.
 */
export function renderPaddleSpeedPreview(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  currentLevel: number,
  isMax: boolean,
  tick: number
): void {
  const leftCenterX = w * 0.25;
  const rightCenterX = w * 0.75;
  const centerY = h * 0.50;

  // Sprint Cycle: 2.8s sprint + 1.4s resting gap at center = 4.2s total
  const cycleTotal = 4.2;
  const cycleT = tick % cycleTotal;
  const isSprinting = cycleT < 2.8;

  const glideSpan = 24; // Controlled glide that stays comfortably within lane
  let leftOffset = 0;
  let rightOffset = 0;

  if (isSprinting) {
    const curSpeed = 1.0 + (currentLevel - 1) * 0.12;
    const nextSpeed = 1.0 + (isMax ? currentLevel - 1 : currentLevel) * 0.12;
    leftOffset = Math.sin(cycleT * curSpeed * 2.2) * glideSpan;
    rightOffset = Math.sin(cycleT * nextSpeed * 2.2) * glideSpan;
  }

  // Left: Current Speed & Flame (idle nozzles during gap)
  drawPaddleWithPreset(
    ctx,
    { x: leftCenterX + leftOffset, y: centerY, width: 52, height: 13, vx: 0, targetX: leftCenterX },
    1,
    {
      animTick: tick,
      widthLevel: 1,
      speedLevel: isSprinting ? currentLevel : 1,
    }
  );

  // Right: Upgraded Speed & Boosted Fire Plumes (idle nozzles during gap)
  drawPaddleWithPreset(
    ctx,
    { x: rightCenterX + rightOffset, y: centerY, width: 52, height: 13, vx: 0, targetX: rightCenterX },
    1,
    {
      animTick: tick * 1.3,
      widthLevel: 1,
      speedLevel: isSprinting ? (isMax ? currentLevel : currentLevel + 1) : 1,
    }
  );

  const nextLvl = isMax ? currentLevel : currentLevel + 1;

  // Start Line / Rest Guide during gap
  if (!isSprinting) {
    ctx.save();
    ctx.font = 'bold 8px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.fillText('STANDBY', leftCenterX, centerY + 22);
    ctx.fillStyle = nextLvl >= 8 ? '#f59e0b' : '#10b981';
    ctx.fillText(nextLvl >= 8 ? 'PRESET BOOSTER [MAX]' : 'AFTERBURNER READY', rightCenterX, centerY + 22);
    ctx.restore();
  } else if (nextLvl >= 8) {
    // When sprinting at max level, show glowing Preset Booster badge
    ctx.save();
    ctx.font = 'bold 8px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('PRESET BOOSTER [MAX]', rightCenterX, centerY + 24);
    ctx.restore();
  }
}

/**
 * 3. Paddle Chassis Thruster Aura Preview (Current vs Upgraded)
 * Displays the ethereal hull contour halo and orbital celestial stardust motes.
 * Completely distinct from physical bottom fire boosters (stationary, zero downward fire).
 */
export function renderPaddleFancyPreview(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  currentLevel: number,
  isMax: boolean,
  tick: number
): void {
  const leftCenterX = w * 0.25;
  const rightCenterX = w * 0.75;
  const centerY = h * 0.44;
  const pw = 52;
  const ph = 13;

  const curFancy = currentLevel;
  const nextFancy = isMax ? currentLevel : currentLevel + 1;

  // Left: CURRENT Paddle (Stationary floating, chassis aura only, speedLevel: 1 -> zero bottom flame)
  drawPaddleWithPreset(
    ctx,
    { x: leftCenterX, y: centerY, width: pw, height: ph, vx: 0, targetX: leftCenterX },
    1,
    {
      animTick: tick,
      widthLevel: 1,
      speedLevel: 1,
      fancyLevel: curFancy,
    }
  );

  // Right: UPGRADED Paddle with Contour Energy Halo & Orbital Stardust Motes
  drawPaddleWithPreset(
    ctx,
    { x: rightCenterX, y: centerY, width: pw, height: ph, vx: 0, targetX: rightCenterX },
    1,
    {
      animTick: tick,
      widthLevel: 1,
      speedLevel: 1,
      fancyLevel: nextFancy,
    }
  );

  // Flank brackets indicating active celestial chassis aura containment
  ctx.save();
  ctx.strokeStyle = nextFancy === 5 ? '#ffd700' : nextFancy === 4 ? '#c084fc' : nextFancy === 3 ? '#818cf8' : '#38bdf8';
  ctx.lineWidth = 1.5;
  const lw = rightCenterX - pw / 2 - 3;
  const rw = rightCenterX + pw / 2 + 3;
  ctx.beginPath();
  ctx.moveTo(lw, centerY - 6);
  ctx.lineTo(lw - 4, centerY + ph / 2);
  ctx.lineTo(lw, centerY + ph + 6);
  ctx.moveTo(rw, centerY - 6);
  ctx.lineTo(rw + 4, centerY + ph / 2);
  ctx.lineTo(rw, centerY + ph + 6);
  ctx.stroke();
  ctx.restore();

  // Tier Labels at Bottom
  const tierName = (lvl: number) =>
    lvl === 1
      ? 'Clean Chassis'
      : lvl === 2
      ? 'Cyan Halo (6 Motes)'
      : lvl === 3
      ? 'Indigo Field (10)'
      : lvl === 4
      ? 'Warp Pulse (14)'
      : 'Solar Corona (20)';

  ctx.save();
  ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(tierName(curFancy), leftCenterX, h - 10);
  ctx.fillStyle = nextFancy === 5 ? '#ffd700' : nextFancy === 4 ? '#c084fc' : nextFancy === 3 ? '#818cf8' : '#38bdf8';
  ctx.fillText(tierName(nextFancy), rightCenterX, h - 10);
  ctx.restore();
}
