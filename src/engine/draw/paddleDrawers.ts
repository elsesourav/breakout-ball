import { PaddleState } from '../types';
import {
  PaddleTier,
  TopWeaponVariant,
  getPaddleTierFromUpgrades,
} from '../../constants/visualPresets';

export interface PaddleRenderOptions {
  animTick?: number;
  hasLaser?: boolean;
  hasShield?: boolean;
  tier?: PaddleTier;
  widthLevel?: number;
  speedLevel?: number;
  weaponVariant?: TopWeaponVariant;
}

/**
 * Universal Paddle Drawer (Chosen Design: Mech Titan Dreadnought)
 *
 * Dynamically evolves across 3 progressive Armory Upgrade Tiers:
 *   - Tier 1: Base Heavy Gunmetal Plating, Dual Heat Vents, Hazard Chevron Plate
 *   - Tier 2: Reinforced Plating, Dual Ion Thrusters with Plasma Flames, Quad Vents
 *   - Tier 3: Apex Overdrive, Quad Thrusters, Reinforced Side Deflection Winglets, Deflector Forcefield
 *
 * Top Weapon Mount Options (Eliminates ugly red antenna stalks):
 *   - Variant 1: Integrated Rail Turrets (Angled low-profile accelerator rails)
 *   - Variant 2: Twin Hex Missile Pods (Honeycomb micro-launcher cells)
 *   - Variant 3: Aerodynamic Plasma Blasters (Forward-swept strike cowlings)
 *   - Variant 4: Concealed Stealth Emitters (Clean flush top silhouette)
 */
export function drawPaddleWithPreset(
  ctx: CanvasRenderingContext2D,
  paddle: PaddleState,
  _preset = 1,
  options: PaddleRenderOptions = {}
) {
  drawMechTitanPaddle(ctx, paddle, options);
}

export function drawPaddle(
  ctx: CanvasRenderingContext2D,
  paddle: PaddleState,
  options: PaddleRenderOptions = {}
) {
  drawMechTitanPaddle(ctx, paddle, options);
}

/**
 * Mech Titan Dreadnought Paddle Implementation
 */
export function drawMechTitanPaddle(
  ctx: CanvasRenderingContext2D,
  paddle: PaddleState,
  options: PaddleRenderOptions = {}
) {
  const animTick = options.animTick || 0;
  const px = paddle.x - paddle.width / 2;
  const py = paddle.y;
  const pw = paddle.width;
  const ph = paddle.height;
  const chamfer = 8;
  const weaponVariant: TopWeaponVariant = options.weaponVariant || 1;

  // Determine Progression Tier (1: Base, 2: Reinforced, 3: Apex Overdrive)
  const tier: PaddleTier =
    options.tier !== undefined
      ? options.tier
      : options.widthLevel !== undefined || options.speedLevel !== undefined
      ? getPaddleTierFromUpgrades(options.widthLevel || 1, options.speedLevel || 1)
      : 2;

  ctx.save();

  // 1. Under-Chassis Ion Thruster Exhaust Plumes (Tier 2: Dual Thrusters, Tier 3: Quad Thrusters)
  if (tier >= 2) {
    const thrusterPositions =
      tier === 3
        ? [paddle.x - pw * 0.4, paddle.x - pw * 0.22, paddle.x + pw * 0.22, paddle.x + pw * 0.4]
        : [paddle.x - pw * 0.32, paddle.x + pw * 0.32];

    const thrusterW = tier === 3 ? 12 : 14;
    const flameH = (tier === 3 ? 16 : 12) + Math.sin(animTick * 14) * 4;

    thrusterPositions.forEach((tx) => {
      const flameGrad = ctx.createLinearGradient(tx, py + ph - 2, tx, py + ph + flameH);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.25, tier === 3 ? '#ff9900' : '#00f7ff');
      flameGrad.addColorStop(0.7, tier === 3 ? '#ff3300' : '#0055ff');
      flameGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(tx - thrusterW / 2, py + ph);
      ctx.lineTo(tx + thrusterW / 2, py + ph);
      ctx.lineTo(tx, py + ph + flameH);
      ctx.closePath();
      ctx.fill();

      // Exhaust spark particle
      if (Math.sin(animTick * 18 + tx) > 0.4) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(tx + Math.sin(animTick * 10) * 3, py + ph + flameH + 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // 2. Heavy 3D Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  drawChamfer(ctx, px + 3, py + 7, pw, ph, chamfer);
  ctx.fill();

  // 3. Multi-Layered Gunmetal Armored Hull
  const armorGrad = ctx.createLinearGradient(px, py, px, py + ph);
  if (tier === 3) {
    armorGrad.addColorStop(0, '#94a3b8');
    armorGrad.addColorStop(0.3, '#475569');
    armorGrad.addColorStop(0.7, '#1e293b');
    armorGrad.addColorStop(1, '#090d16');
  } else if (tier === 2) {
    armorGrad.addColorStop(0, '#64748b');
    armorGrad.addColorStop(0.35, '#334155');
    armorGrad.addColorStop(0.7, '#1e293b');
    armorGrad.addColorStop(1, '#0f172a');
  } else {
    armorGrad.addColorStop(0, '#475569');
    armorGrad.addColorStop(0.5, '#1e293b');
    armorGrad.addColorStop(1, '#0f172a');
  }

  ctx.fillStyle = armorGrad;
  drawChamfer(ctx, px, py, pw, ph, chamfer);
  ctx.fill();

  // Tier 3: Reinforced Side Armor Winglet Flanks
  if (tier === 3) {
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(px - 6, py + ph * 0.25, 8, ph * 0.5);
    ctx.strokeRect(px - 6, py + ph * 0.25, 8, ph * 0.5);
    ctx.fillRect(px + pw - 2, py + ph * 0.25, 8, ph * 0.5);
    ctx.strokeRect(px + pw - 2, py + ph * 0.25, 8, ph * 0.5);
  }

  // Armored Steel Border
  ctx.strokeStyle = tier === 3 ? '#38bdf8' : tier === 2 ? '#94a3b8' : '#64748b';
  ctx.lineWidth = tier === 3 ? 2.8 : 2.2;
  ctx.shadowColor = tier === 3 ? '#38bdf8' : 'rgba(0,0,0,0)';
  ctx.shadowBlur = tier === 3 ? 10 : 0;
  drawChamfer(ctx, px, py, pw, ph, chamfer);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 4. Heat Dissipation Exhaust Vents
  const ventCount = tier >= 2 ? 4 : 2;
  const ventW = pw * (tier >= 2 ? 0.12 : 0.16);
  const ventH = ph * 0.42;
  const ventY = py + ph * 0.32;
  const ventPulse = Math.sin(animTick * (tier === 3 ? 10 : 7)) * 0.25 + 0.75;

  const ventXPositions =
    ventCount === 4
      ? [px + 14, px + 18 + ventW, px + pw - 18 - ventW * 2, px + pw - 14 - ventW]
      : [px + 16, px + pw - 16 - ventW];

  ventXPositions.forEach((vx) => {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(vx, ventY, ventW, ventH);

    const heatColor =
      tier === 3 ? `rgba(255, 140, 0, ${ventPulse})` : `rgba(249, 115, 22, ${ventPulse})`;
    ctx.fillStyle = heatColor;
    ctx.shadowColor = tier === 3 ? '#ff9900' : '#f97316';
    ctx.shadowBlur = tier === 3 ? 12 : 8;

    const ribStep = ventW / 4;
    for (let r = vx + 2.5; r < vx + ventW - 1; r += ribStep) {
      ctx.fillRect(r, ventY + 1.5, 2.2, ventH - 3);
    }
    ctx.shadowBlur = 0;
  });

  // 5. Center Reinforced Titanium Bumper Plate & Hazard Stripes
  const centerW = pw * (tier === 3 ? 0.32 : 0.36);
  const centerPlateX = paddle.x - centerW / 2;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(centerPlateX, py + 3, centerW, ph * 0.38);

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.8;
  const chevStep = centerW / 5;
  for (let cx = centerPlateX + chevStep; cx < centerPlateX + centerW; cx += chevStep) {
    ctx.beginPath();
    ctx.moveTo(cx - 4, py + ph * 0.33);
    ctx.lineTo(cx, py + 5);
    ctx.stroke();
  }

  // Tier 2 & 3: Center Status Indicator / Quantum Overdrive Core
  if (tier >= 2) {
    const coreR = ph * (tier === 3 ? 0.25 : 0.18);
    const coreGrad = ctx.createRadialGradient(
      paddle.x,
      py + ph * 0.55,
      1,
      paddle.x,
      py + ph * 0.55,
      coreR
    );
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, tier === 3 ? '#38bdf8' : '#f59e0b');
    coreGrad.addColorStop(0.8, tier === 3 ? '#0284c7' : '#b45309');
    coreGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = coreGrad;
    ctx.shadowColor = tier === 3 ? '#00f7ff' : '#f59e0b';
    ctx.shadowBlur = tier === 3 ? 14 : 8;
    ctx.beginPath();
    ctx.arc(paddle.x, py + ph * 0.55, coreR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Tier 3: Kinetic Deflector Forcefield Rail along Top Bumper
  if (tier === 3) {
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.7)';
    ctx.shadowColor = '#00f7ff';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + 14, py + 1);
    ctx.lineTo(px + pw - 14, py + 1);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // 6. TOP SECTION ATTACHMENT / WEAPON MOUNT (Replaces crude red stalks)
  if (options.hasLaser) {
    const cannonOffset = (pw / 2) * 0.74;
    const cannonXPositions = [paddle.x - cannonOffset, paddle.x + cannonOffset];

    cannonXPositions.forEach((cx) => {
      renderTopWeaponMount(ctx, cx, py, weaponVariant, tier, animTick);
    });
  }

  ctx.restore();
}

/**
 * Top Weapon Mount Renderers (4 Clean High-Tech Variants)
 */
function renderTopWeaponMount(
  ctx: CanvasRenderingContext2D,
  cx: number,
  py: number,
  variant: TopWeaponVariant,
  tier: PaddleTier,
  animTick: number
) {
  ctx.save();

  switch (variant) {
    case 2: {
      // ── VARIANT 2: TWIN HEX MISSILE PODS ──
      // Angled low-profile hexagonal armor pods flush with top chamfer
      const podW = 20;
      const podH = 14;
      const podY = py - 8;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = tier === 3 ? '#38bdf8' : '#94a3b8';
      ctx.lineWidth = 1.6;
      drawChamfer(ctx, cx - podW / 2, podY, podW, podH, 4);
      ctx.fill();
      ctx.stroke();

      // 4 Micro-Missile Honeycomb Bores
      const cellOffsets = [
        [-5, -2],
        [5, -2],
        [-5, 3],
        [5, 3],
      ];
      cellOffsets.forEach(([dx, dy]) => {
        // Dark Bore
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(cx + dx, podY + podH / 2 + dy, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Amber/Red Targeting Glint
        const pulse = Math.sin(animTick * 8 + dx) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(245, 158, 11, ${pulse})`;
        ctx.beginPath();
        ctx.arc(cx + dx, podY + podH / 2 + dy, 1.1, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 3: {
      // ── VARIANT 3: AERODYNAMIC PLASMA BLASTERS ──
      // Forward-swept aerodynamic strike cowlings with high-energy plasma discharge aperture
      const finW = 18;
      const finH = 15;
      const finY = py - 10;

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = tier === 3 ? '#ff0055' : '#a855f7';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - finW / 2, py + 2);
      ctx.lineTo(cx - finW * 0.3, finY);
      ctx.lineTo(cx + finW * 0.3, finY);
      ctx.lineTo(cx + finW / 2, py + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // High-Energy Plasma Slit
      const plasmaColor = tier === 3 ? '#ff0055' : '#c084fc';
      ctx.fillStyle = plasmaColor;
      ctx.shadowColor = plasmaColor;
      ctx.shadowBlur = 10;
      ctx.fillRect(cx - 3, finY + 2, 6, finH - 5);
      ctx.shadowBlur = 0;

      // Specular Emitter Tip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1.5, finY - 1, 3, 3);
      break;
    }

    case 4: {
      // ── VARIANT 4: CONCEALED STEALTH EMITTERS (CLEAN FLUSH TOP) ──
      // Zero protruding geometry above the hull! Two recessed pulse-slits flush with upper armor plate
      const slitW = 16;
      const slitH = 4;
      const slitY = py + 2;

      ctx.fillStyle = '#020617';
      ctx.fillRect(cx - slitW / 2, slitY, slitW, slitH);

      const pulse = Math.sin(animTick * 12) * 0.3 + 0.7;
      const beamColor = tier === 3 ? `rgba(255, 0, 85, ${pulse})` : `rgba(0, 247, 255, ${pulse})`;
      ctx.fillStyle = beamColor;
      ctx.shadowColor = tier === 3 ? '#ff0055' : '#00f7ff';
      ctx.shadowBlur = 10;
      ctx.fillRect(cx - slitW * 0.4, slitY + 1, slitW * 0.8, slitH - 2);

      // Micro LED aperture glint
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1.5, slitY, 3, slitH);
      ctx.shadowBlur = 0;
      break;
    }

    case 1:
    default: {
      // ── VARIANT 1 (DEFAULT): INTEGRATED RAIL TURRETS ──
      // Low-profile angular gunmetal casing integrated into top chamfer
      const casingW = 20;
      const casingH = 13;
      const casingY = py - 8;

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = tier === 3 ? '#38bdf8' : '#94a3b8';
      ctx.lineWidth = 1.6;
      drawChamfer(ctx, cx - casingW / 2, casingY, casingW, casingH, 3);
      ctx.fill();
      ctx.stroke();

      // Dual Magnetic Accelerator Rails
      ctx.fillStyle = '#090d16';
      ctx.fillRect(cx - 6, casingY - 3, 3.5, casingH + 1);
      ctx.fillRect(cx + 2.5, casingY - 3, 3.5, casingH + 1);

      // Central Energy Arc Conduit
      const railGlow = tier === 3 ? '#00f7ff' : '#38bdf8';
      ctx.fillStyle = railGlow;
      ctx.shadowColor = railGlow;
      ctx.shadowBlur = 10;
      ctx.fillRect(cx - 2, casingY - 2, 4, casingH - 3);

      // Top Collimator Aperture
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1.5, casingY - 5, 3, 3);
      ctx.shadowBlur = 0;
      break;
    }
  }

  ctx.restore();
}

/**
 * Chamfered Rectangle Helper Path
 */
function drawChamfer(
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
