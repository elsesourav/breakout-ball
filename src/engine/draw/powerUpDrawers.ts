import { PowerUpDrop } from '../powerUpTypes';
import { PowerUpPresetId } from '../../constants/visualPresets';
import {
  renderFallingTrailSparks,
  renderCustomPowerUpIcon,
  draw8PointStar,
} from './powerUpIconDrawers';

export interface PowerUpRenderOptions {
  animTick?: number;
  scale?: number;
}

/**
 * Universal Power-Up Drawing Router
 * Redesigned for pristine spherical clarity:
 *   - Strictly NO messy oval/elliptical background rings!
 *   - Perfectly concentric circular glowing auras & floating spark motes.
 *   - High-contrast custom vector emblems inside every sphere.
 */
export function drawPowerUpWithPreset(
  ctx: CanvasRenderingContext2D,
  drop: PowerUpDrop,
  preset: PowerUpPresetId = 1,
  options: PowerUpRenderOptions = {}
) {
  switch (preset) {
    case 2:
      drawGyroSingularityCore(ctx, drop, options);
      break;
    case 3:
      drawApexReactorSphere(ctx, drop, options);
      break;
    case 1:
    default:
      drawOrbitalEnergyCore(ctx, drop, options);
      break;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 1 (CHOSEN): ORBITAL ENERGY CORE (Clean Spherical Aura & Floating Motes)
// ─────────────────────────────────────────────────────────────────────────────
export function drawOrbitalEnergyCore(
  ctx: CanvasRenderingContext2D,
  drop: PowerUpDrop,
  options: PowerUpRenderOptions = {}
) {
  const animTick = options.animTick !== undefined ? options.animTick : drop.angle;
  const userScale = options.scale || 1.35;
  const baseR = 24 * userScale; // Radius ~32.4px, diameter ~65px
  const meta = drop.meta;

  ctx.save();
  ctx.translate(drop.x, drop.y);

  // 1. Gentle Rising Stardust Sparks (Sparkles floating upwards behind the drop)
  renderFallingTrailSparks(ctx, meta.color, baseR, animTick);

  // 2. Perfectly Concentric Circular Glowing Corona (ZERO oval distortion!)
  const pulse = Math.sin(animTick * 4) * 0.08 + 1.18;
  ctx.strokeStyle = meta.glow;
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 18;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, baseR * pulse, 0, Math.PI * 2);
  ctx.stroke();

  // Secondary Micro-Aura Ring
  const pulse2 = Math.cos(animTick * 6) * 0.05 + 1.08;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, baseR * pulse2, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Orbiting Micro-Spark Motes (Clean circular orbit, ZERO oval wire tails)
  const moteCount = 3;
  for (let i = 0; i < moteCount; i++) {
    const theta = animTick * 2.2 + (i * Math.PI * 2) / moteCount;
    const mx = Math.cos(theta) * (baseR * 1.32);
    const my = Math.sin(theta) * (baseR * 1.32);

    ctx.fillStyle = meta.color;
    ctx.shadowColor = meta.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(mx, my, 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. 3D Spherical Glass Core
  const coreGrad = ctx.createRadialGradient(
    -baseR * 0.35,
    -baseR * 0.35,
    baseR * 0.05,
    0,
    0,
    baseR
  );
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.3, meta.color);
  coreGrad.addColorStop(0.75, '#0a0d18');
  coreGrad.addColorStop(1, '#02040a');

  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 20;
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, baseR, 0, Math.PI * 2);
  ctx.fill();

  // Specular Top-Left Glass Arc
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, baseR - 2.5, -Math.PI * 0.85, -Math.PI * 0.15);
  ctx.stroke();

  // Crisp Micro-Rim Line
  ctx.strokeStyle = meta.glow;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, baseR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 5. Custom High-Contrast Vector Emblem Icon
  renderCustomPowerUpIcon(ctx, drop.meta.type, baseR, meta.color);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 2: GYRO SINGULARITY CORE (Concentric Circular Gimbal Rings)
// ─────────────────────────────────────────────────────────────────────────────
export function drawGyroSingularityCore(
  ctx: CanvasRenderingContext2D,
  drop: PowerUpDrop,
  options: PowerUpRenderOptions = {}
) {
  const animTick = options.animTick !== undefined ? options.animTick : drop.angle;
  const userScale = options.scale || 1.35;
  const baseR = 24 * userScale;
  const meta = drop.meta;

  ctx.save();
  ctx.translate(drop.x, drop.y);

  // 1. Trail Sparks
  renderFallingTrailSparks(ctx, meta.color, baseR, animTick);

  // 2. Concentric Circular Gimbal Rings (Clean circular, NO skewed ellipses!)
  ctx.strokeStyle = meta.glow;
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 14;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, 0, baseR * 1.3, 0, Math.PI * 2);
  ctx.stroke();

  // Cardinal node dots
  for (let i = 0; i < 4; i++) {
    const ang = animTick * 1.5 + (i * Math.PI) / 2;
    const nx = Math.cos(ang) * (baseR * 1.3);
    const ny = Math.sin(ang) * (baseR * 1.3);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. 3D Spherical Core
  const coreGrad = ctx.createRadialGradient(-baseR * 0.3, -baseR * 0.3, 2, 0, 0, baseR);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.3, meta.color);
  coreGrad.addColorStop(0.75, '#0a0d18');
  coreGrad.addColorStop(1, '#02040a');
  ctx.fillStyle = coreGrad;
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(0, 0, baseR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = meta.glow;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, baseR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 4. Custom Icon
  renderCustomPowerUpIcon(ctx, drop.meta.type, baseR, meta.color);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 3: APEX REACTOR SPHERE (Circular Magnetic Containment Ring)
// ─────────────────────────────────────────────────────────────────────────────
export function drawApexReactorSphere(
  ctx: CanvasRenderingContext2D,
  drop: PowerUpDrop,
  options: PowerUpRenderOptions = {}
) {
  const animTick = options.animTick !== undefined ? options.animTick : drop.angle;
  const userScale = options.scale || 1.35;
  const baseR = 24 * userScale;
  const meta = drop.meta;

  ctx.save();
  ctx.translate(drop.x, drop.y);

  // 1. Trail Sparks
  renderFallingTrailSparks(ctx, meta.color, baseR, animTick);

  // 2. Circular Magnetic Containment Brackets
  ctx.save();
  ctx.rotate(animTick * 1.2);
  ctx.strokeStyle = meta.glow;
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 16;
  ctx.lineWidth = 2.4;

  for (let i = 0; i < 3; i++) {
    const ang = (i * Math.PI * 2) / 3;
    const bx = Math.cos(ang) * (baseR * 1.32);
    const by = Math.sin(ang) * (baseR * 1.32);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(0, 0, baseR * 1.32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 3. Central Core
  const coreGrad = ctx.createRadialGradient(-baseR * 0.35, -baseR * 0.35, 1, 0, 0, baseR);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.35, meta.color);
  coreGrad.addColorStop(0.7, '#110526');
  coreGrad.addColorStop(1, '#020008');

  ctx.fillStyle = coreGrad;
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.arc(0, 0, baseR, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 4. Custom Icon
  renderCustomPowerUpIcon(ctx, drop.meta.type, baseR, meta.color);

  ctx.restore();
}
