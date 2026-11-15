import { BlockData } from '../types/game';
import { BLOCK_COLORS, GRID_ROWS, GRID_COLS } from '../constants/game';
import { getActiveDesignConfig, BlockPresetId } from '../constants/visualPresets';
import { drawBlockWithPreset } from '../engine/draw/blockDrawers';
import { BlockEngineState } from '../engine/types';

export function generateLevelId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export interface LevelHpStats {
  totalHp: number;
  breakableCount: number;
  indestructibleCount: number;
  titaniumCount: number;
  portalCount: number;
  empCount: number;
}

/**
 * Accurate HP and Targets calculation across the game:
 * - Bricks 1-5: Add their face HP (1 to 5) to totalHp, count as breakable.
 * - Titanium Wall (6): 0 HP (Indestructible obstacle).
 * - Quantum Portal (7): 0 HP (Indestructible warp gateway).
 * - EMP Reactor (8): 3 HP countdown hits to detonation, counts as breakable.
 */
export function calculateLevelHp(blocks: BlockData[]): LevelHpStats {
  let totalHp = 0;
  let breakableCount = 0;
  let indestructibleCount = 0;
  let titaniumCount = 0;
  let portalCount = 0;
  let empCount = 0;

  for (const block of blocks) {
    if (!block || block.h <= 0) continue;
    if (block.h >= 1 && block.h <= 5) {
      totalHp += block.h;
      breakableCount++;
    } else if (block.h === 6) {
      indestructibleCount++;
      titaniumCount++;
    } else if (block.h === 7) {
      indestructibleCount++;
      portalCount++;
    } else if (block.h === 8) {
      totalHp += 3;
      breakableCount++;
      empCount++;
    }
  }

  return {
    totalHp,
    breakableCount,
    indestructibleCount,
    titaniumCount,
    portalCount,
    empCount,
  };
}

export function drawFractureCracks(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  damageRatio: number
) {
  if (damageRatio <= 0) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.22, by + 2);
  ctx.lineTo(bx + bw * 0.38, by + bh * 0.45);
  ctx.lineTo(bx + bw * 0.55, by + bh * 0.52);
  ctx.lineTo(bx + bw * 0.76, by + bh - 2);
  ctx.stroke();

  if (damageRatio > 0.4) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.38, by + bh * 0.45);
    ctx.lineTo(bx + bw * 0.16, by + bh * 0.8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.55, by + bh * 0.52);
    ctx.lineTo(bx + bw * 0.84, by + bh * 0.28);
    ctx.stroke();
  }
  ctx.restore();
}

export function draw3DBlock(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  blockType: number,
  alpha: number = 1.0,
  currentHealth?: number,
  initialHealth?: number,
  presetOverride?: BlockPresetId,
  portalPairId?: number
) {
  if (blockType <= 0) return;
  const preset = presetOverride || getActiveDesignConfig().blockPreset;

  ctx.save();
  if (alpha < 1.0) ctx.globalAlpha = alpha;

  const block: BlockEngineState = {
    index: 0,
    col: 0,
    row: 0,
    x: bx,
    y: by,
    w: bw,
    h: bh,
    health: currentHealth !== undefined ? currentHealth : blockType,
    initialHealth: initialHealth !== undefined ? initialHealth : blockType,
    isDead: false,
    hitAnim: 0,
    counter: 3,
    portalPairId,
  };

  drawBlockWithPreset(ctx, block, preset);
  ctx.restore();
}

export function drawLevelPreviewOnCanvas(
  canvas: HTMLCanvasElement,
  blocks: BlockData[],
  width?: number,
  height?: number,
  options?: { reservedBottom?: number; showGrid?: boolean }
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = width || canvas.width;
  const h = height || canvas.height;
  ctx.clearRect(0, 0, w, h);

  // 1. Arcade Cyber Backdrop with grid pattern
  ctx.fillStyle = '#050716';
  ctx.fillRect(0, 0, w, h);

  if (options?.showGrid !== false) {
    // Subtle gridlines
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = Math.floor(w / 12);
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  // 2. Playfield side rails / borders
  ctx.strokeStyle = 'rgba(0, 247, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(3, 3, w - 6, h - 6);

  const validBlocks = blocks.filter((b) => b.h > 0);
  if (validBlocks.length === 0) return;

  // 3. Auto calculate bounding box and exact centering
  const reservedBottom = options?.reservedBottom || 0;
  const availH = Math.max(30, h - reservedBottom);

  const minY = Math.min(...validBlocks.map((b) => b.y));
  const maxY = Math.max(...validBlocks.map((b) => b.y));
  const spanY = maxY - minY + 1;

  const marginX = 8;
  const playW = w - marginX * 2;
  let cellW = playW / GRID_ROWS;
  let cellH = cellW * 0.7; // Match game block ratio (128x90)

  // Ensure tall patterns do not exceed available height with padding
  const totalClusterH = spanY * cellH;
  if (totalClusterH > availH - 16) {
    const scale = (availH - 16) / totalClusterH;
    cellW *= scale;
    cellH *= scale;
  }

  const padding = Math.max(1, cellW * 0.05);

  // Symmetrical Vertical Centering in the visible available preview area
  const clusterH = spanY * cellH;
  const startY = Math.round((availH - clusterH) / 2) - minY * cellH;

  // Symmetrical Horizontal Centering
  const gridW = GRID_ROWS * cellW;
  const startX = Math.round((w - gridW) / 2);

  blocks.forEach((block) => {
    if (block.h <= 0) return;
    const bx = startX + block.x * cellW + padding;
    const by = startY + block.y * cellH + padding;
    const bw = cellW - padding * 2;
    const bh = cellH - padding * 2;
    draw3DBlock(ctx, bx, by, bw, bh, block.h, 1.0, undefined, undefined, undefined, block.portalPairId);
  });
}
