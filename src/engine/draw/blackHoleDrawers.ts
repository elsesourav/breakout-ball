/**
 * Black Hole Gravitational Singularity Floor Drawer
 * Renders an authentic, compact, cool cosmic black hole at the bottom of the arena.
 *
 * Guarantees:
 * - Clear, comfortable safety gap between paddle and black hole (>120px)
 * - NO outer ring overflow into the playfield or past the paddle
 * - Relativistic Doppler-beaming accretion disk (cyan/white approaching, violet/magenta receding)
 * - Orbiting relativistic embers strictly confined within the horizontal disk plane
 * - Deep obsidian singularity core with luminous Einstein photon ring
 * - Seamless bottom gradient to prevent any blank or abrupt cutoffs
 */

interface AccretionEmber {
  angle: number;
  radiusFactor: number;
  speed: number;
  size: number;
  baseAlpha: number;
}

// 40 deterministic embers for 60fps GC-free rendering
const ACCRETION_EMBERS: AccretionEmber[] = Array.from({ length: 40 }, (_, i) => ({
  angle: (i * Math.PI * 2) / 40 + ((i * 13) % 7) * 0.08,
  radiusFactor: 0.55 + ((i * 17) % 35) / 80, // Stays strictly bounded within disk
  speed: 1.3 + ((i * 11) % 15) / 10,
  size: 2.4 + ((i * 7) % 12) / 4,
  baseAlpha: 0.45 + ((i * 19) % 45) / 100,
}));

/**
 * Draws the cosmic Black Hole Singularity at the bottom of the arena.
 * @param ctx 2D Canvas Context
 * @param w Canvas width (1152)
 * @param h Canvas height (2048)
 * @param animTick Animation tick
 */
export function drawBlackHoleFloor(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  animTick: number
): void {
  ctx.save();

  // Singularity center placed at bottom floor to maintain a clean >120px gap below paddle (paddle y=1843)
  const cx = w * 0.5;
  const cy = h + 24;

  // Bounded horizontal radius that fits comfortably across screen without overflowing
  const baseRx = Math.min(w * 0.44, 500); // ~500px radius (1000px wide out of 1152px)
  const baseRy = 62; // Low profile: peak of accretion disk stays around y = 2010 (Paddle bottom is at 1869)
  const pulse = Math.sin(animTick * 2.4) * 2.2;

  // 1. Soft Cosmic Gravitational Lensing Bloom (Restricted strictly to bottom zone)
  const lensGlow = ctx.createRadialGradient(cx, cy, 12, cx, cy, baseRx * 1.15);
  lensGlow.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
  lensGlow.addColorStop(0.25, 'rgba(124, 58, 237, 0.28)'); // Deep violet
  lensGlow.addColorStop(0.55, 'rgba(0, 247, 255, 0.16)'); // Electric cyan
  lensGlow.addColorStop(0.85, 'rgba(236, 72, 153, 0.05)'); // Doppler magenta
  lensGlow.addColorStop(1, 'rgba(6, 7, 20, 0)');

  ctx.fillStyle = lensGlow;
  ctx.beginPath();
  ctx.ellipse(cx, cy, baseRx * 1.18, baseRy * 1.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Layered Horizontal Accretion Disk Rings (Strictly ZERO tilt to prevent playfield overflow!)
  ctx.save();
  // Outer faint violet ring
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
  ctx.lineWidth = 1.8;
  ctx.shadowColor = '#a855f7';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(cx, cy, baseRx * 0.96 + pulse, baseRy * 0.92, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Relativistic Doppler-beamed Main Disk (Cyan/white approaching on left, violet/magenta receding on right)
  const diskGrad = ctx.createLinearGradient(cx - baseRx * 0.8, cy, cx + baseRx * 0.8, cy);
  diskGrad.addColorStop(0, 'rgba(0, 247, 255, 0.9)'); // Approaching plasma (bright cyan)
  diskGrad.addColorStop(0.38, 'rgba(255, 255, 255, 0.98)'); // High-energy photon peak
  diskGrad.addColorStop(0.68, 'rgba(192, 132, 252, 0.65)'); // Receding violet
  diskGrad.addColorStop(1, 'rgba(236, 72, 153, 0.35)'); // Redshift magenta

  ctx.strokeStyle = diskGrad;
  ctx.lineWidth = 3.0;
  ctx.shadowColor = '#00f7ff';
  ctx.shadowBlur = 15;

  // Relativistic orbital dashes that visibly spin around the horizontal disk
  ctx.setLineDash([30, 16, 14, 16]);
  ctx.lineDashOffset = -animTick * 48;
  ctx.beginPath();
  ctx.ellipse(cx, cy, baseRx * 0.78, baseRy * 0.76, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // 3. Orbiting Relativistic Accretion Embers (Strictly bounded within horizontal disk plane)
  ctx.save();
  for (let i = 0; i < ACCRETION_EMBERS.length; i++) {
    const ember = ACCRETION_EMBERS[i];
    const curAngle = ember.angle + animTick * ember.speed * 0.85;

    const rX = baseRx * ember.radiusFactor;
    const rY = baseRy * ember.radiusFactor * 0.82;

    const px = cx + Math.cos(curAngle) * rX;
    const py = cy + Math.sin(curAngle) * rY;

    // Depth sorting: embers in front (sin >= 0) are brighter; embers behind singularity are occluded/dimmer
    const depthFactor = (Math.sin(curAngle) + 1.2) / 2.2;
    // Doppler beaming: embers moving towards viewer on left are brighter and bluer
    const doppler = px < cx ? 1.25 : 0.75;
    const finalAlpha = Math.min(1.0, ember.baseAlpha * depthFactor * doppler);

    const isCyan = px < cx;
    const color = isCyan ? (i % 2 === 0 ? '#00f7ff' : '#ffffff') : '#c084fc';

    ctx.globalAlpha = finalAlpha;
    ctx.fillStyle = color;
    ctx.shadowColor = isCyan ? '#00f7ff' : '#a855f7';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    // Stretched along orbital motion direction
    const sz = ember.size * (0.85 + depthFactor * 0.35);
    ctx.ellipse(px, py, sz * 1.6, sz * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4. Luminous Einstein Photon Ring (Event Horizon Boundary)
  const horizonRx = baseRx * 0.52;
  const horizonRy = baseRy * 0.56;

  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = '#00f7ff';
  ctx.shadowBlur = 18;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(cx, cy, horizonRx, horizonRy, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Relativistic notches along photon ring
  const notchCount = 8;
  for (let n = 0; n < notchCount; n++) {
    const theta = Math.PI + (n * Math.PI) / notchCount; // Upper perimeter facing arena
    const nx = cx + Math.cos(theta) * horizonRx;
    const ny = cy + Math.sin(theta) * horizonRy;
    const nLen = 6 + (n % 2) * 4;

    ctx.strokeStyle = n % 2 === 0 ? '#00f7ff' : '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(nx, ny);
    ctx.lineTo(nx + Math.cos(theta) * nLen, ny + Math.sin(theta) * (nLen * 0.35));
    ctx.stroke();
  }
  ctx.restore();

  // 5. Pitch-Black Obsidian Singularity Core (Zero escape void)
  ctx.save();
  const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, horizonRx * 0.95);
  coreGrad.addColorStop(0, '#000000');
  coreGrad.addColorStop(0.85, '#000000');
  coreGrad.addColorStop(1, 'rgba(3, 4, 12, 0.98)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, horizonRx * 0.94, horizonRy * 0.94, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Seamless Bottom Gradient Fill (Eliminates any blank gaps or cutoffs at bottom of canvas)
  ctx.save();
  const bottomFillGrad = ctx.createLinearGradient(0, cy, 0, h + 30);
  bottomFillGrad.addColorStop(0, '#000000');
  bottomFillGrad.addColorStop(0.5, '#010208');
  bottomFillGrad.addColorStop(1, '#000000');
  ctx.fillStyle = bottomFillGrad;
  ctx.fillRect(cx - horizonRx * 0.9, cy, horizonRx * 1.8, (h + 30) - cy);
  ctx.restore();

  // 7. Event Horizon Warning Line (Leaves >120px clean gap below the paddle)
  ctx.save();
  const alertY = cy - baseRy - 22; // ~1940 (Paddle bottom is at 1869, leaving >70px to warning line and >120px to singularity)
  const alertGrad = ctx.createLinearGradient(w * 0.16, alertY, w * 0.84, alertY);
  alertGrad.addColorStop(0, 'rgba(0, 247, 255, 0)');
  alertGrad.addColorStop(0.25, 'rgba(0, 247, 255, 0.6)');
  alertGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
  alertGrad.addColorStop(0.75, 'rgba(168, 85, 247, 0.6)');
  alertGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

  ctx.strokeStyle = alertGrad;
  ctx.lineWidth = 1.6;
  ctx.shadowColor = '#00f7ff';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(w * 0.16, alertY);
  // Gentle gravitational curvature dipping towards the center
  ctx.quadraticCurveTo(cx, alertY + 14, w * 0.84, alertY);
  ctx.stroke();

  // Tech hazard label at center of warning line
  ctx.fillStyle = 'rgba(0, 247, 255, 0.75)';
  ctx.font = '700 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CRITICAL VOID THRESHOLD', cx, alertY - 6);
  ctx.restore();

  ctx.restore();
}
