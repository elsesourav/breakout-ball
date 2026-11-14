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

  // 1. Arcade Cyber Backdrop with grid pattern
  ctx.fillStyle = '#060818';
  ctx.fillRect(0, 0, w, h);

  // Subtle gridlines
  ctx.strokeStyle = 'rgba(0, 247, 255, 0.05)';
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

  // 2. Playfield side rails / borders
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  // 3. Calculate block dimensions scaled to fit width cleanly
  const marginX = 8;
  const playW = w - marginX * 2;
  const cellW = playW / GRID_ROWS;
  const cellH = cellW * 0.7; // Match game block ratio (128x90)
  const padding = Math.max(1, cellW * 0.06);

  blocks.forEach((block) => {
    if (block.h <= 0) return;
    const config = BLOCK_COLORS[block.h] || BLOCK_COLORS[1];

    const bx = marginX + block.x * cellW + padding;
    const by = 12 + block.y * cellH + padding;
    const bw = cellW - padding * 2;
    const bh = cellH - padding * 2;
    const r = Math.min(bw, bh) * 0.22;

    ctx.save();
    // Rounded block path
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(bx, by, bw, bh, r);
    } else {
      ctx.rect(bx, by, bw, bh);
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
    grad.addColorStop(0, config.bg[0]);
    grad.addColorStop(1, config.bg[1]);
    ctx.fillStyle = grad;
    ctx.fill();

    // Specular shine at top of brick
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(bx + r * 0.5, by + 1.5, bw - r, bh * 0.25);

    // Glowing border stroke
    ctx.strokeStyle = config.border;
    ctx.lineWidth = Math.max(1.5, cellW * 0.05);
    ctx.stroke();

    // HP label or icon
    if (cellW > 16) {
      ctx.fillStyle = config.text;
      ctx.font = `900 ${Math.floor(cellH * 0.55)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.label, bx + bw / 2, by + bh / 2 + 1);
    }
    ctx.restore();
  });
}
