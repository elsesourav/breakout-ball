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
  initialHealth?: number
) {
  if (blockType <= 0) return;
  const config = BLOCK_COLORS[blockType] || BLOCK_COLORS[1];
  const depth = Math.max(2, Math.round(bh * 0.16));
  const topFaceH = bh - depth;
  const r = Math.min(bw, topFaceH) * 0.22;

  ctx.save();
  if (alpha < 1.0) ctx.globalAlpha = alpha;

  // 1. 3D Drop Shadow on Floor
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx + 1.5, by + depth + 1.5, bw, topFaceH, r);
  else ctx.rect(bx + 1.5, by + depth + 1.5, bw, topFaceH);
  ctx.fill();

  // 2. 3D Extruded Lower Base & Flanks (Thickness)
  const baseGrad = ctx.createLinearGradient(bx, by + topFaceH, bx, by + bh);
  baseGrad.addColorStop(0, '#0a0d18');
  baseGrad.addColorStop(1, '#020308');
  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, by + depth * 0.6, bw, topFaceH + depth * 0.4, r);
  else ctx.rect(bx, by + depth * 0.6, bw, topFaceH + depth * 0.4);
  ctx.fill();

  // 3. Main 3D Front Face
  if (blockType === 6) {
    // 3D Heavy Titanium Ingot with Steel Screws & Brushed Finish
    const steelGrad = ctx.createLinearGradient(bx, by, bx, by + topFaceH);
    steelGrad.addColorStop(0, '#f1f5f9');
    steelGrad.addColorStop(0.35, '#94a3b8');
    steelGrad.addColorStop(0.7, '#475569');
    steelGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = steelGrad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, topFaceH, r);
    else ctx.rect(bx, by, bw, topFaceH);
    ctx.fill();

    // Corner rivets with specular sheen
    const boltOffset = Math.max(3, bw * 0.14);
    const boltR = Math.max(1.2, bw * 0.045);
    [
      [bx + boltOffset, by + boltOffset],
      [bx + bw - boltOffset, by + boltOffset],
      [bx + boltOffset, by + topFaceH - boltOffset],
      [bx + bw - boltOffset, by + topFaceH - boltOffset],
    ].forEach(([cx, cy]) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy, boltR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 0.5, cy - 0.5, boltR * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (blockType === 7) {
    // 3D Quantum Portal
    const portalChassis = ctx.createLinearGradient(bx, by, bx, by + topFaceH);
    portalChassis.addColorStop(0, '#3b0764');
    portalChassis.addColorStop(0.5, '#1e053a');
    portalChassis.addColorStop(1, '#05000a');
    ctx.fillStyle = portalChassis;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, topFaceH, r);
    else ctx.rect(bx, by, bw, topFaceH);
    ctx.fill();

    // Swirling vortex center
    const pCenterX = bx + bw / 2;
    const pCenterY = by + topFaceH / 2;
    const pRadius = Math.min(bw, topFaceH) * 0.42;
    const vortexGrad = ctx.createRadialGradient(pCenterX, pCenterY, 1, pCenterX, pCenterY, pRadius);
    vortexGrad.addColorStop(0, '#00f7ff');
    vortexGrad.addColorStop(0.5, '#9333ea');
    vortexGrad.addColorStop(1, 'rgba(236, 72, 153, 0.2)');
    ctx.fillStyle = vortexGrad;
    ctx.beginPath();
    ctx.arc(pCenterX, pCenterY, pRadius, 0, Math.PI * 2);
    ctx.fill();
  } else if (blockType === 8) {
    // 3D Hazard EMP Reactor with Caution Stripes
    const empGrad = ctx.createLinearGradient(bx, by, bx, by + topFaceH);
    empGrad.addColorStop(0, '#ff7700');
    empGrad.addColorStop(0.5, '#ff3b00');
    empGrad.addColorStop(1, '#4a0800');
    ctx.fillStyle = empGrad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, topFaceH, r);
    else ctx.rect(bx, by, bw, topFaceH);
    ctx.fill();

    // Angled Hazard Stripes
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, topFaceH, r);
    else ctx.rect(bx, by, bw, topFaceH);
    ctx.clip();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = Math.max(2.5, bw * 0.08);
    const step = Math.max(6, topFaceH * 0.5);
    for (let sx = -topFaceH; sx < bw + topFaceH; sx += step) {
      ctx.beginPath();
      ctx.moveTo(bx + sx, by + topFaceH);
      ctx.lineTo(bx + sx + topFaceH, by);
      ctx.stroke();
    }
    ctx.restore();
  } else {
    // Standard 1-5 HP 3D Cyber Crystal
    const faceGrad = ctx.createLinearGradient(bx, by, bx, by + topFaceH);
    faceGrad.addColorStop(0, config.bg[0]);
    faceGrad.addColorStop(0.6, config.bg[1]);
    faceGrad.addColorStop(1, '#050c18');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, topFaceH, r);
    else ctx.rect(bx, by, bw, topFaceH);
    ctx.fill();
  }

  // 4. Fracture Cracks on Damaged Blocks
  if (currentHealth !== undefined && initialHealth !== undefined && currentHealth < initialHealth) {
    const damageRatio = (initialHealth - currentHealth) / initialHealth;
    drawFractureCracks(ctx, bx, by, bw, topFaceH, damageRatio);
  }

  // 5. 3D Top Specular Bevel Highlight
  const sheenGrad = ctx.createLinearGradient(bx, by, bx, by + topFaceH * 0.45);
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
  sheenGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.18)');
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx + 1.5, by + 1, bw - 3, topFaceH * 0.4, r * 0.6);
  else ctx.rect(bx + 1.5, by + 1, bw - 3, topFaceH * 0.4);
  ctx.fill();

  // 6. Outer Glowing Cyber Rim
  ctx.strokeStyle = config.border;
  ctx.shadowColor = config.border;
  ctx.shadowBlur = 8;
  ctx.lineWidth = Math.max(1.5, bw * 0.04);
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, by, bw, topFaceH, r);
  else ctx.rect(bx, by, bw, topFaceH);
  ctx.stroke();

  // 7. 3D Embossed Label / Number
  if (bw > 16) {
    const cx = bx + bw / 2;
    const cy = by + topFaceH / 2;
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let label = config.label;
    if (blockType === 6) label = '∞';
    else if (blockType === 7) label = '🌀';
    else if (blockType === 8) label = 'EMP';

    ctx.font =
      blockType === 7
        ? `${Math.floor(topFaceH * 0.52)}px sans-serif`
        : `900 ${Math.floor(topFaceH * 0.5)}px monospace`;

    // 3D Drop shadow for stamped text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillText(label, cx, cy + 1.5);

    // Top highlight for stamped text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillText(label, cx, cy - 0.8);

    // Main Text
    ctx.fillStyle = config.text;
    ctx.fillText(label, cx, cy);
  }

  ctx.restore();
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
  ctx.fillStyle = '#050716';
  ctx.fillRect(0, 0, w, h);

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

  // 2. Playfield side rails / borders
  ctx.strokeStyle = 'rgba(0, 247, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(3, 3, w - 6, h - 6);

  // 3. Calculate block dimensions scaled to fit width cleanly
  const marginX = 8;
  const playW = w - marginX * 2;
  const cellW = playW / GRID_ROWS;
  const cellH = cellW * 0.7; // Match game block ratio (128x90)
  const padding = Math.max(1, cellW * 0.05);

  blocks.forEach((block) => {
    if (block.h <= 0) return;
    const bx = marginX + block.x * cellW + padding;
    const by = 12 + block.y * cellH + padding;
    const bw = cellW - padding * 2;
    const bh = cellH - padding * 2;
    draw3DBlock(ctx, bx, by, bw, bh, block.h);
  });
}
