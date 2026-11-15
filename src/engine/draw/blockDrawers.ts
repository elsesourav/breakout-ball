import { BlockEngineState } from '../types';
import { BLOCK_COLORS } from '../../constants/game';
import { BlockPresetId } from '../../constants/visualPresets';

export interface BlockRenderOptions {
  animTick?: number;
  scale?: number;
}

/**
 * Universal Block Drawing Router
 * Redesigned for TRUE 3D DEPTH and MINIMAL GLOW (Clean physical bevels & materials).
 */
export function drawBlockWithPreset(
  ctx: CanvasRenderingContext2D,
  block: BlockEngineState,
  preset: BlockPresetId = 1,
  options: BlockRenderOptions = {}
) {
  if (block.isDead || block.health <= 0) return;

  switch (preset) {
    case 2:
      drawArmored3DSlabBlock(ctx, block, options);
      break;
    case 3:
      drawTactileWedgeBlock(ctx, block, options);
      break;
    case 1:
    default:
      drawTactile3DIngotBlock(ctx, block, options);
      break;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 1: TACTILE 3D INGOT (Chiseled Arcade Bevels - Zero Glow)
// ─────────────────────────────────────────────────────────────────────────────
export function drawTactile3DIngotBlock(
  ctx: CanvasRenderingContext2D,
  block: BlockEngineState,
  options: BlockRenderOptions = {}
) {
  const animTick = options.animTick || 0;
  const padding = 2;
  const config = BLOCK_COLORS[block.health] || BLOCK_COLORS[1];

  const bx = block.x + padding;
  const by = block.y + padding;
  const bw = block.w - padding * 2;
  const bh = block.h - padding * 2;

  // 3D Bevel depth dimensions
  const bevel = 4.5;
  const dropH = 5;

  ctx.save();
  ctx.shadowBlur = 0; // Strictly NO fuzzy neon blur!

  // 1. Hit White Flash
  if (block.hitAnim > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + block.hitAnim * 0.3})`;
    ctx.fillRect(bx, by, bw, bh);
    ctx.restore();
    return;
  }

  // 2. Realistic Ground Contact Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(bx + 2, by + dropH + 2, bw, bh - dropH);

  // 3. Extruded Bottom & Right Shadow Faces (Creates real 3D block volume)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(bx, by + bh - dropH, bw, dropH);
  ctx.fillRect(bx + bw - bevel, by + bevel, bevel, bh - bevel);

  // 4. Main Front Face Body
  const faceH = bh - dropH;
  if (block.health === 6) {
    // ── TITANIUM: Brushed Steel Heavy Ingot
    const steelGrad = ctx.createLinearGradient(bx, by, bx, by + faceH);
    steelGrad.addColorStop(0, '#e2e8f0');
    steelGrad.addColorStop(0.3, '#94a3b8');
    steelGrad.addColorStop(0.7, '#475569');
    steelGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = steelGrad;
    ctx.fillRect(bx, by, bw, faceH);

    // Physical Steel Ingot Ridges
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx + bevel + 2, by + faceH * 0.5 - 2, bw - bevel * 2 - 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx + bevel + 2, by + faceH * 0.5 - 3, bw - bevel * 2 - 4, 1);
  } else if (block.health === 7) {
    // ── PORTAL: Recessed Machine Well Housing Wormhole Core
    ctx.fillStyle = '#0a0d18';
    ctx.fillRect(bx, by, bw, faceH);

    // Recessed circular cavity
    const cx = bx + bw / 2;
    const cy = by + faceH / 2;
    const cavR = Math.min(bw, faceH) * 0.38;

    const cavGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, cavR);
    cavGrad.addColorStop(0, '#c084fc');
    cavGrad.addColorStop(0.5, '#3b82f6');
    cavGrad.addColorStop(0.9, '#030712');
    cavGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = cavGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, cavR, 0, Math.PI * 2);
    ctx.fill();

    // Rotating iris blade lines inside cavity
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(animTick * 2.0);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.arc(0, 0, cavR * 0.75, 0, 1.2);
      ctx.stroke();
    }
    ctx.restore();
  } else if (block.health === 8) {
    // ── EMP: Industrial Hazard Containment Block
    const empGrad = ctx.createLinearGradient(bx, by, bx, by + faceH);
    empGrad.addColorStop(0, '#d97706');
    empGrad.addColorStop(0.5, '#92400e');
    empGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = empGrad;
    ctx.fillRect(bx, by, bw, faceH);

    // Hazard Caution Stripes on Top & Bottom Bevels
    ctx.fillStyle = '#000000';
    for (let x = bx + 4; x < bx + bw - 6; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, by + 1);
      ctx.lineTo(x + 5, by + 1);
      ctx.lineTo(x + 2, by + bevel);
      ctx.lineTo(x - 3, by + bevel);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, by + faceH - bevel);
      ctx.lineTo(x + 5, by + faceH - bevel);
      ctx.lineTo(x + 2, by + faceH - 1);
      ctx.lineTo(x - 3, by + faceH - 1);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    // ── HP 1-5: Solid Tactile Color Body
    const bodyGrad = ctx.createLinearGradient(bx, by, bx, by + faceH);
    bodyGrad.addColorStop(0, config.bg[0]);
    bodyGrad.addColorStop(0.4, config.bg[1]);
    bodyGrad.addColorStop(0.85, '#0f172a');
    bodyGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(bx, by, bw, faceH);
  }

  // 5. Crisp 3D Bevel Lighting (Light source from top-left)
  // Top Bevel: Bright specular light highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + bw, by);
  ctx.lineTo(bx + bw - bevel, by + bevel);
  ctx.lineTo(bx + bevel, by + bevel);
  ctx.closePath();
  ctx.fill();

  // Left Bevel: Soft light
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + bevel, by + bevel);
  ctx.lineTo(bx + bevel, by + faceH - bevel);
  ctx.lineTo(bx, by + faceH);
  ctx.closePath();
  ctx.fill();

  // Bottom Inset Bevel: Shaded groove
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.moveTo(bx, by + faceH);
  ctx.lineTo(bx + bevel, by + faceH - bevel);
  ctx.lineTo(bx + bw - bevel, by + faceH - bevel);
  ctx.lineTo(bx + bw, by + faceH);
  ctx.closePath();
  ctx.fill();

  // Right Inset Bevel: Dark shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.moveTo(bx + bw, by);
  ctx.lineTo(bx + bw, by + faceH);
  ctx.lineTo(bx + bw - bevel, by + faceH - bevel);
  ctx.lineTo(bx + bw - bevel, by + bevel);
  ctx.closePath();
  ctx.fill();

  // 6. Subtle Micro Outer Border (Crisp 1px line, ZERO blur)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.lineWidth = 1.0;
  ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, faceH - 1);

  // 7. Engraved Tactile Typography
  renderEngravedLabel(ctx, block, config, bx + bw / 2, by + faceH / 2, faceH);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 2: ARMORED 3D SLAB (Dual-Tier Chamfered Armor - Zero Glow)
// ─────────────────────────────────────────────────────────────────────────────
export function drawArmored3DSlabBlock(
  ctx: CanvasRenderingContext2D,
  block: BlockEngineState,
  options: BlockRenderOptions = {}
) {
  const animTick = options.animTick || 0;
  const padding = 2;
  const config = BLOCK_COLORS[block.health] || BLOCK_COLORS[1];

  const bx = block.x + padding;
  const by = block.y + padding;
  const bw = block.w - padding * 2;
  const bh = block.h - padding * 2;
  const chamfer = 6;
  const depth = 5;
  const topH = bh - depth;

  ctx.save();
  ctx.shadowBlur = 0; // Strictly NO glow!

  // Hit Flash
  if (block.hitAnim > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + block.hitAnim * 0.3})`;
    drawChamferRect(ctx, bx, by, bw, bh, chamfer);
    ctx.fill();
    ctx.restore();
    return;
  }

  // 1. Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  drawChamferRect(ctx, bx + 2, by + depth + 2, bw, topH, chamfer);
  ctx.fill();

  // 2. Structural Dark Under-Chassis (Bottom Bevel Base)
  const baseGrad = ctx.createLinearGradient(bx, by + topH, bx, by + bh);
  baseGrad.addColorStop(0, '#1e293b');
  baseGrad.addColorStop(0.5, '#0f172a');
  baseGrad.addColorStop(1, '#020617');
  ctx.fillStyle = baseGrad;
  drawChamferRect(ctx, bx, by + depth * 0.4, bw, topH + depth * 0.6, chamfer);
  ctx.fill();

  // 3. Raised Chamfered Armor Plate Face
  if (block.health === 6) {
    // Titanium: Brushed Tungsten Slab
    const tungGrad = ctx.createLinearGradient(bx, by, bx, by + topH);
    tungGrad.addColorStop(0, '#cbd5e1');
    tungGrad.addColorStop(0.4, '#64748b');
    tungGrad.addColorStop(0.8, '#334155');
    tungGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = tungGrad;
    drawChamferRect(ctx, bx, by, bw, topH, chamfer);
    ctx.fill();
  } else if (block.health === 7) {
    // Portal: Heavy Iris Core
    const portalGrad = ctx.createLinearGradient(bx, by, bx, by + topH);
    portalGrad.addColorStop(0, '#1e1b4b');
    portalGrad.addColorStop(0.5, '#0f172a');
    portalGrad.addColorStop(1, '#020617');
    ctx.fillStyle = portalGrad;
    drawChamferRect(ctx, bx, by, bw, topH, chamfer);
    ctx.fill();

    // Central Dimensional Portal Disc
    const pcx = bx + bw / 2;
    const pcy = by + topH / 2;
    const pr = topH * 0.32;
    const discGrad = ctx.createRadialGradient(pcx, pcy, 1, pcx, pcy, pr);
    discGrad.addColorStop(0, '#38bdf8');
    discGrad.addColorStop(0.5, '#1e40af');
    discGrad.addColorStop(1, '#020617');
    ctx.fillStyle = discGrad;
    ctx.beginPath();
    ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
    ctx.fill();
  } else if (block.health === 8) {
    // EMP: Armored Hazard Battery
    const empGrad = ctx.createLinearGradient(bx, by, bx, by + topH);
    empGrad.addColorStop(0, '#b45309');
    empGrad.addColorStop(0.4, '#78350f');
    empGrad.addColorStop(1, '#290e02');
    ctx.fillStyle = empGrad;
    drawChamferRect(ctx, bx, by, bw, topH, chamfer);
    ctx.fill();
  } else {
    // Standard Colors
    const plateGrad = ctx.createLinearGradient(bx, by, bx, by + topH);
    plateGrad.addColorStop(0, config.bg[0]);
    plateGrad.addColorStop(0.35, config.bg[1]);
    plateGrad.addColorStop(0.8, '#0b1326');
    plateGrad.addColorStop(1, '#030712');
    ctx.fillStyle = plateGrad;
    drawChamferRect(ctx, bx, by, bw, topH, chamfer);
    ctx.fill();
  }

  // 4. Directional Top Specular Sheen Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(bx + chamfer + 2, by + 1.5);
  ctx.lineTo(bx + bw - chamfer - 2, by + 1.5);
  ctx.stroke();

  // Crisp Steel Outer Bevel Frame (No glow)
  ctx.strokeStyle = '#0a0f1d';
  ctx.lineWidth = 1.8;
  drawChamferRect(ctx, bx, by, bw, topH, chamfer);
  ctx.stroke();

  // 5. 4 Physical Recessed Corner Bolt Sockets (Light/Shadow detail)
  const inset = 5.5;
  [
    [bx + inset, by + inset],
    [bx + bw - inset, by + inset],
    [bx + inset, by + topH - inset],
    [bx + bw - inset, by + topH - inset],
  ].forEach(([cx, cy]) => {
    // Dark Socket
    ctx.fillStyle = '#060a14';
    ctx.beginPath();
    ctx.arc(cx, cy, 2.0, 0, Math.PI * 2);
    ctx.fill();
    // Specular Glint (Top-Left)
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(cx - 0.5, cy - 0.5, 0.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Engraved Label
  renderEngravedLabel(ctx, block, config, bx + bw / 2, by + topH / 2, topH);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 3: TACTILE WEDGE (Sculpted Arcade Keycap - Zero Glow)
// ─────────────────────────────────────────────────────────────────────────────
export function drawTactileWedgeBlock(
  ctx: CanvasRenderingContext2D,
  block: BlockEngineState,
  options: BlockRenderOptions = {}
) {
  const animTick = options.animTick || 0;
  const padding = 2;
  const config = BLOCK_COLORS[block.health] || BLOCK_COLORS[1];

  const bx = block.x + padding;
  const by = block.y + padding;
  const bw = block.w - padding * 2;
  const bh = block.h - padding * 2;
  const r = 4;
  const dropH = 6;
  const topH = bh - dropH;

  ctx.save();
  ctx.shadowBlur = 0; // Strictly NO glow!

  // Hit Flash
  if (block.hitAnim > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.75 + block.hitAnim * 0.25})`;
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, r);
    else ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.restore();
    return;
  }

  // 1. Heavy Contact Shadow Underneath
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  if (ctx.roundRect) ctx.roundRect(bx + 2, by + dropH + 2, bw, topH, r);
  else ctx.rect(bx + 2, by + dropH + 2, bw, topH);
  ctx.fill();

  // 2. Steep Bottom Drop-Face (Cast Shadow)
  const dropGrad = ctx.createLinearGradient(bx, by + topH, bx, by + bh);
  dropGrad.addColorStop(0, '#090d16');
  dropGrad.addColorStop(1, '#020408');
  ctx.fillStyle = dropGrad;
  if (ctx.roundRect) ctx.roundRect(bx, by + topH * 0.5, bw, topH * 0.5 + dropH, r);
  else ctx.rect(bx, by + topH * 0.5, bw, topH * 0.5 + dropH);
  ctx.fill();

  // 3. Sculpted Slanted Top Crown
  const crownGrad = ctx.createLinearGradient(bx, by, bx, by + topH);
  if (block.health === 6) {
    crownGrad.addColorStop(0, '#f1f5f9');
    crownGrad.addColorStop(0.3, '#94a3b8');
    crownGrad.addColorStop(0.7, '#475569');
    crownGrad.addColorStop(1, '#1e293b');
  } else if (block.health === 7) {
    crownGrad.addColorStop(0, '#38bdf8');
    crownGrad.addColorStop(0.4, '#1e3a8a');
    crownGrad.addColorStop(1, '#020617');
  } else if (block.health === 8) {
    crownGrad.addColorStop(0, '#fbbf24');
    crownGrad.addColorStop(0.35, '#b45309');
    crownGrad.addColorStop(1, '#3b1202');
  } else {
    crownGrad.addColorStop(0, config.bg[0]);
    crownGrad.addColorStop(0.4, config.bg[1]);
    crownGrad.addColorStop(0.85, '#0f172a');
    crownGrad.addColorStop(1, '#050914');
  }

  ctx.fillStyle = crownGrad;
  if (ctx.roundRect) ctx.roundRect(bx, by, bw, topH, r);
  else ctx.rect(bx, by, bw, topH);
  ctx.fill();

  // 4. Recessed Inner Pill Well for Number
  const pillW = bw * 0.55;
  const pillH = topH * 0.65;
  const pillX = bx + (bw - pillW) / 2;
  const pillY = by + (topH - pillH) / 2;

  ctx.fillStyle = '#050912';
  if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
  else ctx.rect(pillX, pillY, pillW, pillH);
  ctx.fill();

  // Pill top shadow rim
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, 2, 1);
  ctx.fill();

  // 5. Crisp Specular Top-Ridge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillRect(bx + r, by + 1, bw - r * 2, 1.2);

  // Outer Border (Zero glow)
  ctx.strokeStyle = '#050811';
  ctx.lineWidth = 1.4;
  if (ctx.roundRect) ctx.roundRect(bx, by, bw, topH, r);
  else ctx.rect(bx, by, bw, topH);
  ctx.stroke();

  // Engraved Label
  renderEngravedLabel(ctx, block, config, bx + bw / 2, by + topH / 2, topH);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED 3D ENGRAVED TYPOGRAPHY (Physical Chiseled Effect - Zero Glow)
// ─────────────────────────────────────────────────────────────────────────────
function renderEngravedLabel(
  ctx: CanvasRenderingContext2D,
  block: BlockEngineState,
  config: { text: string; border: string },
  cx: number,
  cy: number,
  faceH: number
) {
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let text = String(block.health);
  if (block.health === 6) text = '∞';
  else if (block.health === 7) text = '🌀';
  else if (block.health === 8) {
    const count = block.counter !== undefined ? block.counter : 3;
    text = `[${count}]`;
  }

  const fontSize = Math.floor(faceH * 0.52);
  ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Orbitron', monospace`;

  // 1. Engraved Bottom Highlight Bevel (Light hitting lower inner groove)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText(text, cx, cy + 1.2);

  // 2. Engraved Top Drop Shadow (Shadow inside upper inner groove)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillText(text, cx, cy - 1.0);

  // 3. Crisp Surface Text Fill
  ctx.fillStyle = block.health === 8 && block.counter === 1 ? '#ff0055' : config.text;
  ctx.fillText(text, cx, cy);
}

/**
 * Chamfered Rectangle Helper Path
 */
function drawChamferRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c: number
) {
  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + w - c, y);
  ctx.lineTo(x + w, y + c);
  ctx.lineTo(x + w, y + h - c);
  ctx.lineTo(x + w - c, y + h);
  ctx.lineTo(x + c, y + h);
  ctx.lineTo(x, y + h - c);
  ctx.lineTo(x, y + c);
  ctx.closePath();
}
