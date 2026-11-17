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

  // Speed-based Under-Chassis Booster Nozzles & Flames (Driven strictly by paddle_speed)
  const speedLevel = options.speedLevel !== undefined ? options.speedLevel : 1;
  const isQuad = speedLevel >= 7;
  const isMaxBooster = speedLevel >= 8;
  const thrusterPositions = isQuad
    ? [paddle.x - pw * 0.38, paddle.x - pw * 0.18, paddle.x + pw * 0.18, paddle.x + pw * 0.38]
    : [paddle.x - pw * 0.28, paddle.x + pw * 0.28];
  const nozW = isQuad ? 10 : 12;
  const nozH = 6;

  // 1. Under-Chassis Mechanical Booster Nozzles
  thrusterPositions.forEach((tx) => {
    // Nozzle mount casing
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = isMaxBooster ? '#fbbf24' : '#475569';
    ctx.lineWidth = 1.2;
    ctx.fillRect(tx - nozW / 2, py + ph - 2, nozW, nozH);
    ctx.strokeRect(tx - nozW / 2, py + ph - 2, nozW, nozH);

    // Inner glowing ceramic throat
    ctx.fillStyle = isMaxBooster ? '#ffd700' : speedLevel >= 4 ? '#00f7ff' : '#38bdf8';
    ctx.fillRect(tx - nozW * 0.3, py + ph + nozH - 3, nozW * 0.6, 2);
  });

  // 1.1. Active Fire Booster Plumes (Culminating in the Preset Booster at Max Level)
  if (speedLevel >= 2) {
    const flameH = (isMaxBooster ? 26 : isQuad ? 18 : 10) + (speedLevel - 1) * 2.0 + Math.sin(animTick * 16) * 3;

    thrusterPositions.forEach((tx) => {
      const flameGrad = ctx.createLinearGradient(tx, py + ph + nozH - 2, tx, py + ph + nozH + flameH);
      flameGrad.addColorStop(0, '#ffffff');

      if (isMaxBooster) {
        // Preset Booster [MAX OVERDRIVE]: Roaring White-Hot to Gold to Crimson Afterburner
        flameGrad.addColorStop(0.2, '#ffffff');
        flameGrad.addColorStop(0.4, '#ffd700');
        flameGrad.addColorStop(0.75, '#ff4500');
      } else if (speedLevel >= 7) {
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
      ctx.moveTo(tx - nozW / 2, py + ph + nozH - 1);
      ctx.lineTo(tx + nozW / 2, py + ph + nozH - 1);
      ctx.lineTo(tx, py + ph + nozH + flameH);
      ctx.closePath();
      ctx.fill();

      // Preset Booster: Supersonic Mach Diamond Shock Rings in the core plume
      if (isMaxBooster) {
        const shockFractions = [0.28, 0.52, 0.74];
        for (const frac of shockFractions) {
          const dy = py + ph + nozH + flameH * frac;
          const dw = (nozW * 0.38) * (1 - frac * 0.3);
          const dh = 4.5 * (1 - frac * 0.3);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(tx, dy - dh);
          ctx.lineTo(tx + dw, dy);
          ctx.lineTo(tx, dy + dh);
          ctx.lineTo(tx - dw, dy);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Exhaust spark embers
      if (Math.sin(animTick * 18 + tx) > 0.35) {
        ctx.fillStyle = isMaxBooster ? '#ffd700' : '#ffffff';
        ctx.beginPath();
        ctx.arc(tx + Math.sin(animTick * 10) * 3, py + ph + nozH + flameH + 3, 1.4, 0, Math.PI * 2);
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

  // 7. Continuous Chassis Sparkle Particle Release (paddle_fancy Upgrade)
  // Sparkles continuously release and drift outward everywhere from the paddle hull
  const fancyLevel = options.fancyLevel || 1;
  if (fancyLevel >= 2) {
    const auraColor =
      fancyLevel === 2
        ? 'rgba(56, 189, 248, 0.45)'
        : fancyLevel === 3
        ? 'rgba(129, 140, 248, 0.55)'
        : fancyLevel === 4
        ? 'rgba(192, 132, 252, 0.65)'
        : 'rgba(251, 191, 36, 0.75)';

    // 7.1. Soft Breathing Hull Contour Halo
    ctx.save();
    const haloPulse = 0.5 + Math.sin(animTick * 6) * 0.25;
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = fancyLevel === 5 ? 2.5 : 1.8;
    ctx.shadowColor = fancyLevel === 5 ? '#ffd700' : fancyLevel === 4 ? '#c084fc' : '#38bdf8';
    ctx.shadowBlur = 10 * haloPulse;
    drawChamfer(ctx, px - 2, py - 2, pw + 4, ph + 4, chamfer + 2);
    ctx.stroke();
    ctx.restore();

    // 7.2. Radiant Sparkle Particle Emission (Always releasing slowly everywhere across the paddle)
    const pCount = fancyLevel === 2 ? 12 : fancyLevel === 3 ? 20 : fancyLevel === 4 ? 32 : 48;
    const baseColor =
      fancyLevel === 2 ? '#38bdf8' : fancyLevel === 3 ? '#818cf8' : fancyLevel === 4 ? '#c084fc' : '#ffd700';
    const cycle = 1.6;

    for (let i = 0; i < pCount; i++) {
      const pAge = (animTick * 0.8 + (i * cycle) / pCount) % cycle;
      const prog = pAge / cycle; // 0 to 1 lifetime
      const pAlpha = Math.sin(prog * Math.PI); // Fades in smoothly, peaks at mid-flight, fades out
      if (pAlpha <= 0.01) continue;

      // Origin dispersed everywhere across paddle body & edges
      const relX = ((Math.sin(i * 997.1) * 0.5 + 0.5) - 0.5) * pw * 0.88;
      const relY = ((Math.cos(i * 773.3) * 0.5 + 0.5) - 0.5) * ph * 0.75;

      // Gentle omni-directional outward drift + slight upward float
      const driftAngle = Math.atan2(relY, relX) + Math.sin(i + animTick * 2) * 0.4;
      const driftDist = 6 + prog * (14 + (fancyLevel - 1) * 4);
      const sx = paddle.x + relX + Math.cos(driftAngle) * driftDist;
      const sy = py + ph * 0.5 + relY + Math.sin(driftAngle) * driftDist - prog * 6;

      const pColor = fancyLevel === 5 ? (i % 2 === 0 ? '#ffd700' : '#ff007f') : baseColor;
      const twinkle = 0.7 + 0.3 * Math.sin(animTick * 14 + i * 5);
      const isStar = (i % 3 === 0 && fancyLevel >= 3) || fancyLevel === 5;

      ctx.save();
      ctx.globalAlpha = pAlpha * twinkle;

      // Outer soft glow
      ctx.fillStyle = pColor;
      ctx.beginPath();
      ctx.arc(sx, sy, isStar ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Brilliant white core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, isStar ? 1.6 : 1.1, 0, Math.PI * 2);
      ctx.fill();

      // 4-point diamond cross flare for radiant starburst sparkles
      if (isStar) {
        const flareR = 3.5 + 1.5 * Math.sin(animTick * 12 + i);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(sx - flareR, sy);
        ctx.lineTo(sx + flareR, sy);
        ctx.moveTo(sx, sy - flareR);
        ctx.lineTo(sx, sy + flareR);
        ctx.stroke();
      }

      ctx.restore();
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
