import { PowerUpDrop } from '../powerUpTypes';
import { renderFallingTrailSparks, renderCustomPowerUpIcon } from './powerUpIconDrawers';

export interface PowerUpRenderOptions {
  animTick?: number;
  scale?: number;
}

/**
 * Locked Selected Power-Up Drawer: PLANAR DELTA VORTEX
 *
 * Transparent kinetic 2D rotating triangle frame with outer dashed orbital
 * energy ring, inner concentric micro-triangle, 3 luminous vertex gems,
 * trailing comet sparks, and a centered upright stabilized vector icon.
 */
export function drawPowerUpWithPreset(
  ctx: CanvasRenderingContext2D,
  drop: PowerUpDrop,
  _preset?: number,
  options: PowerUpRenderOptions = {}
) {
  drawPlanarDeltaVortex(ctx, drop, options);
}

export function drawPlanarDeltaVortex(
  ctx: CanvasRenderingContext2D,
  drop: PowerUpDrop,
  options: PowerUpRenderOptions = {}
) {
  const animTick = options.animTick !== undefined ? options.animTick : drop.angle;
  const userScale = options.scale || 1.35;
  const R = 32 * userScale;
  const meta = drop.meta;

  ctx.save();
  ctx.translate(drop.x, drop.y);

  // 1. Trail sparks
  renderFallingTrailSparks(ctx, meta.color, R * 0.8, animTick);

  // 2. Outer Transparent Orbital Energy Ring
  const pulse = Math.sin(animTick * 4) * 2;
  ctx.save();
  ctx.strokeStyle = hexToRgba(meta.color, 0.35);
  ctx.lineWidth = 1.4;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.15 + pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 3. Rotating 2D Triangle Frame
  const rot = animTick * 1.6;
  ctx.save();
  ctx.rotate(rot);

  // Triangle path
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 3;
    const x = Math.cos(angle) * R;
    const y = Math.sin(angle) * R;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // Transparent crystalline fill (100% see-through, no opaque background)
  const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, R);
  grad.addColorStop(0, hexToRgba(meta.color, 0.24));
  grad.addColorStop(0.7, hexToRgba(meta.color, 0.08));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Glowing neon borders
  ctx.strokeStyle = meta.color;
  ctx.shadowColor = meta.glow;
  ctx.shadowBlur = 14;
  ctx.lineWidth = 2.4 * userScale;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Inner concentric micro-triangle
  const inR = R * 0.72;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 3;
    const x = Math.cos(angle) * inR;
    const y = Math.sin(angle) * inR;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.shadowBlur = 6;
  ctx.lineWidth = 1.0;
  ctx.stroke();

  // 3 Vertex Micro-Gems
  for (let i = 0; i < 3; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 3;
    const x = Math.cos(angle) * R;
    const y = Math.sin(angle) * R;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = meta.glow;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, 3 * userScale, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // Undo rotation for the centered icon

  // 4. Orbiting Trailing Comet Motes (circling around the outer perimeter)
  const motesCount = 3;
  for (let m = 0; m < motesCount; m++) {
    const angle = -rot * 1.5 + (m * Math.PI * 2) / motesCount;
    const dist = R * 1.15;
    const mx = Math.cos(angle) * dist;
    const my = Math.sin(angle) * dist;

    ctx.save();
    ctx.shadowColor = meta.glow;
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(mx, my, 2.4 * userScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 5. Centered Upright Vector Icon (Stabilized, High Visibility)
  ctx.save();
  const hover = Math.sin(animTick * 3) * 1.5;
  ctx.translate(0, hover);
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 8;
  renderCustomPowerUpIcon(ctx, meta.type, 38 * userScale, meta.color);
  ctx.restore();

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: HEX TO RGBA
// ─────────────────────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  if (!hex || !hex.startsWith('#')) return `rgba(255, 255, 255, ${alpha})`;
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(255, 255, 255, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
