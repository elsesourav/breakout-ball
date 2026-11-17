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

  // 1. Full-Bleed Arcade Cyber Backdrop
  ctx.fillStyle = '#030514';
  ctx.fillRect(0, 0, w, h);

  // 2. Subtle Outer Perimeter Border (Fits entire preview canvas)
  ctx.strokeStyle = 'rgba(0, 247, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, w - 2, h - 2);

  const reservedBottom = options?.reservedBottom || 0;
  const margin = Math.max(6, Math.floor(w * 0.025));
  const availW = Math.max(20, w - margin * 2);
  const availH = Math.max(20, h - reservedBottom - margin * 2);

  const validBlocks = blocks.filter((b) => b && b.h > 0);
  if (validBlocks.length === 0) {
    if (options?.showGrid !== false) {
      const cellW = w / 9;
      const cellH = cellW * 0.75;
      ctx.strokeStyle = 'rgba(0, 247, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = 0; gx <= w; gx += cellW) {
        ctx.moveTo(Math.round(gx) + 0.5, 0);
        ctx.lineTo(Math.round(gx) + 0.5, h);
      }
      for (let gy = 0; gy <= h; gy += cellH) {
        ctx.moveTo(0, Math.round(gy) + 0.5);
        ctx.lineTo(w, Math.round(gy) + 0.5);
      }
      ctx.stroke();
    }
    return;
  }

  // 3. Auto-detect block cluster bounds to remove extra empty space
  const minX = Math.min(...validBlocks.map((b) => b.x));
  const maxX = Math.max(...validBlocks.map((b) => b.x));
  const minY = Math.min(...validBlocks.map((b) => b.y));
  const maxY = Math.max(...validBlocks.map((b) => b.y));

  const spanX = maxX - minX + 1;
  const spanY = maxY - minY + 1;

  // Maximize to fit: frame based on active level blocks with balanced minimum bounds
  const fitCols = Math.max(7, spanX);
  const fitRows = Math.max(3, spanY);

  // Standard block aspect ratio is 128x96 (4:3)
  const scale = Math.min(availW / (fitCols * 128), availH / (fitRows * 96));
  const cellW = 128 * scale;
  const cellH = 96 * scale;

  const clusterW = spanX * cellW;
  const clusterH = spanY * cellH;

  // Symmetrical horizontal and vertical centering
  const startX = Math.round((w - clusterW) / 2) - minX * cellW;
  const startY = Math.round((availH - clusterH) / 2) + margin - minY * cellH;

  // 4. Draw seamless cyber grid lines covering the ENTIRE preview section
  if (options?.showGrid !== false) {
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Vertical grid lines across entire canvas aligned with block columns
    const firstColX = ((startX + minX * cellW) % cellW + cellW) % cellW;
    for (let gx = firstColX; gx <= w; gx += cellW) {
      const rx = Math.round(gx) + 0.5;
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx, h);
    }

    // Horizontal grid lines across entire canvas aligned with block rows
    const firstRowY = ((startY + minY * cellH) % cellH + cellH) % cellH;
    for (let gy = firstRowY; gy <= h; gy += cellH) {
      const ry = Math.round(gy) + 0.5;
      ctx.moveTo(0, ry);
      ctx.lineTo(w, ry);
    }
    ctx.stroke();
  }

  // 5. Draw connecting dashed lines between complete portal pairs
  const portalPairs = new Map<number, { x: number; y: number }[]>();
  validBlocks.forEach((b) => {
    if (b.h === 7 && b.portalPairId) {
      if (!portalPairs.has(b.portalPairId)) portalPairs.set(b.portalPairId, []);
      portalPairs.get(b.portalPairId)!.push({ x: b.x, y: b.y });
    }
  });

  portalPairs.forEach((pts, pairId) => {
    if (pts.length === 2) {
      const p1x = startX + pts[0].x * cellW + cellW / 2;
      const p1y = startY + pts[0].y * cellH + cellH / 2;
      const p2x = startX + pts[1].x * cellW + cellW / 2;
      const p2y = startY + pts[1].y * cellH + cellH / 2;
      const pairColor =
        pairId === 1 ? '#00f7ff' : pairId === 2 ? '#b773ff' : pairId === 3 ? '#ffaa00' : '#10b981';
      ctx.save();
      ctx.strokeStyle = pairColor;
      ctx.lineWidth = Math.max(1.5, cellW * 0.08);
      ctx.setLineDash([Math.max(3, cellW * 0.18), Math.max(3, cellW * 0.15)]);
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.stroke();
      ctx.restore();
    }
  });

  // 6. Draw 3D blocks maximized to fit in the preview section
  const padding = Math.max(1.5, Math.round(cellW * 0.04));
  validBlocks.forEach((block) => {
    const bx = startX + block.x * cellW + padding;
    const by = startY + block.y * cellH + padding;
    const bw = cellW - padding * 2;
    const bh = cellH - padding * 2;
    draw3DBlock(ctx, bx, by, bw, bh, block.h, 1.0, undefined, undefined, undefined, block.portalPairId);
  });
}
