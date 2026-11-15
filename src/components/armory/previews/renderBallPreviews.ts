/**
 * Armory Ball Upgrade Live Preview Renderers
 * Provides real-time looping canvas animations for Ball Size, Speed, and Impact.
 */

import { drawBallWithPreset } from '../../../engine/draw/ballDrawers';

/**
 * 1. Ball Size Comparison Preview (Current vs Upgraded)
 * Displays sizing difference with a clear rest gap between pulses.
 */
export function renderBallSizePreview(
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

  const baseR = 19;
  const curR = baseR * (1 + (currentLevel - 1) * 0.08);
  const nextR = baseR * (1 + (isMax ? currentLevel - 1 : currentLevel) * 0.08);

  // Left: CURRENT Ball
  drawBallWithPreset(ctx, { x: leftCenterX, y: centerY, radius: curR }, 1, {
    animTick: tick,
    tier: currentLevel >= 5 ? 3 : currentLevel >= 3 ? 2 : 1,
  });

  // Pulse comparison with 1.4s rest gap
  const cycleTotal = 3.6;
  const cycleT = tick % cycleTotal;
  const isPulsing = cycleT < 2.2;
  const pulseProg = isPulsing ? cycleT / 2.2 : 1.0;

  // Right: UPGRADED Ball with Green Expansion Indicator Ring
  ctx.save();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(rightCenterX, centerY, nextR + 4, 0, Math.PI * 2);
  ctx.stroke();

  // Expansion aura that pulses during active phase and rests during gap phase
  const auraOffset = isPulsing ? Math.sin(pulseProg * Math.PI * 2) * 2.5 : 0;
  const auraR = nextR + 5 + auraOffset;
  ctx.strokeStyle = isPulsing ? 'rgba(16, 185, 129, 0.45)' : 'rgba(16, 185, 129, 0.2)';
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = isPulsing ? 8 : 2;
  ctx.beginPath();
  ctx.arc(rightCenterX, centerY, auraR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  drawBallWithPreset(ctx, { x: rightCenterX, y: centerY, radius: nextR }, 1, {
    animTick: tick,
    tier: currentLevel + 1 >= 5 ? 3 : currentLevel + 1 >= 3 ? 2 : 1,
  });
}

/**
 * 2. Ball Speed Race Loop Preview (Race with Clear 1.5s Starting Gap)
 */
export function renderBallSpeedPreview(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  currentLevel: number,
  isMax: boolean,
  tick: number
): void {
  const leftCenterX = w * 0.25;
  const rightCenterX = w * 0.75;
  const topY = h * 0.22;
  const btmY = h * 0.78;
  const spanY = btmY - topY;

  // Race Cycle: 3.2s active race + 1.5s resting gap at start gate
  const raceDuration = 3.2;
  const gapDuration = 1.5;
  const cycleTotal = raceDuration + gapDuration;
  const cycleT = tick % cycleTotal;
  const isRacing = cycleT < raceDuration;

  let ballY1 = topY;
  let ballY2 = topY;
  let dirY2 = 1;

  if (isRacing) {
    const spd1 = 1.8 + (currentLevel - 1) * 0.12;
    const pos1 = (Math.sin(cycleT * spd1) * 0.5 + 0.5) * spanY;
    ballY1 = topY + pos1;

    const nextLvl = isMax ? currentLevel : currentLevel + 1;
    const spd2 = 1.8 + (nextLvl - 1) * 0.12;
    const pos2 = (Math.sin(cycleT * spd2) * 0.5 + 0.5) * spanY;
    ballY2 = topY + pos2;
    dirY2 = Math.cos(cycleT * spd2) > 0 ? -1 : 1;
  }

  // Track guides
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 247, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(leftCenterX, topY - 10);
  ctx.lineTo(leftCenterX, btmY + 10);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.beginPath();
  ctx.moveTo(rightCenterX, topY - 10);
  ctx.lineTo(rightCenterX, btmY + 10);
  ctx.stroke();

  // Start Line Gate
  ctx.setLineDash([]);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = isRacing ? 'rgba(0, 247, 255, 0.3)' : '#00f7ff';
  ctx.beginPath();
  ctx.moveTo(leftCenterX - 18, topY);
  ctx.lineTo(leftCenterX + 18, topY);
  ctx.moveTo(rightCenterX - 18, topY);
  ctx.lineTo(rightCenterX + 18, topY);
  ctx.stroke();

  if (!isRacing) {
    ctx.font = 'bold 8px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00f7ff';
    ctx.fillText('READY', leftCenterX, topY - 8);
    ctx.fillStyle = '#10b981';
    ctx.fillText('BOOST READY', rightCenterX, topY - 8);
  }
  ctx.restore();

  // Left (Current Ball)
  drawBallWithPreset(ctx, { x: leftCenterX, y: ballY1, radius: 12 }, 1, {
    animTick: tick,
  });

  // Right (Upgraded Ball with Enhanced Velocity Comet Trail when moving)
  if (isRacing) {
    ctx.save();
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 12;
    const trailLen = 22;
    const grad = ctx.createLinearGradient(
      rightCenterX,
      ballY2,
      rightCenterX,
      ballY2 + dirY2 * trailLen
    );
    grad.addColorStop(0, 'rgba(16, 185, 129, 0.7)');
    grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(rightCenterX - 4, ballY2, 8, dirY2 * trailLen);
    ctx.restore();
  }

  drawBallWithPreset(ctx, { x: rightCenterX, y: ballY2, radius: 12 }, 1, {
    animTick: tick * 1.5,
    tier: 2,
  });
}

/**
 * 3. Ball Impact Power Blast Preview (Kinetic Shockwave with 1.8s Resting Gap)
 */
export function renderBallImpactPreview(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  _currentLevel: number,
  _isMax: boolean,
  tick: number
): void {
  const leftCenterX = w * 0.25;
  const rightCenterX = w * 0.75;
  const centerY = h * 0.52;

  // Cycle: 2.0s drop & smash + 1.8s resting gap = 3.8s total
  const cycleTotal = 3.8;
  const cycleT = tick % cycleTotal;
  const isDropPhase = cycleT < 2.0;

  const blockW = 44;
  const blockH = 22;
  const leftBlockX = leftCenterX - blockW / 2;
  const rightBlockX = rightCenterX - blockW / 2;
  const blockY = centerY + 18;

  // Target Armor Blocks
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.fillRect(leftBlockX, blockY, blockW, blockH);
  ctx.strokeRect(leftBlockX, blockY, blockW, blockH);

  ctx.fillStyle = '#0f291e';
  ctx.strokeStyle = '#10b981';
  ctx.fillRect(rightBlockX, blockY, blockW, blockH);
  ctx.strokeRect(rightBlockX, blockY, blockW, blockH);

  const startY = centerY - 38;
  let ballY: number;

  if (isDropPhase) {
    const strikeTime = 0.8;
    if (cycleT < strikeTime) {
      // Falling toward block
      ballY = startY + (cycleT / strikeTime) * 38;
    } else {
      // Bouncing back up to resting position
      const bounceProg = (cycleT - strikeTime) / (2.0 - strikeTime);
      ballY = centerY + (1 - bounceProg) * 8 - (bounceProg * 38);
    }
  } else {
    // 1.8s Resting Gap at the launch position
    ballY = startY;
  }

  // Left (Standard Impact)
  drawBallWithPreset(ctx, { x: leftCenterX, y: ballY, radius: 13 }, 1, { animTick: tick });

  // Right (Heavy Impact with Shockwave)
  drawBallWithPreset(ctx, { x: rightCenterX, y: ballY, radius: 13 }, 1, {
    animTick: tick,
    tier: 2,
  });

  // Shockwave blast trigger right after impact (0.8s to 1.3s)
  if (isDropPhase && cycleT >= 0.8 && cycleT <= 1.3) {
    const blastProg = (cycleT - 0.8) / 0.5;
    ctx.save();
    ctx.beginPath();
    ctx.arc(rightCenterX, blockY, 8 + blastProg * 38, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(16, 185, 129, ${1 - blastProg})`;
    ctx.lineWidth = 3 * (1 - blastProg);
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();
  }
}
