import React from 'react';

interface IconProps {
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Custom Breakout-themed Campaign/Arcade Icon:
 * Features a neon arcade paddle at the base, bouncing energy ball,
 * and kinetic deflection motion lines.
 */
export const NavArcadeIcon: React.FC<IconProps> = ({ active, className = 'w-5 h-5', style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Breakout Paddle Base */}
    <rect
      x="3.5"
      y="18"
      width="17"
      height="3.5"
      rx="1.75"
      fill={active ? 'currentColor' : '#475569'}
      fillOpacity={active ? 0.35 : 0.25}
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Paddle Center Grip Line */}
    <line x1="8.5" y1="19.75" x2="15.5" y2="19.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity={0.9} />

    {/* Bouncing Energy Ball */}
    <circle
      cx="12"
      cy="7"
      r="3.2"
      fill={active ? 'currentColor' : '#64748b'}
      fillOpacity={active ? 0.45 : 0.3}
      stroke="currentColor"
      strokeWidth="1.9"
    />
    {/* Ball Inner Glow Core */}
    <circle cx="12" cy="7" r="1.2" fill="currentColor" />

    {/* Kinetic Bounce Energy Beams */}
    <path
      d="M12 11.5v3.5M7.5 10l2.5 2.5M16.5 10l-2.5 2.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeDasharray="1.5 2"
      opacity={active ? 0.9 : 0.6}
    />
  </svg>
);

/**
 * Custom Online/Arena Icon:
 * Dueling cyber paddles facing each other across a global network sphere.
 */
export const NavArenaIcon: React.FC<IconProps> = ({ active, className = 'w-5 h-5', style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Global Arena Orbit Ring */}
    <circle
      cx="12"
      cy="12"
      r="8.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeDasharray="3 2.5"
      opacity={0.4}
    />
    {/* Top Duel Paddle */}
    <rect
      x="7.5"
      y="3.5"
      width="9"
      height="2.8"
      rx="1.4"
      fill={active ? 'currentColor' : '#475569'}
      fillOpacity={active ? 0.3 : 0.2}
      stroke="currentColor"
      strokeWidth="1.7"
    />
    {/* Bottom Duel Paddle */}
    <rect
      x="7.5"
      y="17.7"
      width="9"
      height="2.8"
      rx="1.4"
      fill={active ? 'currentColor' : '#475569'}
      fillOpacity={active ? 0.3 : 0.2}
      stroke="currentColor"
      strokeWidth="1.7"
    />
    {/* Central Pulsing Energy Core */}
    <circle
      cx="12"
      cy="12"
      r="2.8"
      fill={active ? 'currentColor' : '#64748b'}
      fillOpacity={active ? 0.5 : 0.3}
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" />
    {/* Energy Sparks */}
    <line x1="12" y1="7.2" x2="12" y2="8.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="15.2" x2="12" y2="16.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * Custom Create / Level Studio Icon:
 * High-tech modular breakout bricks matrix with a constructor cursor.
 */
export const NavStudioIcon: React.FC<IconProps> = ({ active, className = 'w-5 h-5', style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Row 1 Bricks */}
    <rect
      x="3.5"
      y="4.5"
      width="7.5"
      height="4.2"
      rx="1.2"
      fill={active ? 'currentColor' : '#475569'}
      fillOpacity={active ? 0.35 : 0.2}
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <rect
      x="13"
      y="4.5"
      width="7.5"
      height="4.2"
      rx="1.2"
      fill={active ? 'currentColor' : '#475569'}
      fillOpacity={active ? 0.35 : 0.2}
      stroke="currentColor"
      strokeWidth="1.7"
    />
    {/* Row 2 Staggered Brick */}
    <rect
      x="7"
      y="10.8"
      width="10"
      height="4.2"
      rx="1.2"
      fill={active ? 'currentColor' : '#475569'}
      fillOpacity={active ? 0.45 : 0.25}
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Builder / Matrix Cursor */}
    <path
      d="M12 17.5v4M10 19.5h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Custom Player Identity / Profile Icon:
 * Futuristic cyber-helm with neon visor and core status dot.
 */
export const NavProfileIcon: React.FC<IconProps> = ({ active, className = 'w-5 h-5', style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer Cyber Helm Contour */}
    <path
      d="M12 3C7.5 3 4.5 6.5 4.5 11.5v1.8c0 1.2.6 2.3 1.6 2.9l1.4 4.1c.3.8 1.1 1.4 2 1.4h5c.9 0 1.7-.6 2-1.4l1.4-4.1c1-.6 1.6-1.7 1.6-2.9v-1.8C19.5 6.5 16.5 3 12 3Z"
      fill={active ? 'currentColor' : '#475569'}
      fillOpacity={active ? 0.25 : 0.15}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Sleek Neon Visor */}
    <path
      d="M7 11.5h10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Tech Chin Port */}
    <circle cx="12" cy="16.5" r="1.3" fill="currentColor" />
  </svg>
);

/**
 * Custom Armory / Upgrade Icon:
 * Kinetic plasma core with dual upward overdrive chevrons and energy conduits.
 */
export const NavArmoryIcon: React.FC<IconProps> = ({ active, className = 'w-5 h-5', style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Upward Overdrive Chevron 1 (Top) */}
    <path
      d="M7 9l5-5 5 5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Upward Overdrive Chevron 2 (Middle) */}
    <path
      d="M7 14l5-5 5 5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={active ? 0.9 : 0.6}
    />
    {/* Upgraded Cyber Core / Nanotech Battery Base */}
    <rect
      x="5"
      y="16.5"
      width="14"
      height="4"
      rx="2"
      fill={active ? 'currentColor' : '#475569'}
      fillOpacity={active ? 0.35 : 0.2}
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* Core Charge Slots */}
    <circle cx="8.5" cy="18.5" r="1" fill="currentColor" />
    <circle cx="12" cy="18.5" r="1" fill="currentColor" />
    <circle cx="15.5" cy="18.5" r="1" fill="currentColor" />
  </svg>
);

/**
 * Custom Arena Studio / Level Architect Icon:
 * Cyberpunk Breakout matrix constructor featuring blueprint drafting reticles,
 * floating neon brick blocks, glowing apex core, kinetic energy sphere, and launch paddle.
 */
export const StudioMatrixForgeIcon: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = 'w-10 h-10', style }) => (
  <svg
    viewBox="0 0 52 52"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="smfCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f7ff" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <linearGradient id="smfIndigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
      <linearGradient id="smfAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <filter id="smfGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Blueprint Corner Drafting Brackets */}
    <path
      d="M7 13V8C7 7.45 7.45 7 8 7H13"
      stroke="#00f7ff"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.55"
    />
    <path
      d="M39 7H44C44.55 7 45 7.45 45 8V13"
      stroke="#00f7ff"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.55"
    />
    <path
      d="M7 39V44C7 44.55 7.45 45 8 45H13"
      stroke="#00f7ff"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.55"
    />
    <path
      d="M39 45H44C44.55 45 45 44.55 45 44V39"
      stroke="#00f7ff"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.55"
    />

    {/* Blueprint Drafting Reticle Crosshairs */}
    <line x1="26" y1="5.5" x2="26" y2="7.5" stroke="#00f7ff" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    <line x1="26" y1="44.5" x2="26" y2="46.5" stroke="#00f7ff" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    <line x1="5.5" y1="26" x2="7.5" y2="26" stroke="#00f7ff" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    <line x1="44.5" y1="26" x2="46.5" y2="26" stroke="#00f7ff" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />

    {/* Top Row Bricks (Floating Matrix Tier 1) */}
    <rect
      x="11"
      y="10.5"
      width="13"
      height="6"
      rx="1.75"
      fill="url(#smfCyanGrad)"
      fillOpacity="0.25"
      stroke="#00f7ff"
      strokeWidth="1.5"
    />
    <line x1="13.5" y1="12.2" x2="21.5" y2="12.2" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />

    <rect
      x="28"
      y="10.5"
      width="13"
      height="6"
      rx="1.75"
      fill="url(#smfIndigoGrad)"
      fillOpacity="0.25"
      stroke="#818cf8"
      strokeWidth="1.5"
    />
    <line x1="30.5" y1="12.2" x2="38.5" y2="12.2" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />

    {/* Middle Row Staggered Bricks (Matrix Tier 2) */}
    <rect
      x="6.5"
      y="19.5"
      width="11"
      height="6"
      rx="1.75"
      fill="url(#smfIndigoGrad)"
      fillOpacity="0.22"
      stroke="#818cf8"
      strokeWidth="1.4"
    />

    {/* Glowing Center Matrix Core Brick */}
    <rect
      x="20.5"
      y="19.5"
      width="11"
      height="6"
      rx="1.75"
      fill="url(#smfAmberGrad)"
      fillOpacity="0.32"
      stroke="#fbbf24"
      strokeWidth="1.6"
      filter="url(#smfGlow)"
    />
    {/* Core Dot in Center Brick */}
    <circle cx="26" cy="22.5" r="1.2" fill="#fef08a" />

    <rect
      x="34.5"
      y="19.5"
      width="11"
      height="6"
      rx="1.75"
      fill="url(#smfIndigoGrad)"
      fillOpacity="0.22"
      stroke="#818cf8"
      strokeWidth="1.4"
    />

    {/* Kinetic Deflection Ray from Orb */}
    <line
      x1="26"
      y1="32.5"
      x2="26"
      y2="27.5"
      stroke="#00f7ff"
      strokeWidth="1.3"
      strokeDasharray="1.8 1.8"
      strokeLinecap="round"
      opacity="0.85"
    />

    {/* Glowing Breakout Energy Ball */}
    <circle
      cx="26"
      cy="33"
      r="3"
      fill="#ffffff"
      stroke="#00f7ff"
      strokeWidth="1.8"
      filter="url(#smfGlow)"
    />
    {/* Orbit Ring */}
    <ellipse
      cx="26"
      cy="33"
      rx="5.8"
      ry="2"
      transform="rotate(-20 26 33)"
      stroke="#00f7ff"
      strokeWidth="1.1"
      strokeDasharray="1.5 1.5"
      opacity="0.7"
    />

    {/* Bottom Breakout Paddle Platform */}
    <rect
      x="12"
      y="40.5"
      width="28"
      height="4.5"
      rx="2.25"
      fill="url(#smfCyanGrad)"
      fillOpacity="0.3"
      stroke="#00f7ff"
      strokeWidth="1.6"
    />
    {/* Paddle Center Grip Accent */}
    <line x1="19" y1="42.75" x2="33" y2="42.75" stroke="#00f7ff" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
  </svg>
);
