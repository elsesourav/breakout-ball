import { PowerUpDrop } from '../powerUpTypes';
import { PowerUpPresetId } from '../../constants/visualPresets';

export interface PowerUpRenderOptions {
  animTick?: number;
  scale?: number;
}

/**
 * Universal Power-Up Drawing Router
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
// PRESET 1: ORBITAL ENERGY CORE (3D Celestial Sphere with Orbiting Satellites)
// ─────────────────────────────────────────────────────────────────────────────
export function drawOrbitalEnergyCore(
  ctx: CanvasRenderingContext2D,
  drop: PowerUpDrop,
  options: PowerUpRenderOptions = {}
) {
  const animTick = options.animTick !== undefined ? options.animTick : drop.angle;
  const userScale = options.scale || 1.35;
  const baseR = 24 * userScale; // Generously bigger base size (radius ~32.4px, diameter ~65px)
  const meta = drop.meta;

  ctx.save();
  ctx.translate(drop.x, drop.y);

  // 1. Falling Stardust Trail Sparks (Sparkles floating upwards behind the falling drop)
  renderFallingTrailSparks(ctx, meta.color, baseR, animTick);

  // 2. Pulsating Energy Aura Rings (Dual Layer)
  const pulse = Math.sin(animTick * 5) * 0.12 + 1.15;
  ctx.strokeStyle = meta.glow;
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 20;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, baseR * pulse, 0, Math.PI * 2);
  ctx.stroke();

  // Secondary high-frequency crystalline aura
  const pulse2 = Math.cos(animTick * 7) * 0.08 + 1.05;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, baseR * pulse2, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Background Orbiting Satellites (Rendered behind the sphere when Y < 0)
  render3DOrbitingSatellites(ctx, meta.color, baseR * 1.48, animTick, 'behind');

  // 4. Rotating Celestial Orbital Ring
  ctx.save();
  ctx.rotate(animTick * 0.85);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 8;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, baseR * 1.45, baseR * 0.58, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 5. 3D Spherical Core
  const coreGrad = ctx.createRadialGradient(
    -baseR * 0.35,
    -baseR * 0.35,
    baseR * 0.1,
    0,
    0,
    baseR
  );
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.35, meta.color);
  coreGrad.addColorStop(0.85, '#050716');
  coreGrad.addColorStop(1, '#00020a');

  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 22;
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, baseR, 0, Math.PI * 2);
  ctx.fill();

  // Specular Reflection Ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, baseR - 2, 0, Math.PI * 2);
  ctx.stroke();

  // 6. Foreground Orbiting Satellites (Rendered in front of the sphere when Y >= 0)
  render3DOrbitingSatellites(ctx, meta.color, baseR * 1.45, animTick, 'front');

  // 7. High-Contrast Power Emblem / Symbol
  renderPowerUpSymbol(ctx, meta.symbol, baseR);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 2 (V2): GYRO SINGULARITY CORE (Dual-Axis Gimbal Gyro Rings)
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

  // 1. Falling Stardust Trail Sparks
  renderFallingTrailSparks(ctx, meta.color, baseR, animTick);

  // 2. Dual-Axis 3D Gyro Rings
  const tiltX = Math.cos(animTick * 2.5);
  const tiltY = Math.sin(animTick * 2.0);

  // Outer Gimbal Ring 1
  ctx.save();
  ctx.rotate(animTick * 0.8);
  ctx.strokeStyle = meta.glow;
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 16;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, baseR * 1.35, Math.max(2, baseR * 1.35 * Math.abs(tiltX)), 0, 0, Math.PI * 2);
  ctx.stroke();

  // Node beads on ring 1
  const nX = Math.cos(animTick * 3) * (baseR * 1.35);
  const nY = Math.sin(animTick * 3) * (baseR * 1.35 * tiltX);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(nX, nY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Outer Gimbal Ring 2 (Perpendicular)
  ctx.save();
  ctx.rotate(-animTick * 0.6 + Math.PI / 2);
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = meta.glow;
  ctx.shadowBlur = 10;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, 0, baseR * 1.2, Math.max(2, baseR * 1.2 * Math.abs(tiltY)), 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 3. Central Dark-Matter Sphere with Specular Sheen
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

  // Rim ring
  ctx.strokeStyle = meta.glow;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, 0, baseR, 0, Math.PI * 2);
  ctx.stroke();

  // 4. Power-Up Stamped Icon Badge
  renderPowerUpSymbol(ctx, drop.meta.symbol, baseR);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 3 (V3): APEX REACTOR SPHERE (Hyper-Dense Containment Flux)
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

  // 1. Falling Stardust Trail Sparks
  renderFallingTrailSparks(ctx, meta.color, baseR, animTick);

  // 2. Triangular Heavy Magnetic Brackets
  ctx.save();
  ctx.rotate(animTick * 1.2);
  ctx.strokeStyle = meta.glow;
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 18;
  ctx.lineWidth = 3.0;

  for (let i = 0; i < 3; i++) {
    const ang = (i * Math.PI * 2) / 3;
    const bx = Math.cos(ang) * (baseR * 1.38);
    const by = Math.sin(ang) * (baseR * 1.38);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(bx, by, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Connecting energy arcs between brackets
  ctx.beginPath();
  ctx.arc(0, 0, baseR * 1.38, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 3. Central Hyper-Dense Reactor Core
  const coreGrad = ctx.createRadialGradient(-baseR * 0.35, -baseR * 0.35, 1, 0, 0, baseR);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.35, meta.color);
  coreGrad.addColorStop(0.7, '#110526');
  coreGrad.addColorStop(1, '#020008');

  ctx.fillStyle = coreGrad;
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(0, 0, baseR, 0, Math.PI * 2);
  ctx.fill();

  // Triple Chromatic Energy Bands
  ctx.save();
  ctx.rotate(-animTick * 2.0);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, baseR * 0.95, baseR * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Outer high-contrast rim
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, baseR, 0, Math.PI * 2);
  ctx.stroke();

  // 4. Power-Up Stamped Icon Badge
  renderPowerUpSymbol(ctx, drop.meta.symbol, baseR);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 2: HEX CYBER CAPSULE (Tactical Drop Pod with Spark Motes)
// ─────────────────────────────────────────────────────────────────────────────
export function drawHexCyberCapsule(
  ctx: CanvasRenderingContext2D,
  drop: PowerUpDrop,
  options: PowerUpRenderOptions = {}
) {
  const animTick = options.animTick !== undefined ? options.animTick : drop.angle;
  const userScale = options.scale || 1.35;
  const baseSize = 25 * userScale;
  const meta = drop.meta;

  ctx.save();
  ctx.translate(drop.x, drop.y);

  // 1. Falling Stardust Trail Sparks
  renderFallingTrailSparks(ctx, meta.color, baseSize, animTick);

  // 2. Rotating Hex Shield Brackets
  ctx.save();
  ctx.rotate(-animTick * 1.2);
  ctx.strokeStyle = meta.glow;
  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 14;
  ctx.lineWidth = 2;
  drawHexagon(ctx, 0, 0, baseSize * 1.35);
  ctx.stroke();
  ctx.restore();

  // 3. Orbiting Spark Motes (3 motes orbiting in an angled plane)
  const moteCount = 3;
  for (let m = 0; m < moteCount; m++) {
    const angle = animTick * 3 + (m * Math.PI * 2) / moteCount;
    const mx = Math.cos(angle) * (baseSize * 1.55);
    const my = Math.sin(angle) * (baseSize * 0.7);

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = meta.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(mx, my, 4, 0, Math.PI * 2);
    ctx.fill();

    // Mote trail tail
    ctx.strokeStyle = meta.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx - Math.sin(angle) * 8, my + Math.cos(angle) * 4);
    ctx.stroke();
  }

  // 4. Hexagonal Capsule Hull
  ctx.save();
  ctx.rotate(animTick * 0.5);

  const hexGrad = ctx.createLinearGradient(-baseSize, -baseSize, baseSize, baseSize);
  hexGrad.addColorStop(0, '#1e293b');
  hexGrad.addColorStop(0.4, meta.color);
  hexGrad.addColorStop(0.8, '#0f172a');
  hexGrad.addColorStop(1, '#020617');

  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 20;
  ctx.fillStyle = hexGrad;
  drawHexagon(ctx, 0, 0, baseSize);
  ctx.fill();

  // Titanium Rim
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  drawHexagon(ctx, 0, 0, baseSize);
  ctx.stroke();

  ctx.restore();

  // 5. High-Contrast Power Symbol
  renderPowerUpSymbol(ctx, meta.symbol, baseSize);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 3: QUANTUM STAR PRISM (Crystalline Diamond with Spiral Helix Flare)
// ─────────────────────────────────────────────────────────────────────────────
export function drawQuantumStarPrism(
  ctx: CanvasRenderingContext2D,
  drop: PowerUpDrop,
  options: PowerUpRenderOptions = {}
) {
  const animTick = options.animTick !== undefined ? options.animTick : drop.angle;
  const userScale = options.scale || 1.35;
  const baseSize = 26 * userScale;
  const meta = drop.meta;

  ctx.save();
  ctx.translate(drop.x, drop.y);

  // 1. Falling Stardust Trail Sparks
  renderFallingTrailSparks(ctx, meta.color, baseSize, animTick);

  // 2. Spiraling Helix Orbiting Particles (5 particles expanding and contracting)
  const helixCount = 5;
  for (let i = 0; i < helixCount; i++) {
    const t = animTick * 3.5 + (i * Math.PI * 2) / helixCount;
    const r = baseSize * (1.2 + Math.sin(t * 2) * 0.25);
    const hx = Math.cos(t) * r;
    const hy = Math.sin(t * 1.5) * (r * 0.6);

    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : meta.color;
    ctx.shadowColor = meta.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. 8-Point Rotating Crystal Star Diamond
  ctx.save();
  ctx.rotate(animTick * 1.4);

  const starGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, baseSize * 1.1);
  starGrad.addColorStop(0, '#ffffff');
  starGrad.addColorStop(0.35, meta.color);
  starGrad.addColorStop(0.7, '#2e0854');
  starGrad.addColorStop(1, '#050010');

  ctx.shadowColor = meta.color;
  ctx.shadowBlur = 24;
  ctx.fillStyle = starGrad;
  draw8PointStar(ctx, 0, 0, baseSize * 1.15, baseSize * 0.65);
  ctx.fill();

  // Star Outline
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.2;
  draw8PointStar(ctx, 0, 0, baseSize * 1.15, baseSize * 0.65);
  ctx.stroke();

  ctx.restore();

  // 4. Center Glowing Circular Core
  const innerR = baseSize * 0.6;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, innerR, 0, Math.PI * 2);
  ctx.fill();

  // 5. High-Contrast Power Symbol
  renderPowerUpSymbol(ctx, meta.symbol, baseSize * 0.85);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER UTILITIES: 3D Satellites, Sparks, Shapes, Symbols
// ─────────────────────────────────────────────────────────────────────────────
function render3DOrbitingSatellites(
  ctx: CanvasRenderingContext2D,
  color: string,
  orbitR: number,
  animTick: number,
  layer: 'behind' | 'front'
) {
  const satelliteCount = 4;
  const tilt = 0.45; // 3D perspective squish

  for (let i = 0; i < satelliteCount; i++) {
    const theta = animTick * 2.8 + (i * Math.PI * 2) / satelliteCount;
    const sx = Math.cos(theta) * orbitR;
    const sy = Math.sin(theta) * (orbitR * tilt);

    // Z-ordering: behind when sy < 0, in front when sy >= 0
    if (layer === 'behind' && sy >= 0) continue;
    if (layer === 'front' && sy < 0) continue;

    const satSize = 3.8 + Math.sin(theta) * 1.6; // Bigger when closer to camera

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;

    // Glowing Satellite Outer Aura
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sx, sy, Math.max(2.5, satSize + 1.2), 0, Math.PI * 2);
    ctx.fill();

    // Bright White Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, sy, Math.max(1.8, satSize), 0, Math.PI * 2);
    ctx.fill();

    // Stardust Tail
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(
      sx + Math.sin(theta) * 12,
      sy - Math.cos(theta) * (12 * tilt)
    );
    ctx.stroke();

    ctx.restore();
  }
}

function renderFallingTrailSparks(
  ctx: CanvasRenderingContext2D,
  color: string,
  baseR: number,
  animTick: number
) {
  const sparkCount = 4;
  for (let s = 0; s < sparkCount; s++) {
    const offset = ((animTick * 2.8 + s * 1.5) % 1.0);
    const ty = -baseR * 0.45 - offset * 32;
    const tx = Math.sin(animTick * 4 + s * 1.2) * 12;
    const alpha = Math.max(0, 1.0 - offset);

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(tx, ty, 2.5 * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderPowerUpSymbol(
  ctx: CanvasRenderingContext2D,
  symbol: string,
  baseSize: number
) {
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#050716';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const fontPx = Math.floor(baseSize * 0.65);
  ctx.font = `900 ${fontPx}px 'Orbitron', 'Chakra Petch', sans-serif`;

  // Drop shadow behind symbol
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillText(symbol, 0, 2);

  // Main bold symbol
  ctx.fillStyle = '#050716';
  ctx.fillText(symbol, 0, 0);

  ctx.restore();
}

function drawHexagon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function draw8PointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number
) {
  const points = 8;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (i * Math.PI) / points;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}
