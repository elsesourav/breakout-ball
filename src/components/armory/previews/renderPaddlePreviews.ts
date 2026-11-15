/**
 * Armory Paddle Upgrade Live Preview Renderers
 * Provides real-time looping canvas animations for Paddle Width and Speed.
 */

import { drawPaddleWithPreset } from '../../../engine/draw/paddleDrawers';

/**
 * 1. Paddle Width Comparison Preview (Current vs Upgraded Wing Extension)
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

  const curW = Math.min(130, 85 + (currentLevel - 1) * 9);
  const nextW = Math.min(150, 85 + (isMax ? currentLevel - 1 : currentLevel) * 9);

  // Left: CURRENT Paddle
  drawPaddleWithPreset(
    ctx,
    { x: leftCenterX, y: centerY, width: curW, height: 16, vx: 0, targetX: leftCenterX },
    1,
    {
      animTick: tick,
      widthLevel: currentLevel,
    }
  );

  // Right: UPGRADED Paddle with Green Wingtip Extension Bracket
  drawPaddleWithPreset(
    ctx,
    { x: rightCenterX, y: centerY, width: nextW, height: 16, vx: 0, targetX: rightCenterX },
    1,
    {
      animTick: tick,
      widthLevel: currentLevel + 1,
    }
  );

  // Green Extension Bracket Lines
  ctx.save();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  const leftWing = rightCenterX - nextW / 2;
  const rightWing = rightCenterX + nextW / 2;
  ctx.beginPath();
  ctx.moveTo(leftWing, centerY - 14);
  ctx.lineTo(leftWing, centerY + 14);
  ctx.moveTo(rightWing, centerY - 14);
  ctx.lineTo(rightWing, centerY + 14);
  ctx.stroke();
  ctx.restore();
}

/**
 * 2. Paddle Speed Comparison Preview (Looping Thruster Agility Test)
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
  const centerY = h * 0.52;

  const curSpeed = 1.0 + (currentLevel - 1) * 0.15;
  const nextSpeed = 1.0 + (isMax ? currentLevel - 1 : currentLevel) * 0.15;
  const glideSpan = 45;

  const leftOffset = Math.sin(tick * curSpeed) * glideSpan;
  const rightOffset = Math.sin(tick * nextSpeed) * glideSpan;

  drawPaddleWithPreset(
    ctx,
    { x: leftCenterX + leftOffset, y: centerY, width: 85, height: 15, vx: 0, targetX: leftCenterX },
    1,
    {
      animTick: tick,
      speedLevel: currentLevel,
    }
  );

  drawPaddleWithPreset(
    ctx,
    { x: rightCenterX + rightOffset, y: centerY, width: 85, height: 15, vx: 0, targetX: rightCenterX },
    1,
    {
      animTick: tick * 1.4,
      speedLevel: currentLevel + 1,
    }
  );
}
