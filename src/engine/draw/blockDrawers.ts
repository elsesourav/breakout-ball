import { BlockEngineState } from '../types';
import { BLOCK_COLORS } from '../../constants/game';
import { renderRefinedPortalCenter, PortalCenterStyle, PORTAL_PAIR_THEMES } from './portalCenterDrawers';

export type { PortalCenterStyle };

export interface BlockRenderOptions {
  animTick?: number;
  scale?: number;
  portalCenterStyle?: PortalCenterStyle;
}

/**
 * Universal Block Drawing Router (Selected Design: Armored 3D Slab)
 *
 * Physical 3D thickness with tone-matched bevels (NO muddy dark bottom).
 * Titanium Block (HP 6): 100% static brushed tungsten-titanium alloy (zero animation, zero lag).
 * Breakable Blocks (HP 1-5 & EMP 8): Lightweight, zero-lag micro-shimmer on top chamfer.
 * Portal Block (HP 7): Full cosmic background with high-tech Quantum Stargate center (no cartoon swirl emoji).
 */
export function drawBlockWithPreset(
  ctx: CanvasRenderingContext2D,
  block: BlockEngineState,
  _preset = 1,
  options: BlockRenderOptions = {}
) {
  if (block.isDead || block.health <= 0) return;
  drawArmored3DSlabBlock(ctx, block, options);
}

export function drawBlock(
  ctx: CanvasRenderingContext2D,
  block: BlockEngineState,
  options: BlockRenderOptions = {}
) {
  if (block.isDead || block.health <= 0) return;
  drawArmored3DSlabBlock(ctx, block, options);
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
// ARMORED 3D SLAB BLOCK (Tone-Matched Bevels · Refined Portal Center)
// ─────────────────────────────────────────────────────────────────────────────
export function drawArmored3DSlabBlock(
  ctx: CanvasRenderingContext2D,
  block: BlockEngineState,
  options: BlockRenderOptions = {}
) {
  const animTick = options.animTick || 0;
  const config = BLOCK_COLORS[block.health] || BLOCK_COLORS[1];

  // Proportional padding, chamfer, and bevel depth scaled cleanly to any canvas resolution
  const padding = Math.max(0.6, Math.min(2.0, Math.min(block.w, block.h) * 0.05));
  const bx = block.x + padding;
  const by = block.y + padding;
  const bw = block.w - padding * 2;
  const bh = block.h - padding * 2;
  const chamfer = Math.max(1.0, Math.min(6.0, Math.min(bw * 0.09, bh * 0.16)));
  const bevelDepth = Math.max(0.8, Math.min(4.5, bh * 0.11));
  const topH = bh - bevelDepth;
  const portalStyle = options.portalCenterStyle || 3;

  ctx.save();
  ctx.shadowBlur = 0; // Strictly NO fuzzy neon blur!

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

  // 2. TONE-MATCHED 3D Under-Bevel Face (No muddy dark black base)
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
    // HP 1-5 & EMP: Rich, tone-matched colored 3D bevel (NEVER pitch black)
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
    // ── PORTAL (HP 7): FULL-BLOCK MAGICAL COSMIC VORTEX WITH HIGH-TECH STARGATE CENTER ──
    const isRecharging = (block.portalRechargeTimer ?? 0) > 0;
    const prevAlpha = ctx.globalAlpha;
    if (isRecharging) {
      // 3-second recharge break: render with distinct transparency (acts like a normal nothing)
      const ticksLeft = block.portalRechargeTimer ?? 0;
      const dormantAlpha = ticksLeft < 30 ? 0.22 + ((30 - ticksLeft) / 30) * 0.78 : 0.22;
      ctx.globalAlpha = prevAlpha * dormantAlpha;
    }

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
    const pairTheme = PORTAL_PAIR_THEMES[block.portalPairId || 1] || PORTAL_PAIR_THEMES[1];
    ctx.save();
    ctx.translate(pcx, pcy);
    ctx.rotate(animTick * 1.5);

    for (let arm = 0; arm < 3; arm++) {
      ctx.rotate((Math.PI * 2) / 3);
      const armGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, maxR);
      armGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      armGrad.addColorStop(0.3, pairTheme.primary);
      armGrad.addColorStop(0.65, pairTheme.secondary);
      armGrad.addColorStop(0.85, pairTheme.dark);
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

    // ── REFINED PORTAL CENTER (High-tech Stargate/Singularity aperture) ──
    renderRefinedPortalCenter(ctx, pcx, pcy, topH * 0.42, animTick, portalStyle, block.portalPairId || 1);

    ctx.restore(); // Unclip

    // Shimmering dimensional event-horizon border around the chamfered rim in pair's distinct color
    ctx.strokeStyle = pairTheme.primary;
    ctx.lineWidth = 1.6;
    drawChamferRect(ctx, bx, by, bw, topH, chamfer);
    ctx.stroke();

    if (isRecharging) {
      ctx.globalAlpha = prevAlpha;
    }
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

  // 6. 4 Physical Recessed Corner Bolt Sockets (Proportional to block size)
  const showBolts = bw >= 18 && topH >= 10;
  if (showBolts) {
    const inset = Math.max(1.5, Math.min(5.5, Math.min(bw * 0.09, topH * 0.16)));
    const boltR = Math.max(0.6, Math.min(2.0, bw * 0.024));
    [
      [bx + inset, by + inset],
      [bx + bw - inset, by + inset],
      [bx + inset, by + topH - inset],
      [bx + bw - inset, by + topH - inset],
    ].forEach(([cx, cy]) => {
      // Recessed dark socket
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.arc(cx, cy, boltR, 0, Math.PI * 2);
      ctx.fill();
      // Specular corner glint (Top-left)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(cx - boltR * 0.25, cy - boltR * 0.25, boltR * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 7. Engraved Tactile Typography / Portal Telemetry Resonance Node
  if (block.health !== 7) {
    renderEngravedLabel(ctx, block, config, bx + bw / 2, by + topH / 2, topH);
  } else if (block.portalPairId !== undefined) {
    // Portal telemetry resonance node (Identified strictly by distinct pair color — NO NUMBERS)
    const isRecharging = (block.portalRechargeTimer ?? 0) > 0;
    const pairTheme = PORTAL_PAIR_THEMES[block.portalPairId] || PORTAL_PAIR_THEMES[1];
    ctx.save();
    if (isRecharging) {
      const ticksLeft = block.portalRechargeTimer ?? 0;
      const dormantAlpha = ticksLeft < 30 ? 0.22 + ((30 - ticksLeft) / 30) * 0.78 : 0.22;
      ctx.globalAlpha = dormantAlpha;
    }
    const tagR = Math.max(3.0, Math.min(6.5, topH * 0.20));
    const tagX = bx + bw - tagR - Math.max(2, bw * 0.05);
    const tagY = by + tagR + Math.max(2, topH * 0.08);

    // Dark inset bezel
    ctx.fillStyle = 'rgba(5, 7, 20, 0.85)';
    ctx.strokeStyle = pairTheme.primary;
    ctx.lineWidth = Math.max(1.0, tagR * 0.25);
    ctx.beginPath();
    ctx.arc(tagX, tagY, tagR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Vibrant glowing quantum core gem
    const coreGrad = ctx.createRadialGradient(tagX - tagR * 0.2, tagY - tagR * 0.2, 0.5, tagX, tagY, tagR * 0.65);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, pairTheme.primary);
    coreGrad.addColorStop(1.0, pairTheme.secondary);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(tagX, tagY, tagR * 0.62, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight glint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(tagX - tagR * 0.25, tagY - tagR * 0.25, Math.max(0.6, tagR * 0.2), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Shared 3D Engraved Typography (Physical Relief Bevels · Scale-Independent)
 */
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
  else if (block.health === 8) text = '⚡';

  const fontSize = Math.max(5.5, Math.floor(faceH * 0.52));
  ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Orbitron', monospace`;

  const shadowOffset = Math.max(0.35, Math.min(1.0, faceH * 0.045));
  // 1. Engraved Bottom Highlight Bevel (Light hitting lower inner groove)
  if (faceH >= 12) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(text, cx, cy + shadowOffset);
  }

  // 2. Engraved Top Drop Shadow (Shadow inside upper inner groove)
  if (faceH >= 8) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillText(text, cx, cy - shadowOffset);
  }

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
