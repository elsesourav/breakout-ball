/**
 * High-Tech Portal Center Renderers
 * Provides styles for Quantum Stargate, Pulsing Cosmic Nexus, and Hex Cyber Aperture.
 */

export type PortalCenterStyle = 1 | 2 | 3;

export interface PortalPairColorTheme {
  primary: string;    // Main bright accent
  secondary: string;  // Supporting hue
  glow: string;       // Radial glow color
  core: string;       // Intense bright core color
  dark: string;       // Dark cosmic background
  border: string;     // Border color
  bg: string;         // Glass fill
}

export const PORTAL_PAIR_THEMES: Record<number, PortalPairColorTheme> = {
  1: {
    primary: '#00f7ff',
    secondary: '#0284c7',
    glow: 'rgba(0, 247, 255, 0.85)',
    core: '#ffffff',
    dark: '#031726',
    border: '#00f7ff',
    bg: 'rgba(0, 247, 255, 0.28)',
  },
  2: {
    primary: '#f0abfc',
    secondary: '#c084fc',
    glow: 'rgba(240, 171, 252, 0.85)',
    core: '#ffffff',
    dark: '#250738',
    border: '#e879f9',
    bg: 'rgba(232, 121, 249, 0.28)',
  },
  3: {
    primary: '#fbbf24',
    secondary: '#f59e0b',
    glow: 'rgba(251, 191, 36, 0.85)',
    core: '#ffffff',
    dark: '#2a1604',
    border: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.28)',
  },
  4: {
    primary: '#34d399',
    secondary: '#10b981',
    glow: 'rgba(52, 211, 153, 0.85)',
    core: '#ffffff',
    dark: '#04241a',
    border: '#34d399',
    bg: 'rgba(52, 211, 153, 0.28)',
  },
};

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
 * Colors adapt dynamically to portal pair ID (Pairs 1-4: Cyan, Magenta, Amber, Emerald).
 */
export function renderRefinedPortalCenter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  animTick: number,
  style: PortalCenterStyle = 1,
  portalPairId: number = 1
) {
  ctx.save();
  ctx.translate(cx, cy);

  const theme = PORTAL_PAIR_THEMES[portalPairId] || PORTAL_PAIR_THEMES[1];

  switch (style) {
    case 2: {
      // ── STYLE 2: PULSING COSMIC NEXUS (Radiant Accretion Vortex) ──
      const pulse = Math.sin(animTick * 3) * 0.15 + 1.0;

      // Outer color-matched accretion flare
      const flareGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * pulse);
      flareGrad.addColorStop(0, '#ffffff');
      flareGrad.addColorStop(0.35, theme.primary);
      flareGrad.addColorStop(0.7, theme.secondary);
      flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Dual counter-rotating stardust orbit rings
      ctx.save();
      ctx.rotate(animTick * 2.2);
      ctx.strokeStyle = theme.primary;
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
      ctx.fillStyle = theme.dark;
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
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = Math.max(1.0, r * 0.09);
      drawHexagon(ctx, 0, 0, r * 0.95);
      ctx.stroke();

      // 6 Iris Gateway Prongs
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        ctx.fillStyle = theme.dark;
        ctx.strokeStyle = theme.secondary;
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
      eyeGrad.addColorStop(0.4, theme.primary);
      eyeGrad.addColorStop(0.8, theme.secondary);
      eyeGrad.addColorStop(1, theme.dark);
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
      photonGrad.addColorStop(0, theme.glow);
      photonGrad.addColorStop(0.5, theme.secondary);
      photonGrad.addColorStop(0.85, theme.dark);
      photonGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = photonGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.98, 0, Math.PI * 2);
      ctx.fill();

      // Dual rotating segmented quantum gate rings
      ctx.save();
      ctx.rotate(animTick * 1.8);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
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
        ctx.fillStyle = theme.primary;
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
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = Math.max(0.8, r * 0.06);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.46, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Deep obsidian singularity pupil
      const voidGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, r * 0.32);
      voidGrad.addColorStop(0, '#ffffff');
      voidGrad.addColorStop(0.3, theme.primary);
      voidGrad.addColorStop(0.65, theme.dark);
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
