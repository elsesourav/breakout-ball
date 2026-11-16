import { PowerUpType } from '../powerUpTypes';

export function renderFallingTrailSparks(
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
    ctx.beginPath();
    ctx.arc(tx, ty, 2.5 * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function renderCustomPowerUpIcon(
  ctx: CanvasRenderingContext2D,
  type: PowerUpType,
  baseSize: number,
  color: string
) {
  ctx.save();
  ctx.shadowBlur = 0;
  const s = baseSize * 0.46;

  switch (type) {
    case 'multiball': {
      // Twin glowing plasma cores linked by energy bridge
      const orbR = s * 0.42;
      const offX = s * 0.52;
      // Linking beam
      ctx.fillStyle = '#060a16';
      ctx.fillRect(-offX, -s * 0.14, offX * 2, s * 0.28);
      ctx.fillStyle = color;
      ctx.fillRect(-offX, -s * 0.07, offX * 2, s * 0.14);

      [-offX, offX].forEach((ox) => {
        const og = ctx.createRadialGradient(ox - orbR * 0.3, -orbR * 0.3, 1, ox, 0, orbR);
        og.addColorStop(0, '#ffffff');
        og.addColorStop(0.4, color);
        og.addColorStop(1, '#050a18');
        ctx.fillStyle = og;
        ctx.beginPath();
        ctx.arc(ox, 0, orbR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
      break;
    }

    case 'megaball': {
      // 8-Point Radiant Solar Core
      const starGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, s);
      starGrad.addColorStop(0, '#ffffff');
      starGrad.addColorStop(0.4, '#ffd700');
      starGrad.addColorStop(0.85, '#ff5500');
      starGrad.addColorStop(1, '#2e0800');
      ctx.fillStyle = starGrad;
      draw8PointStar(ctx, 0, 0, s, s * 0.52);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // Center hot nucleus
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'laser': {
      // Dual futuristic blaster cannon barrels
      const bw = s * 0.26;
      const bh = s * 1.05;
      const sep = s * 0.42;

      [-sep, sep].forEach((bx) => {
        ctx.fillStyle = '#070b18';
        ctx.fillRect(bx - bw / 2, -bh * 0.45, bw, bh * 0.9);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(bx - bw / 2, -bh * 0.45, bw, bh * 0.9);

        ctx.fillStyle = color;
        ctx.fillRect(bx - bw * 0.3, -bh * 0.55, bw * 0.6, bh * 0.25);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx - bw * 0.15, -bh * 0.58, bw * 0.3, bh * 0.15);
      });

      // Center crosshair chevron
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.5);
      ctx.lineTo(s * 0.2, -s * 0.15);
      ctx.lineTo(-s * 0.2, -s * 0.15);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'slowmo': {
      // Futuristic Chronos Warp Dial & Hands
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1.5, -s * 0.85, 3, s * 0.2);
      ctx.fillRect(-1.5, s * 0.65, 3, s * 0.2);
      ctx.fillRect(-s * 0.85, -1.5, s * 0.2, 3);
      ctx.fillRect(s * 0.65, -1.5, s * 0.2, 3);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-s * 0.45, -s * 0.38);
      ctx.moveTo(0, 0);
      ctx.lineTo(s * 0.42, -s * 0.42);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'shield': {
      // Hexagonal Cyber Aegis Shield
      const shGrad = ctx.createLinearGradient(0, -s, 0, s);
      shGrad.addColorStop(0, '#ffffff');
      shGrad.addColorStop(0.35, color);
      shGrad.addColorStop(1, '#052e16');
      ctx.fillStyle = shGrad;
      drawHexagon(ctx, 0, 0, s * 0.88);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.strokeStyle = '#051b11';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-s * 0.42, -s * 0.2);
      ctx.lineTo(0, s * 0.35);
      ctx.lineTo(s * 0.42, -s * 0.2);
      ctx.stroke();
      break;
    }

    case 'expand': {
      // Dual Expansion Caliper Chevrons
      const arrH = s * 0.7;

      ctx.fillStyle = '#060a16';
      ctx.fillRect(-s * 0.7, -s * 0.1, s * 1.4, s * 0.2);
      ctx.fillStyle = color;
      ctx.fillRect(-s * 0.65, -s * 0.04, s * 1.3, s * 0.08);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-s * 0.75, 0);
      ctx.lineTo(-s * 0.25, -arrH * 0.5);
      ctx.lineTo(-s * 0.35, 0);
      ctx.lineTo(-s * 0.25, arrH * 0.5);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(s * 0.75, 0);
      ctx.lineTo(s * 0.25, -arrH * 0.5);
      ctx.lineTo(s * 0.35, 0);
      ctx.lineTo(s * 0.25, arrH * 0.5);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

export function drawHexagon(
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

export function draw8PointStar(
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
