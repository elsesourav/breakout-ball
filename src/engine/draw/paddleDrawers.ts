import { PaddleState } from '../types';
import { PaddleTier, getPaddleTierFromUpgrades } from '../../constants/visualPresets';

export interface PaddleRenderOptions {
  animTick?: number;
  hasLaser?: boolean;
  hasShield?: boolean;
  tier?: PaddleTier;
  widthLevel?: number;
  speedLevel?: number;
  weaponVariant?: number;
  fancyLevel?: number;
}

/**
 * Mech Titan Dreadnought Paddle
 * Selected as the locked paddle design for the game.
 * Features built-in Integrated Rail Turrets (active when laser buff is held).
 * Dynamically evolves across 3 progressive Armory Upgrade Tiers:
 *   - Tier 1: Base Heavy Gunmetal Plating, Dual Heat Vents, Hazard Chevron Plate
 *   - Tier 2: Reinforced Plating, Dual Ion Thrusters with Plasma Flames, Quad Vents
 *   - Tier 3: Apex Overdrive, Quad Thrusters with Sparks, Reinforced Winglets, Deflector Forcefield
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

  // Progression Tier (1: Base, 2: Reinforced, 3: Apex Overdrive)
  const tier: PaddleTier =
    options.tier !== undefined
      ? options.tier
      : options.widthLevel !== undefined || options.speedLevel !== undefined
      ? getPaddleTierFromUpgrades(options.widthLevel || 1, options.speedLevel || 1)
      : 2;

  ctx.save();

  // Speed-based Thruster Fire Effect (Independent of Width)
  const speedLevel = options.speedLevel !== undefined ? options.speedLevel : 1;

  // 1. Under-Chassis Ion Thruster Exhaust Plumes (Driven Strictly by Speed Level)
  if (speedLevel >= 2) {
    const isQuad = speedLevel >= 7;
    const thrusterPositions = isQuad
      ? [paddle.x - pw * 0.38, paddle.x - pw * 0.20, paddle.x + pw * 0.20, paddle.x + pw * 0.38]
      : [paddle.x - pw * 0.30, paddle.x + pw * 0.30];

    const thrusterW = isQuad ? 10 : 12;
    const flameH = (isQuad ? 14 : 8) + (speedLevel - 1) * 2.0 + Math.sin(animTick * 14) * 3;

    thrusterPositions.forEach((tx) => {
      const flameGrad = ctx.createLinearGradient(tx, py + ph - 2, tx, py + ph + flameH);
      flameGrad.addColorStop(0, '#ffffff');

      if (speedLevel >= 7) {
        // Quad Hyper Overdrive: Blazing Orange-Gold Core to Crimson Flame
        flameGrad.addColorStop(0.25, '#ffd700');
        flameGrad.addColorStop(0.65, '#ff4500');
      } else if (speedLevel >= 4) {
        // Boosted Plasma: Cyan to Electric Blue
        flameGrad.addColorStop(0.25, '#00f7ff');
        flameGrad.addColorStop(0.70, '#2563eb');
      } else {
        // Base Ion: Soft Cyan-Blue
        flameGrad.addColorStop(0.35, '#38bdf8');
        flameGrad.addColorStop(0.85, '#1d4ed8');
      }
      flameGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(tx - thrusterW / 2, py + ph);
      ctx.lineTo(tx + thrusterW / 2, py + ph);
      ctx.lineTo(tx, py + ph + flameH);
      ctx.closePath();
      ctx.fill();

      // Exhaust spark particles
      if (Math.sin(animTick * 18 + tx) > 0.35) {
        ctx.fillStyle = speedLevel >= 7 ? '#ffd700' : '#ffffff';
        ctx.beginPath();
        ctx.arc(tx + Math.sin(animTick * 10) * 3, py + ph + flameH + 3, 1.4, 0, Math.PI * 2);
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
  drawChamfer(ctx, px, py, pw, ph, chamfer);
  ctx.stroke();

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

    const ribStep = ventW / 4;
    for (let r = vx + 2.5; r < vx + ventW - 1; r += ribStep) {
      ctx.fillRect(r, ventY + 1.5, 2.2, ventH - 3);
    }
  });

  // 5. Center Reinforced Titanium Bumper Plate & Hazard Chevrons
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
    ctx.beginPath();
    ctx.arc(paddle.x, py + ph * 0.55, coreR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tier 3: Kinetic Deflector Forcefield Rail along Top Bumper
  if (tier === 3) {
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + 14, py + 1);
    ctx.lineTo(px + pw - 14, py + 1);
    ctx.stroke();
  }

  // 6. INTEGRATED RAIL TURRETS (The user's chosen top weapon mounts)
  if (options.hasLaser) {
    const cannonOffset = (pw / 2) * 0.74;
    const cannonXPositions = [paddle.x - cannonOffset, paddle.x + cannonOffset];

    cannonXPositions.forEach((cx) => {
      // Angular low-profile gunmetal casing integrated into top chamfer
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

      // Central High-Energy Plasma Conduit
      const railGlow = tier === 3 ? '#00f7ff' : '#38bdf8';
      ctx.fillStyle = railGlow;
      ctx.fillRect(cx - 2, casingY - 2, 4, casingH - 3);

      // Top Collimator Bore Tip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1.5, casingY - 5, 3, 3);
    });
  }

  // 6. Fancy Plasma Thruster Emitter Particles (Cosmetic Prestige Sparks)
  const fancyLevel = options.fancyLevel || 1;
  if (fancyLevel >= 2) {
    const fancyParticleCount = fancyLevel === 2 ? 6 : fancyLevel === 3 ? 10 : fancyLevel === 4 ? 14 : 20;
    const baseColor =
      fancyLevel === 2 ? '#38bdf8' : fancyLevel === 3 ? '#818cf8' : fancyLevel === 4 ? '#c084fc' : '';

    for (let i = 0; i < fancyParticleCount; i++) {
      const isLeft = i % 2 === 0;
      const xSpread = pw * (0.28 + (i % 4) * 0.05);
      const px = paddle.x + (isLeft ? -xSpread : xSpread) + Math.sin(animTick * 4 + i) * 6;
      const py = paddle.y + ph + 2 + ((animTick * 25 + i * 14) % 36);
      const pAlpha = Math.max(0, 1 - ((animTick * 25 + i * 14) % 36) / 36);
      const pColor = fancyLevel === 5 ? (i % 2 === 0 ? '#ffd700' : '#ff0055') : baseColor;

      ctx.fillStyle = pColor;
      ctx.globalAlpha = pAlpha * 0.45;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = pAlpha * 0.9;
      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
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
