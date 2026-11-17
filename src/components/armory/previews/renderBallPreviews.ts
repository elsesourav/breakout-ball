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

/**
 * 4. Ball Trajectory Matrix Preview (8-Ball Pool Style Predictive Guideline)
 * Displays predictive incoming and outgoing deflection lines comparing current vs upgraded range.
 */
export function renderBallTrajectoryPreview(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  currentLevel: number,
  isMax: boolean,
  tick: number
): void {
  const leftCenterX = w * 0.25;
  const rightCenterX = w * 0.75;
  const padY = h * 0.82;
  const padW = 44;
  const padH = 8;
  const ballR = 9;

  const curDist = Math.round(600 + (currentLevel - 1) * (1200 / 7));
  const nextLvl = isMax ? currentLevel : currentLevel + 1;
  const nextDist = Math.round(600 + (nextLvl - 1) * (1200 / 7));

  // 3.6s Looping animation: ball drops from top, hits paddle at angle, bounces off
  const cycleTotal = 3.6;
  const cycleT = tick % cycleTotal;
  const dropDuration = 2.0;

  // Draw Mini Paddles
  ctx.save();
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#00f7ff';
  ctx.lineWidth = 1.5;
  // Left Paddle
  ctx.fillRect(leftCenterX - padW / 2, padY, padW, padH);
  ctx.strokeRect(leftCenterX - padW / 2, padY, padW, padH);
  // Right Paddle
  ctx.fillStyle = '#064e3b';
  ctx.strokeStyle = '#10b981';
  ctx.fillRect(rightCenterX - padW / 2, padY, padW, padH);
  ctx.strokeRect(rightCenterX - padW / 2, padY, padW, padH);
  ctx.restore();

  // Trajectory Math for Preview
  // Ball descends from top-left offset to paddle center-right offset
  const startY = h * 0.18;
  const hitOffsetY = padY - ballR;
  const hitXLeft = leftCenterX + 6;
  const hitXRight = rightCenterX + 6;

  let ballY: number;
  let ballXLeft: number;
  let ballXRight: number;
  let isDescending = false;

  if (cycleT < dropDuration) {
    isDescending = true;
    const p = cycleT / dropDuration;
    ballY = startY + p * (hitOffsetY - startY);
    ballXLeft = leftCenterX - 18 + p * 24;
    ballXRight = rightCenterX - 18 + p * 24;
  } else {
    // Bouncing away
    const p = (cycleT - dropDuration) / (cycleTotal - dropDuration);
    ballY = hitOffsetY - p * (hitOffsetY - startY) * 0.9;
    ballXLeft = hitXLeft + p * 28;
    ballXRight = hitXRight + p * 28;
  }

  // Draw Guidelines during approach
  const distLeft = padY - ballY;
  // Left side: visible only when within short range (e.g. lower 45% of height)
  const leftMaxRangeHeight = h * (0.35 + (currentLevel - 1) * 0.05);
  const leftAlpha = isDescending && distLeft < leftMaxRangeHeight ? Math.min(1.0, (leftMaxRangeHeight - distLeft) / 25) : 0;

  // Right side: visible from much higher altitude (e.g. up to 85% of height)
  const rightMaxRangeHeight = h * (0.45 + (nextLvl - 1) * 0.07);
  const rightAlpha = isDescending && distLeft < rightMaxRangeHeight ? Math.min(1.0, (rightMaxRangeHeight - distLeft) / 25) : 0;

  // Draw Left Guideline (Short Range)
  if (leftAlpha > 0.01) {
    ctx.save();
    ctx.strokeStyle = `rgba(0, 247, 255, ${leftAlpha * 0.8})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ballXLeft, ballY);
    ctx.lineTo(hitXLeft, hitOffsetY);
    ctx.stroke();

    // Outgoing ray
    ctx.strokeStyle = `rgba(0, 247, 255, ${leftAlpha * 0.9})`;
    ctx.beginPath();
    ctx.moveTo(hitXLeft, hitOffsetY);
    ctx.lineTo(hitXLeft + 22, hitOffsetY - 35);
    ctx.stroke();

    // Reticle
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(0, 247, 255, ${leftAlpha * 0.9})`;
    ctx.beginPath();
    ctx.arc(hitXLeft, hitOffsetY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Right Guideline (Upgraded Deep Matrix Range)
  if (rightAlpha > 0.01) {
    ctx.save();
    ctx.strokeStyle = `rgba(16, 185, 129, ${rightAlpha * 0.9})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(ballXRight, ballY);
    ctx.lineTo(hitXRight, hitOffsetY);
    ctx.stroke();

    // Outgoing Extended Ray with Arrow
    ctx.strokeStyle = `rgba(52, 211, 153, ${rightAlpha})`;
    ctx.beginPath();
    ctx.moveTo(hitXRight, hitOffsetY);
    const outTipX = hitXRight + 34;
    const outTipY = hitOffsetY - 55;
    ctx.lineTo(outTipX, outTipY);
    ctx.stroke();

    // Reticle on paddle
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(16, 185, 129, ${rightAlpha})`;
    ctx.beginPath();
    ctx.arc(hitXRight, hitOffsetY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Arrowhead
    ctx.save();
    ctx.translate(outTipX, outTipY);
    ctx.rotate(Math.atan2(34, -55));
    ctx.fillStyle = `rgba(52, 211, 153, ${rightAlpha})`;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 4);
    ctx.lineTo(0, 2);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // Draw Balls
  drawBallWithPreset(ctx, { x: ballXLeft, y: ballY, radius: ballR }, 1, {
    animTick: tick,
    tier: 1,
    palette: { glow: '#00f7ff', c1: '#ffffff', c2: '#38bdf8', c3: '#0369a1' },
  });

  drawBallWithPreset(ctx, { x: ballXRight, y: ballY, radius: ballR }, 1, {
    animTick: tick,
    tier: nextLvl >= 5 ? 3 : nextLvl >= 3 ? 2 : 1,
    palette: { glow: '#10b981', c1: '#ffffff', c2: '#34d399', c3: '#065f46' },
  });

  // Range Badges at Bottom
  ctx.save();
  ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`${curDist}px Range`, leftCenterX, h - 8);
  ctx.fillStyle = '#34d399';
  ctx.fillText(`${nextDist}px Range`, rightCenterX, h - 8);
  ctx.restore();
}

/**
 * 5. Ball Fancy Stardust Aura Preview (Current vs Upgraded)
 * Displays orbiting cosmetic aura particle progression (Dormant -> Cyan -> Gold -> Magenta -> Prismatic).
 */
export function renderBallFancyPreview(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  currentLevel: number,
  isMax: boolean,
  tick: number
): void {
  const leftCenterX = w * 0.25;
  const rightCenterX = w * 0.75;
  const centerY = h * 0.48;
  const ballR = 18;

  const curFancy = currentLevel;
  const nextFancy = isMax ? currentLevel : currentLevel + 1;

  // Left: CURRENT Ball
  drawBallWithPreset(ctx, { x: leftCenterX, y: centerY, radius: ballR }, 1, {
    animTick: tick,
    tier: 2,
    fancyLevel: curFancy,
  });

  // Right: UPGRADED Ball with subtle target orbit guideline
  ctx.save();
  ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(rightCenterX, centerY, ballR * 1.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  drawBallWithPreset(ctx, { x: rightCenterX, y: centerY, radius: ballR }, 1, {
    animTick: tick,
    tier: 2,
    fancyLevel: nextFancy,
  });

  // Descriptive Aura Tier Labels at Bottom
  const tierName = (lvl: number) =>
    lvl === 1 ? 'Dormant (0)' : lvl === 2 ? '4 Cyan Sparks' : lvl === 3 ? '7 Gold Stardust' : lvl === 4 ? '10 Magenta Warp' : '14 Prismatic Rainbow';

  ctx.save();
  ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(tierName(curFancy), leftCenterX, h - 10);
  ctx.fillStyle = nextFancy === 5 ? '#f43f5e' : nextFancy === 4 ? '#ec4899' : nextFancy === 3 ? '#ffd700' : '#00f7ff';
  ctx.fillText(tierName(nextFancy), rightCenterX, h - 10);
  ctx.restore();
}
