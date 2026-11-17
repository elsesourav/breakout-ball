import { BallPresetId, BallTier } from '../../constants/visualPresets';

export interface BallRenderOptions {
  animTick?: number;
  tier?: BallTier;
  palette?: {
    glow: string;
    c1: string;
    c2: string;
    c3: string;
  };
  isMega?: boolean;
  fancyLevel?: number;
}

export interface BallStateLike {
  x: number;
  y: number;
  radius: number;
  isMega?: boolean;
}

const DEFAULT_PALETTE = {
  glow: '#00f7ff',
  c1: '#e0ffff',
  c2: '#00d4ff',
  c3: '#0044aa',
};

const MEGA_PALETTE = {
  glow: '#ffd700',
  c1: '#ffffff',
  c2: '#ffb700',
  c3: '#ff0055',
};

/**
 * 3D Stardust Core Ball (Selected Design)
 * Simple, elegant 3D spherical volume with smooth drifting internal sparks.
 * Strictly internal particles (ctx.clip) — ZERO outside particles emitted.
 */
export function drawBallWithPreset(
  ctx: CanvasRenderingContext2D,
  ball: BallStateLike,
  _preset: BallPresetId = 1,
  options: BallRenderOptions = {}
) {
  draw3DStardustCoreBall(ctx, ball, options);
}

export function drawBall(
  ctx: CanvasRenderingContext2D,
  ball: BallStateLike,
  options: BallRenderOptions = {}
) {
  draw3DStardustCoreBall(ctx, ball, options);
}

/**
 * 3D Stardust Core Ball Implementation
 */
export function draw3DStardustCoreBall(
  ctx: CanvasRenderingContext2D,
  ball: BallStateLike,
  options: BallRenderOptions = {}
) {
  const animTick = options.animTick || 0;
  const tier: BallTier = options.tier || 1;
  const isMega = options.isMega || ball.isMega || false;
  const palette = isMega ? MEGA_PALETTE : options.palette || DEFAULT_PALETTE;

  const bx = ball.x;
  const by = ball.y;
  const br = ball.radius;

  ctx.save();

  // 1. Base Spherical 3D Volume Gradient (Zero shadowBlur for locked 60 FPS)
  const lightX = bx - br * 0.35;
  const lightY = by - br * 0.35;
  const baseGrad = ctx.createRadialGradient(lightX, lightY, br * 0.05, bx, by, br);
  baseGrad.addColorStop(0, '#ffffff');
  baseGrad.addColorStop(0.25, palette.c1);
  baseGrad.addColorStop(0.65, palette.c2);
  baseGrad.addColorStop(0.9, palette.c3);
  baseGrad.addColorStop(1, '#020617');

  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.fill();

  // ── STRICT INTERNAL CLIPPING (Guarantees ZERO particles escape outside) ───
  ctx.save();
  ctx.beginPath();
  ctx.arc(bx, by, br - 0.5, 0, Math.PI * 2);
  ctx.clip();

  // 3. Central Glowing 3D Nucleus
  const coreR = br * (tier === 3 ? 0.38 : tier === 2 ? 0.32 : 0.28);
  const coreGrad = ctx.createRadialGradient(bx, by, 0, bx, by, coreR);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.5, palette.c1);
  coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(bx, by, coreR, 0, Math.PI * 2);
  ctx.fill();

  // 4. Moving Internal Particles / Sparks (Gentle, elegant 3D drift)
  const particleCount = tier === 3 ? 7 : tier === 2 ? 5 : 4;
  for (let i = 0; i < particleCount; i++) {
    const seed = i * 1.85;
    const speed = 0.8 + (i % 3) * 0.3;
    const orbitR = br * (0.2 + (i / particleCount) * 0.42);

    // Smooth drifting trajectory inside ball
    const px = bx + Math.cos(animTick * speed + seed) * orbitR;
    const py = by + Math.sin(animTick * (speed * 0.85) + seed * 1.3) * (orbitR * 0.65);

    // Internal spark glint
    const sparkAlpha = Math.sin(animTick * 3 + seed) * 0.25 + 0.75;
    ctx.fillStyle = `rgba(255, 255, 255, ${sparkAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.3 + (i % 2) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // Unclip

  // 5. Crisp Glassmorphic Surface Specular Glare (Top-Left)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.beginPath();
  ctx.ellipse(lightX, lightY, br * 0.25, br * 0.15, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // Secondary Bottom-Right Ambient Bounce Arc
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(bx, by, br * 0.86, Math.PI * 0.25, Math.PI * 0.55);
  ctx.stroke();

  // Clean Micro-Rim Line
  ctx.strokeStyle = tier === 3 ? '#ffffff' : palette.c1;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.stroke();

  // 6. Fancy Stardust Aura (Cosmetic Prestige Particles orbiting just outside ball)
  const fancyLevel = options.fancyLevel || 1;
  if (fancyLevel >= 2) {
    const fancyParticleCount = fancyLevel === 2 ? 4 : fancyLevel === 3 ? 7 : fancyLevel === 4 ? 10 : 14;
    const baseColor =
      fancyLevel === 2 ? '#00f7ff' : fancyLevel === 3 ? '#ffd700' : fancyLevel === 4 ? '#ec4899' : '';

    for (let i = 0; i < fancyParticleCount; i++) {
      const angle = animTick * (1.2 + (i % 3) * 0.25) + (i * (Math.PI * 2 / fancyParticleCount));
      const dist = br * (1.18 + 0.12 * Math.sin(animTick * 3 + i * 2));
      const px = bx + Math.cos(angle) * dist;
      const py = by + Math.sin(angle) * (dist * 0.88);
      const pColor = fancyLevel === 5 ? `hsl(${(animTick * 80 + i * 28) % 360}, 100%, 70%)` : baseColor;

      // Glow halo
      ctx.fillStyle = pColor;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Sharp core
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(px, py, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  ctx.restore();
}
