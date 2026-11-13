import { BlockData } from '../types/game';
import { BLOCK_COLORS, GRID_ROWS, GRID_COLS } from '../constants/game';

export function generateLevelId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function drawLevelPreviewOnCanvas(
  canvas: HTMLCanvasElement,
  blocks: BlockData[],
  width?: number,
  height?: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = width || canvas.width;
  const h = height || canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Background tint
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, w, h);

  const cellW = w / GRID_ROWS;
  const cellH = h / GRID_COLS;
  const padding = Math.max(1, cellW * 0.05);

  blocks.forEach((block) => {
    if (block.h <= 0) return;
    const config = BLOCK_COLORS[block.h] || BLOCK_COLORS[1];

    const bx = block.x * cellW + padding;
    const by = block.y * cellH + padding;
    const bw = cellW - padding * 2;
    const bh = cellH - padding * 2;
    const r = Math.min(bw, bh) * 0.2;

    ctx.save();
    // Rounded block path
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, r) : ctx.rect(bx, by, bw, bh);

    // Gradient fill
    const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
    grad.addColorStop(0, config.bg[0]);
    grad.addColorStop(1, config.bg[1]);
    ctx.fillStyle = grad;
    ctx.fill();

    // Border stroke
    ctx.strokeStyle = config.border;
    ctx.lineWidth = Math.max(1, cellW * 0.04);
    ctx.stroke();

    // HP label or icon
    if (cellW > 20) {
      ctx.fillStyle = config.text;
      ctx.font = `bold ${Math.floor(cellH * 0.45)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.label, bx + bw / 2, by + bh / 2 + 1);
    }
    ctx.restore();
  });
}
