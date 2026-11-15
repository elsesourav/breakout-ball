/**
 * Armory Ball Upgrade Live Preview Renderers
 * Provides real-time looping canvas animations for Ball Size, Speed, and Impact.
 */

import { drawBallWithPreset } from '../../../engine/draw/ballDrawers';

/**
 * 1. Ball Size Comparison Preview (Current vs Upgraded)
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

  // Right: UPGRADED Ball with Green Expansion Indicator Ring
  ctx.save();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(rightCenterX, centerY, nextR + 4, 0, Math.PI * 2);
  ctx.stroke();

  // Pulsing expansion aura
  const auraR = nextR + 6 + Math.sin(tick * 3) * 2;
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 8;
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
 * 2. Ball Speed Race Loop Preview (Continuous Velocity Comparison)
 */
export function renderBallSpeedPreview(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  currentLevel: number,
  isMax: boolean,
  tick: number
): void {
  const laneTopY = h * 0.36;
  const laneBtmY = h * 0.68;
  const laneW = w - 70;
  const startX = 35;

  const speed1 = 1.2 + (currentLevel - 1) * 0.16;
  const pos1 = (Math.sin(tick * speed1) * 0.5 + 0.5) * laneW;

  const speed2 = 1.2 + (isMax ? currentLevel - 1 : currentLevel) * 0.16;
  const pos2 = (Math.sin(tick * speed2) * 0.5 + 0.5) * laneW;

  // Lane dividers
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fillRect(startX, laneTopY - 14, laneW, 28);
  ctx.fillRect(startX, laneBtmY - 14, laneW, 28);

  // Current Ball (Top Lane)
  drawBallWithPreset(ctx, { x: startX + pos1, y: laneTopY, radius: 12 }, 1, {
    animTick: tick,
  });

  // Upgraded Ball with Comet Trail (Bottom Lane)
  ctx.save();
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 14;
  const trailLen = 22;
  const dir = Math.cos(tick * speed2) > 0 ? -1 : 1;
  const grad = ctx.createLinearGradient(
    startX + pos2,
    laneBtmY,
    startX + pos2 + dir * trailLen,
    laneBtmY
  );
  grad.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
  grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(startX + pos2, laneBtmY - 5, dir * trailLen, 10);
  ctx.restore();

  drawBallWithPreset(ctx, { x: startX + pos2, y: laneBtmY, radius: 12 }, 1, {
    animTick: tick * 1.5,
    tier: 2,
  });
}

/**
 * 3. Ball Impact Power Blast Preview (Kinetic Shockwave Comparison)
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

  const loopT = (tick % 2.5) / 2.5; // 0 to 1 every 2.5s
  const strikePoint = 0.55;

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

  let ballY: number;
  if (loopT < strikePoint) {
    ballY = centerY - 35 + (loopT / strikePoint) * 35;
  } else {
    ballY = centerY + (1 - (loopT - strikePoint) / (1 - strikePoint)) * 8 - 8;
  }

  // Left (Standard Impact)
  drawBallWithPreset(ctx, { x: leftCenterX, y: ballY, radius: 13 }, 1, { animTick: tick });

  // Right (Heavy Impact with Shockwave)
  drawBallWithPreset(ctx, { x: rightCenterX, y: ballY, radius: 13 }, 1, {
    animTick: tick,
    tier: 2,
  });

  if (loopT >= strikePoint && loopT <= strikePoint + 0.3) {
    const blastProg = (loopT - strikePoint) / 0.3;
    ctx.save();
    ctx.beginPath();
    ctx.arc(rightCenterX, blockY, 8 + blastProg * 35, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(16, 185, 129, ${1 - blastProg})`;
    ctx.lineWidth = 3 * (1 - blastProg);
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();
  }
}
