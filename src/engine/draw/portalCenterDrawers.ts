/**
 * High-Tech Portal Center Renderers
 * Provides styles for Quantum Stargate, Pulsing Cosmic Nexus, and Hex Cyber Aperture.
 */

export type PortalCenterStyle = 1 | 2 | 3;

export function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const hx = x + r * Math.cos(angle);
    const hy = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
}

/**
 * Refined Portal Center (High-Tech Stargate / Event Horizon)
 * Replaces cartoonish swirls with cinematic sci-fi dimensional rifts.
 */
export function renderRefinedPortalCenter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  animTick: number,
  style: PortalCenterStyle = 1
) {
  ctx.save();
  ctx.translate(cx, cy);

  switch (style) {
    case 2: {
      // ── STYLE 2: PULSING COSMIC NEXUS (Radiant Accretion Vortex) ──
      const pulse = Math.sin(animTick * 3) * 0.15 + 1.0;

      // Outer violet accretion flare
      const flareGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * pulse);
      flareGrad.addColorStop(0, '#ffffff');
      flareGrad.addColorStop(0.35, '#c084fc');
      flareGrad.addColorStop(0.7, '#7c3aed');
      flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Dual counter-rotating stardust orbit rings
      ctx.save();
      ctx.rotate(animTick * 2.2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.72, 0, Math.PI * 1.5);
      ctx.stroke();

      ctx.rotate(-animTick * 3.5);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.48, 0, Math.PI * 1.2);
      ctx.stroke();
      ctx.restore();

      // Deep central singularity void
      ctx.fillStyle = '#020008';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // White-hot pinpoint star core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1.0, r * 0.08), 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 3: {
      // ── STYLE 3: HEX CYBER APERTURE (Dimensional Iris Gate) ──
      ctx.save();
      ctx.rotate(animTick * 0.8);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = Math.max(1.0, r * 0.09);
      drawHexagon(ctx, 0, 0, r * 0.95);
      ctx.stroke();

      // 6 Iris Gateway Prongs
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = Math.max(0.8, r * 0.05);
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * (r * 0.5), Math.sin(ang) * (r * 0.5));
        ctx.lineTo(Math.cos(ang + 0.3) * (r * 0.95), Math.sin(ang + 0.3) * (r * 0.95));
        ctx.lineTo(Math.cos(ang - 0.3) * (r * 0.95), Math.sin(ang - 0.3) * (r * 0.95));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // Central glowing wormhole eye
      const eyeGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, r * 0.42);
      eyeGrad.addColorStop(0, '#ffffff');
      eyeGrad.addColorStop(0.4, '#00f7ff');
      eyeGrad.addColorStop(0.8, '#4c1d95');
      eyeGrad.addColorStop(1, '#020008');
      ctx.fillStyle = eyeGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 1:
    default: {
      // ── STYLE 1 (DEFAULT): QUANTUM STARGATE EVENT HORIZON ──
      const photonGrad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 0.98);
      photonGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
      photonGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.65)');
      photonGrad.addColorStop(0.85, 'rgba(14, 5, 34, 0.3)');
      photonGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = photonGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.98, 0, Math.PI * 2);
      ctx.fill();

      // Dual rotating segmented quantum gate rings
      ctx.save();
      ctx.rotate(animTick * 1.8);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = Math.max(1.0, r * 0.08);
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.72, i * (Math.PI / 2) + 0.2, (i + 1) * (Math.PI / 2) - 0.2);
        ctx.stroke();
      }

      // Cardinal gateway calipers (4 directional notches)
      const caliperSize = Math.max(1.5, r * 0.12);
      for (let i = 0; i < 4; i++) {
        const ang = i * (Math.PI / 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(
          Math.cos(ang) * (r * 0.68) - caliperSize / 2,
          Math.sin(ang) * (r * 0.68) - caliperSize / 2,
          caliperSize,
          caliperSize
        );
      }
      ctx.restore();

      // Inner counter-rotating micro-ring
      ctx.save();
      ctx.rotate(-animTick * 2.2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = Math.max(0.8, r * 0.06);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.46, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Deep obsidian singularity pupil
      const voidGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, r * 0.32);
      voidGrad.addColorStop(0, '#ffffff');
      voidGrad.addColorStop(0.3, '#38bdf8');
      voidGrad.addColorStop(0.65, '#0e0524');
      voidGrad.addColorStop(1.0, '#000000');
      ctx.fillStyle = voidGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
      ctx.fill();

      // White-hot center singularity glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1.0, r * 0.09), 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}
