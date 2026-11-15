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
 * Universal 3D Ball Drawing Router
 * Simple, elegant 3D spherical shading with moving internal particles.
 * ZERO outside particles emitted.
 */
export function drawBallWithPreset(
  ctx: CanvasRenderingContext2D,
  ball: BallStateLike,
  preset: BallPresetId = 1,
  options: BallRenderOptions = {}
) {
  const animTick = options.animTick || 0;
  const tier: BallTier = options.tier || 1;
  const isMega = options.isMega || ball.isMega || false;
  const palette = isMega ? MEGA_PALETTE : options.palette || DEFAULT_PALETTE;

  switch (preset) {
    case 2:
      draw3DPlasmaFluxBall(ctx, ball, tier, palette, animTick, isMega);
      break;
    case 3:
      draw3DQuantumMoteBall(ctx, ball, tier, palette, animTick, isMega);
      break;
    case 1:
    default:
      draw3DStardustCoreBall(ctx, ball, tier, palette, animTick, isMega);
      break;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OPTION 1: 3D STARDUST CORE (Smooth 3D Gradient & Drifting Internal Sparks)
// ─────────────────────────────────────────────────────────────────────────────
function draw3DStardustCoreBall(
  ctx: CanvasRenderingContext2D,
  ball: BallStateLike,
  tier: BallTier,
  palette: typeof DEFAULT_PALETTE,
  animTick: number,
  isMega: boolean
) {
  const bx = ball.x;
  const by = ball.y;
  const br = ball.radius;

  ctx.save();

  // 1. Subtle Outer Border Glow (Strictly on rim)
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = isMega ? 22 : tier === 3 ? 18 : tier === 2 ? 14 : 10;

  // 2. Base Spherical 3D Volume Gradient
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

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// OPTION 2: 3D PLASMA FLUX CORE (Internal Floating Energy Bead & Flux Sparks)
// ─────────────────────────────────────────────────────────────────────────────
function draw3DPlasmaFluxBall(
  ctx: CanvasRenderingContext2D,
  ball: BallStateLike,
  tier: BallTier,
  palette: typeof DEFAULT_PALETTE,
  animTick: number,
  isMega: boolean
) {
  const bx = ball.x;
  const by = ball.y;
  const br = ball.radius;

  ctx.save();
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = isMega ? 22 : tier === 3 ? 18 : 12;

  // 1. Dark Aerospace 3D Shell
  const lightX = bx - br * 0.35;
  const lightY = by - br * 0.35;
  const baseGrad = ctx.createRadialGradient(lightX, lightY, br * 0.05, bx, by, br);
  baseGrad.addColorStop(0, '#ffffff');
  baseGrad.addColorStop(0.3, palette.c1);
  baseGrad.addColorStop(0.7, palette.c3);
  baseGrad.addColorStop(1, '#030712');

  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.fill();

  // ── STRICT INTERNAL CLIPPING (Guarantees ZERO particles escape outside) ───
  ctx.save();
  ctx.beginPath();
  ctx.arc(bx, by, br - 0.5, 0, Math.PI * 2);
  ctx.clip();

  // 2. Floating Internal Plasma Orb
  const floatX = bx + Math.cos(animTick * 1.8) * (br * 0.18);
  const floatY = by + Math.sin(animTick * 2.2) * (br * 0.14);
  const innerR = br * (tier === 3 ? 0.35 : 0.28);

  const fluxGrad = ctx.createRadialGradient(floatX, floatY, 0, floatX, floatY, innerR);
  fluxGrad.addColorStop(0, '#ffffff');
  fluxGrad.addColorStop(0.45, palette.c1);
  fluxGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = fluxGrad;
  ctx.beginPath();
  ctx.arc(floatX, floatY, innerR, 0, Math.PI * 2);
  ctx.fill();

  // 3. Orbiting Micro-Flux Sparks inside the sphere
  const count = tier === 3 ? 8 : tier === 2 ? 6 : 4;
  for (let i = 0; i < count; i++) {
    const angle = animTick * 1.6 + (i * Math.PI * 2) / count;
    const rDist = br * (0.28 + (i % 2) * 0.28);
    const sx = bx + Math.cos(angle) * rDist;
    const sy = by + Math.sin(angle) * (rDist * 0.7);

    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : palette.c1;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // Unclip

  // 4. Outer Glass Glint
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.ellipse(lightX, lightY, br * 0.24, br * 0.14, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // Rim line
  ctx.strokeStyle = tier === 3 ? '#ffffff' : palette.c1;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// OPTION 3: 3D QUANTUM MOTE SPHERE (Obsidian Lens & Deep Internal Motives)
// ─────────────────────────────────────────────────────────────────────────────
function draw3DQuantumMoteBall(
  ctx: CanvasRenderingContext2D,
  ball: BallStateLike,
  tier: BallTier,
  palette: typeof DEFAULT_PALETTE,
  animTick: number,
  isMega: boolean
) {
  const bx = ball.x;
  const by = ball.y;
  const br = ball.radius;

  ctx.save();
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = isMega ? 24 : tier === 3 ? 18 : 12;

  // 1. Obsidian Lens Body
  const lightX = bx - br * 0.35;
  const lightY = by - br * 0.35;
  const baseGrad = ctx.createRadialGradient(lightX, lightY, br * 0.05, bx, by, br);
  baseGrad.addColorStop(0, '#ffffff');
  baseGrad.addColorStop(0.2, palette.c1);
  baseGrad.addColorStop(0.65, palette.c3);
  baseGrad.addColorStop(1, '#05020c');

  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.fill();

  // ── STRICT INTERNAL CLIPPING ──────────────────────────────────────────────
  ctx.save();
  ctx.beginPath();
  ctx.arc(bx, by, br - 0.5, 0, Math.PI * 2);
  ctx.clip();

  // 2. Deep Internal Horizon Disk
  const diskR = br * 0.45;
  const diskGrad = ctx.createRadialGradient(bx, by, 0, bx, by, diskR);
  diskGrad.addColorStop(0, '#000000');
  diskGrad.addColorStop(0.6, '#0b061c');
  diskGrad.addColorStop(0.85, palette.c2);
  diskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = diskGrad;
  ctx.beginPath();
  ctx.arc(bx, by, diskR, 0, Math.PI * 2);
  ctx.fill();

  // 3. Multi-Depth Floating Quantum Motives
  const moteCount = tier === 3 ? 9 : tier === 2 ? 6 : 4;
  for (let i = 0; i < moteCount; i++) {
    const tOffset = animTick * 1.2 + i * 1.5;
    const mx = bx + Math.sin(tOffset * 0.8) * (br * 0.52);
    const my = by + Math.cos(tOffset * 1.1) * (br * 0.45);
    const zDepth = Math.sin(tOffset) * 0.5 + 0.5; // 0 to 1

    ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + zDepth * 0.6})`;
    ctx.beginPath();
    ctx.arc(mx, my, 1.0 + zDepth * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // Unclip

  // 4. Outer Glass Specular
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.ellipse(lightX, lightY, br * 0.28, br * 0.16, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // Rim Line
  ctx.strokeStyle = tier === 3 ? '#ffffff' : palette.c1;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}
