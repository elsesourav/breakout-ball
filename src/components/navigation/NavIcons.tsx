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
