import { BlockEngineState } from '../types';
import { BLOCK_COLORS } from '../../constants/game';
import { BlockPresetId } from '../../constants/visualPresets';

export interface BlockRenderOptions {
  animTick?: number;
  scale?: number;
}

/**
 * Universal Block Drawing Router
 * Redesigned for TRUE 3D DEPTH and MINIMAL GLOW:
 *   - Clean physical bevels & tone-matched 3D thickness (NO muddy dark bottom!).
 *   - Portal Block (HP 7): Magical cosmic vortex across the ENTIRE block face.
 *   - Titanium Block (HP 6): 100% static brushed tungsten-titanium alloy (ZERO animated effects, zero lag).
 *   - Breakable Blocks (HP 1-5 & EMP 8): Lightweight, zero-lag micro-shimmer on top chamfer.
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
      drawPrecisionIngotBlock(ctx, block, options);
      break;
    case 3:
      drawReinforcedAlloyBlock(ctx, block, options);
      break;
    case 1:
    default:
      drawArmored3DSlabBlock(ctx, block, options);
      break;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TONE-MATCHED 3D DEPTH PALETTES (Replaces muddy black base with rich physical colors)
// ─────────────────────────────────────────────────────────────────────────────
interface BlockColorTones {
  topHighlight: string;
  faceTop: string;
  faceBottom: string;
  bevelTop: string;
  bevelBottom: string;
  rimBorder: string;
}

function getBlockTones(hp: number): BlockColorTones {
  switch (hp) {
    case 1: // Electric Cyan
      return {
        topHighlight: 'rgba(255, 255, 255, 0.65)',
        faceTop: '#00f7ff',
        faceBottom: '#0077b6',
        bevelTop: '#005f96',
        bevelBottom: '#00436d',
        rimBorder: '#0096c7',
      };
    case 2: // Vibrant Amber-Gold
      return {
        topHighlight: 'rgba(255, 255, 255, 0.65)',
        faceTop: '#fef08a',
        faceBottom: '#eab308',
        bevelTop: '#a16207',
        bevelBottom: '#713f12',
        rimBorder: '#ca8a04',
      };
    case 3: // Neon Emerald
      return {
        topHighlight: 'rgba(255, 255, 255, 0.65)',
        faceTop: '#4ade80',
        faceBottom: '#16a34a',
        bevelTop: '#15803d',
        bevelBottom: '#14532d',
        rimBorder: '#22c55e',
      };
    case 4: // Electric Purple
      return {
        topHighlight: 'rgba(255, 255, 255, 0.65)',
        faceTop: '#c084fc',
        faceBottom: '#7e22ce',
        bevelTop: '#6b21a8',
        bevelBottom: '#4c1d95',
        rimBorder: '#9333ea',
      };
    case 5: // Vivid Ruby / Rose
      return {
        topHighlight: 'rgba(255, 255, 255, 0.65)',
        faceTop: '#fb7185',
        faceBottom: '#e11d48',
        bevelTop: '#be123c',
        bevelBottom: '#881337',
        rimBorder: '#f43f5e',
      };
    case 8: // EMP Reactor Amber
      return {
        topHighlight: 'rgba(255, 255, 255, 0.65)',
        faceTop: '#fbbf24',
        faceBottom: '#ea580c',
        bevelTop: '#c2410c',
        bevelBottom: '#7c2d12',
        rimBorder: '#f97316',
      };
    default:
      return {
        topHighlight: 'rgba(255, 255, 255, 0.5)',
        faceTop: '#38bdf8',
        faceBottom: '#0284c7',
        bevelTop: '#0369a1',
        bevelBottom: '#075985',
        rimBorder: '#0284c7',
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 1 (CHOSEN): ARMORED 3D SLAB (Tone-Matched 3D Bevels · Zero Glow)
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
  const bevelDepth = 4.5;
  const topH = bh - bevelDepth;

  ctx.save();
  ctx.shadowBlur = 0; // Strictly NO fuzzy blur!

  // Hit Flash
  if (block.hitAnim > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.75 + block.hitAnim * 0.25})`;
    drawChamferRect(ctx, bx, by, bw, bh, chamfer);
    ctx.fill();
    ctx.restore();
    return;
  }

  // 1. Crisp Ground Drop Shadow (Soft ambient contact underneath only)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  drawChamferRect(ctx, bx + 1.5, by + bevelDepth + 1.5, bw, topH, chamfer);
  ctx.fill();

  // 2. TONE-MATCHED 3D Under-Bevel Face (Eliminates the dark muddy base!)
  if (block.health === 6) {
    // Titanium: Solid Machined Tungsten Base
    const tungBase = ctx.createLinearGradient(bx, by + topH, bx, by + bh);
    tungBase.addColorStop(0, '#334155');
    tungBase.addColorStop(1, '#1e293b');
    ctx.fillStyle = tungBase;
    drawChamferRect(ctx, bx, by + bevelDepth * 0.4, bw, topH + bevelDepth * 0.6, chamfer);
    ctx.fill();
  } else if (block.health === 7) {
    // Portal: Deep Celestial Midnight Base
    const portBase = ctx.createLinearGradient(bx, by + topH, bx, by + bh);
    portBase.addColorStop(0, '#1e1145');
    portBase.addColorStop(1, '#0e0524');
    ctx.fillStyle = portBase;
    drawChamferRect(ctx, bx, by + bevelDepth * 0.4, bw, topH + bevelDepth * 0.6, chamfer);
    ctx.fill();
  } else {
    // HP 1-5 & EMP: Rich, tone-matched colored 3D bevel (NEVER pitch black!)
    const tones = getBlockTones(block.health);
    const bevelGrad = ctx.createLinearGradient(bx, by + topH, bx, by + bh);
    bevelGrad.addColorStop(0, tones.bevelTop);
    bevelGrad.addColorStop(1, tones.bevelBottom);
    ctx.fillStyle = bevelGrad;
    drawChamferRect(ctx, bx, by + bevelDepth * 0.4, bw, topH + bevelDepth * 0.6, chamfer);
    ctx.fill();
  }

  // 3. Raised Front Face Plate
  if (block.health === 6) {
    // ── TITANIUM (HP 6): 100% STATIC SOLID TUNGSTEN ALLOY (ZERO ANIMATION) ──
    const tungGrad = ctx.createLinearGradient(bx, by, bx, by + topH);
    tungGrad.addColorStop(0, '#e2e8f0');
    tungGrad.addColorStop(0.35, '#94a3b8');
    tungGrad.addColorStop(0.75, '#475569');
    tungGrad.addColorStop(1.0, '#334155');
    ctx.fillStyle = tungGrad;
    drawChamferRect(ctx, bx, by, bw, topH, chamfer);
    ctx.fill();

    // Physical Brushed Finish Ribs (Static, zero effects, zero lag)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(bx + chamfer, by + topH * 0.35, bw - chamfer * 2, 1.2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(bx + chamfer, by + topH * 0.65, bw - chamfer * 2, 1.2);

    // Static Outer Steel Frame
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.6;
    drawChamferRect(ctx, bx, by, bw, topH, chamfer);
    ctx.stroke();
  } else if (block.health === 7) {
    // ── PORTAL (HP 7): FULL-BLOCK MAGICAL COSMIC VORTEX (WHOLE SURFACE EFFECT) ──
    // Deep midnight nebula base
    const portalBaseGrad = ctx.createLinearGradient(bx, by, bx, by + topH);
    portalBaseGrad.addColorStop(0, '#13092c');
    portalBaseGrad.addColorStop(0.5, '#0b041c');
    portalBaseGrad.addColorStop(1, '#050110');
    ctx.fillStyle = portalBaseGrad;
    drawChamferRect(ctx, bx, by, bw, topH, chamfer);
    ctx.fill();

    // Strictly clip within block surface for seamless cosmic portal
    ctx.save();
    drawChamferRect(ctx, bx, by, bw, topH, chamfer);
    ctx.clip();

    const pcx = bx + bw / 2;
    const pcy = by + topH / 2;
    const maxR = Math.hypot(bw, topH) * 0.55;

    // Sweeping rotating cosmic nebula arms spanning across the entire block face
    ctx.save();
    ctx.translate(pcx, pcy);
    ctx.rotate(animTick * 1.5);

    for (let arm = 0; arm < 3; arm++) {
      ctx.rotate((Math.PI * 2) / 3);
      const armGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, maxR);
      armGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      armGrad.addColorStop(0.25, 'rgba(56, 189, 248, 0.6)');
      armGrad.addColorStop(0.6, 'rgba(192, 132, 252, 0.45)');
      armGrad.addColorStop(0.85, 'rgba(244, 63, 94, 0.2)');
      armGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = armGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(maxR * 0.3, maxR * 0.12, maxR * 0.6, maxR * 0.45, maxR, maxR * 0.22);
      ctx.bezierCurveTo(maxR * 0.7, maxR * 0.65, maxR * 0.35, maxR * 0.32, 0, 0);
      ctx.fill();
    }
    ctx.restore();

    // Scattered sparkling celestial stars across the whole block
    const starCoords = [
      [-0.38, -0.28, 1.2],
      [0.35, -0.25, 1.4],
      [-0.32, 0.3, 1.0],
      [0.36, 0.26, 1.3],
      [-0.15, -0.35, 0.9],
      [0.18, 0.32, 1.1],
      [0.0, -0.22, 1.5],
    ];
    starCoords.forEach(([sx, sy, sz], idx) => {
      const starAlpha = Math.sin(animTick * 3.5 + idx * 1.5) * 0.35 + 0.65;
      ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
      ctx.beginPath();
      ctx.arc(pcx + sx * bw, pcy + sy * topH, sz, 0, Math.PI * 2);
      ctx.fill();
    });

    // Central Singularity Event-Horizon Core
    const coreR = Math.min(bw, topH) * 0.3;
    const holeGrad = ctx.createRadialGradient(pcx, pcy, 1, pcx, pcy, coreR);
    holeGrad.addColorStop(0, '#ffffff');
    holeGrad.addColorStop(0.35, '#38bdf8');
    holeGrad.addColorStop(0.75, '#8b5cf6');
    holeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = holeGrad;
    ctx.beginPath();
    ctx.arc(pcx, pcy, coreR, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Unclip

    // Shimmering dimensional event-horizon border around the chamfered rim
    const borderPulse = Math.sin(animTick * 2.5) * 0.25 + 0.75;
    ctx.strokeStyle = `rgba(56, 189, 248, ${borderPulse})`;
    ctx.lineWidth = 1.6;
    drawChamferRect(ctx, bx, by, bw, topH, chamfer);
    ctx.stroke();
  } else {
    // ── HP 1-5 & EMP 8: RICH VIBRANT METALLIC SLAB (NO DARK MUDDY BOTTOM) ──
    const tones = getBlockTones(block.health);
    const plateGrad = ctx.createLinearGradient(bx, by, bx, by + topH);
    plateGrad.addColorStop(0, tones.faceTop);
    plateGrad.addColorStop(0.5, config.bg[1]);
    plateGrad.addColorStop(1.0, tones.bevelTop);
    ctx.fillStyle = plateGrad;
    drawChamferRect(ctx, bx, by, bw, topH, chamfer);
    ctx.fill();

    // 4. Subtle, Zero-Lag Micro-Shimmer on Breakable Blocks (Locked 60 FPS)
    const shimmer = Math.sin(animTick * 2.2 + (bx * 0.04 + by * 0.06));
    if (shimmer > 0.6) {
      const glintAlpha = (shimmer - 0.6) * 0.55;
      ctx.strokeStyle = `rgba(255, 255, 255, ${glintAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx + chamfer + 2, by + 1.5);
      ctx.lineTo(bx + bw - chamfer - 2, by + 1.5);
      ctx.stroke();
    }

    // Outer Crisp Bevel Frame
    ctx.strokeStyle = tones.rimBorder;
    ctx.lineWidth = 1.6;
    drawChamferRect(ctx, bx, by, bw, topH, chamfer);
    ctx.stroke();
  }

  // 5. Specular Top Sheen Highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(bx + chamfer + 2, by + 1.5);
  ctx.lineTo(bx + bw - chamfer - 2, by + 1.5);
  ctx.stroke();

  // 6. 4 Physical Recessed Corner Bolt Sockets (Mechanical Depth Detail)
  const inset = 5.5;
  [
    [bx + inset, by + inset],
    [bx + bw - inset, by + inset],
    [bx + inset, by + topH - inset],
    [bx + bw - inset, by + topH - inset],
  ].forEach(([cx, cy]) => {
    // Recessed dark socket
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.arc(cx, cy, 2.0, 0, Math.PI * 2);
    ctx.fill();
    // Specular corner glint (Top-left)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(cx - 0.5, cy - 0.5, 0.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // 7. Engraved Tactile Typography
  renderEngravedLabel(ctx, block, config, bx + bw / 2, by + topH / 2, topH);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 2: PRECISION INGOT (Multi-Faceted Chiseled 3D · Tone-Matched Bevels)
// ─────────────────────────────────────────────────────────────────────────────
export function drawPrecisionIngotBlock(
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
  const bevel = 4.5;
  const dropH = 5;
  const faceH = bh - dropH;

  ctx.save();
  ctx.shadowBlur = 0;

  // Hit Flash
  if (block.hitAnim > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.75 + block.hitAnim * 0.25})`;
    ctx.fillRect(bx, by, bw, bh);
    ctx.restore();
    return;
  }

  // 1. Ambient Ground Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(bx + 1.5, by + dropH + 1.5, bw, bh - dropH);

  // 2. TONE-MATCHED 3D Extruded Bevel (No muddy black!)
  if (block.health === 6) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(bx, by + bh - dropH, bw, dropH);
    ctx.fillRect(bx + bw - bevel, by + bevel, bevel, bh - bevel);
  } else if (block.health === 7) {
    ctx.fillStyle = '#100726';
    ctx.fillRect(bx, by + bh - dropH, bw, dropH);
    ctx.fillRect(bx + bw - bevel, by + bevel, bevel, bh - bevel);
  } else {
    const tones = getBlockTones(block.health);
    ctx.fillStyle = tones.bevelBottom;
    ctx.fillRect(bx, by + bh - dropH, bw, dropH);
    ctx.fillStyle = tones.bevelTop;
    ctx.fillRect(bx + bw - bevel, by + bevel, bevel, bh - bevel);
  }

  // 3. Main Face
  if (block.health === 6) {
    // Titanium: 100% Static Brushed Ingot
    const steelGrad = ctx.createLinearGradient(bx, by, bx, by + faceH);
    steelGrad.addColorStop(0, '#e2e8f0');
    steelGrad.addColorStop(0.35, '#94a3b8');
    steelGrad.addColorStop(0.75, '#475569');
    steelGrad.addColorStop(1, '#334155');
    ctx.fillStyle = steelGrad;
    ctx.fillRect(bx, by, bw, faceH);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(bx + bevel + 2, by + faceH * 0.5 - 2, bw - bevel * 2 - 4, 3);
  } else if (block.health === 7) {
    // Portal: Full Cosmic Abyss
    const pGrad = ctx.createLinearGradient(bx, by, bx, by + faceH);
    pGrad.addColorStop(0, '#13092c');
    pGrad.addColorStop(1, '#050110');
    ctx.fillStyle = pGrad;
    ctx.fillRect(bx, by, bw, faceH);

    // Full-block cosmic vortex
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx, by, bw, faceH);
    ctx.clip();

    const pcx = bx + bw / 2;
    const pcy = by + faceH / 2;
    const maxR = Math.hypot(bw, faceH) * 0.55;
    ctx.translate(pcx, pcy);
    ctx.rotate(animTick * 1.5);
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      const ag = ctx.createRadialGradient(0, 0, 1, 0, 0, maxR);
      ag.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      ag.addColorStop(0.3, 'rgba(56, 189, 248, 0.55)');
      ag.addColorStop(0.7, 'rgba(168, 85, 247, 0.35)');
      ag.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(0, 0, maxR * 0.7, 0, 1.4);
      ctx.lineTo(0, 0);
      ctx.fill();
    }
    ctx.restore();
  } else {
    const tones = getBlockTones(block.health);
    const bodyGrad = ctx.createLinearGradient(bx, by, bx, by + faceH);
    bodyGrad.addColorStop(0, tones.faceTop);
    bodyGrad.addColorStop(0.5, config.bg[1]);
    bodyGrad.addColorStop(1, tones.bevelTop);
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(bx, by, bw, faceH);

    // Micro-Shimmer on breakable blocks
    const shimmer = Math.sin(animTick * 2.2 + (bx * 0.04 + by * 0.06));
    if (shimmer > 0.6) {
      const glintAlpha = (shimmer - 0.6) * 0.55;
      ctx.fillStyle = `rgba(255, 255, 255, ${glintAlpha})`;
      ctx.fillRect(bx + bevel, by + 1, bw - bevel * 2, 1.5);
    }
  }

  // 4. Chiseled Bevels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + bw, by);
  ctx.lineTo(bx + bw - bevel, by + bevel);
  ctx.lineTo(bx + bevel, by + bevel);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.moveTo(bx, by + faceH);
  ctx.lineTo(bx + bevel, by + faceH - bevel);
  ctx.lineTo(bx + bw - bevel, by + faceH - bevel);
  ctx.lineTo(bx + bw, by + faceH);
  ctx.closePath();
  ctx.fill();

  // 5. Engraved Label
  renderEngravedLabel(ctx, block, config, bx + bw / 2, by + faceH / 2, faceH);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 3: REINFORCED ALLOY (Dual-Tier Chassis · Tone-Matched 3D)
// ─────────────────────────────────────────────────────────────────────────────
export function drawReinforcedAlloyBlock(
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
  const r = 5;
  const dropH = 5;
  const topH = bh - dropH;

  ctx.save();
  ctx.shadowBlur = 0;

  // Hit Flash
  if (block.hitAnim > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.75 + block.hitAnim * 0.25})`;
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, r);
    else ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.restore();
    return;
  }

  // 1. Ambient Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  if (ctx.roundRect) ctx.roundRect(bx + 1.5, by + dropH + 1.5, bw, topH, r);
  else ctx.rect(bx + 1.5, by + dropH + 1.5, bw, topH);
  ctx.fill();

  // 2. TONE-MATCHED 3D Base
  if (block.health === 6) {
    ctx.fillStyle = '#1e293b';
  } else if (block.health === 7) {
    ctx.fillStyle = '#100726';
  } else {
    const tones = getBlockTones(block.health);
    ctx.fillStyle = tones.bevelBottom;
  }
  if (ctx.roundRect) ctx.roundRect(bx, by + topH * 0.5, bw, topH * 0.5 + dropH, r);
  else ctx.rect(bx, by + topH * 0.5, bw, topH * 0.5 + dropH);
  ctx.fill();

  // 3. Top Face
  if (block.health === 6) {
    const tungGrad = ctx.createLinearGradient(bx, by, bx, by + topH);
    tungGrad.addColorStop(0, '#e2e8f0');
    tungGrad.addColorStop(0.4, '#94a3b8');
    tungGrad.addColorStop(1, '#334155');
    ctx.fillStyle = tungGrad;
  } else if (block.health === 7) {
    const pGrad = ctx.createLinearGradient(bx, by, bx, by + topH);
    pGrad.addColorStop(0, '#13092c');
    pGrad.addColorStop(1, '#050110');
    ctx.fillStyle = pGrad;
  } else {
    const tones = getBlockTones(block.health);
    const bodyGrad = ctx.createLinearGradient(bx, by, bx, by + topH);
    bodyGrad.addColorStop(0, tones.faceTop);
    bodyGrad.addColorStop(0.5, config.bg[1]);
    bodyGrad.addColorStop(1, tones.bevelTop);
    ctx.fillStyle = bodyGrad;
  }

  if (ctx.roundRect) ctx.roundRect(bx, by, bw, topH, r);
  else ctx.rect(bx, by, bw, topH);
  ctx.fill();

  // Full cosmic vortex for Portal
  if (block.health === 7) {
    ctx.save();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, topH, r);
    ctx.clip();
    const pcx = bx + bw / 2;
    const pcy = by + topH / 2;
    const maxR = Math.hypot(bw, topH) * 0.55;
    ctx.translate(pcx, pcy);
    ctx.rotate(animTick * 1.5);
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      const ag = ctx.createRadialGradient(0, 0, 1, 0, 0, maxR);
      ag.addColorStop(0, '#ffffff');
      ag.addColorStop(0.3, '#38bdf8');
      ag.addColorStop(0.7, '#8b5cf6');
      ag.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(0, 0, maxR * 0.7, 0, 1.4);
      ctx.lineTo(0, 0);
      ctx.fill();
    }
    ctx.restore();
  }

  // Micro-shimmer on breakable blocks
  if (block.health !== 6 && block.health !== 7) {
    const shimmer = Math.sin(animTick * 2.2 + (bx * 0.04 + by * 0.06));
    if (shimmer > 0.6) {
      const glintAlpha = (shimmer - 0.6) * 0.55;
      ctx.fillStyle = `rgba(255, 255, 255, ${glintAlpha})`;
      ctx.fillRect(bx + r, by + 1, bw - r * 2, 1.5);
    }
  }

  // Specular Top Ridge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillRect(bx + r, by + 1, bw - r * 2, 1.2);

  // Outer Border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 1.2;
  if (ctx.roundRect) ctx.roundRect(bx, by, bw, topH, r);
  else ctx.rect(bx, by, bw, topH);
  ctx.stroke();

  // Engraved Label
  renderEngravedLabel(ctx, block, config, bx + bw / 2, by + topH / 2, topH);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED 3D ENGRAVED TYPOGRAPHY (Physical Relief Bevels · Zero Glow)
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
