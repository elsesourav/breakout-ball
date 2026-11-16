import React from 'react';

export interface IconProps {
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Custom Breakout-themed Campaign/Arcade Icon:
 * Features a neon arcade paddle at the base, bouncing energy ball,
 * and kinetic deflection motion lines.
 */
export const NavArcadeIcon: React.FC<IconProps> = ({ active, className = 'w-6 h-6', style }) => (
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
      fill={active ? '#062e45' : '#07152b'}
      stroke="#00f7ff"
      strokeWidth="1.8"
    />
    {/* Paddle Center Grip Line */}
    <line x1="8.5" y1="19.75" x2="15.5" y2="19.75" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity={0.9} />

    {/* Bouncing Energy Ball */}
    <circle
      cx="12"
      cy="7"
      r="3.2"
      fill="#0284c7"
      stroke="#00f7ff"
      strokeWidth="1.8"
    />
    {/* Ball Inner Glow Core */}
    <circle cx="12" cy="7" r="1.3" fill="#ffffff" />

    {/* Kinetic Bounce Energy Beams */}
    <path
      d="M12 11.5v3.5M7.5 10l2.5 2.5M16.5 10l-2.5 2.5"
      stroke="#38bdf8"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeDasharray="1.5 2"
      opacity={0.9}
    />
  </svg>
);

/**
 * Custom Online/Arena Icon:
 * Competitive dueling cyber paddles facing off across a central plasma impact collision orb.
 */
export const NavArenaIcon: React.FC<IconProps> = ({ active, className = 'w-6 h-6', style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Tactical Arena Orbit Rings */}
    <circle
      cx="12"
      cy="12"
      r="8.5"
      stroke="#a855f7"
      strokeWidth="1.3"
      strokeDasharray="3 2"
      opacity="0.45"
    />
    {/* Top Challenger Paddle (Hot Purple / Magenta) */}
    <rect
      x="7"
      y="3.2"
      width="10"
      height="3.2"
      rx="1.6"
      fill="#4a044e"
      stroke="#e879f9"
      strokeWidth="1.6"
    />
    <line x1="9.5" y1="4.8" x2="14.5" y2="4.8" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity="0.9" />

    {/* Bottom Defender Paddle (Cyan / Electric Blue) */}
    <rect
      x="7"
      y="17.6"
      width="10"
      height="3.2"
      rx="1.6"
      fill="#082f49"
      stroke="#00f7ff"
      strokeWidth="1.6"
    />
    <line x1="9.5" y1="19.2" x2="14.5" y2="19.2" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity="0.9" />

    {/* Collision Energy Crosshairs */}
    <line x1="12" y1="7.8" x2="12" y2="9.6" stroke="#f43f5e" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="12" y1="14.4" x2="12" y2="16.2" stroke="#f43f5e" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="7.8" y1="12" x2="9.6" y2="12" stroke="#00f7ff" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="14.4" y1="12" x2="16.2" y2="12" stroke="#e879f9" strokeWidth="1.4" strokeLinecap="round" />

    {/* Central Pulsing Collision Plasma Sphere */}
    <circle cx="12" cy="12" r="3.2" fill="#e11d48" stroke="#fb7185" strokeWidth="1.4" />
    <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
  </svg>
);

/**
 * Custom Armory / Upgrade Icon:
 * Kinetic plasma core with dual upward supersonic overdrive chevrons and multi-element power cells.
 */
export const NavArmoryIcon: React.FC<IconProps> = ({ active, className = 'w-6 h-6', style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Upward Overdrive Chevron 1 (Top Supersonic Booster) */}
    <path
      d="M6 7.5l6-5 6 5"
      stroke="#00f7ff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Upward Overdrive Chevron 2 (Middle Power Arc) */}
    <path
      d="M7 12.5l5-4.2 5 4.2"
      stroke="#818cf8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Paddle Upgrade Chassis Base */}
    <rect
      x="4"
      y="16.5"
      width="16"
      height="4.2"
      rx="2.1"
      fill="#0c1b38"
      stroke="#00f7ff"
      strokeWidth="1.6"
    />
    {/* Three Multi-Element Upgrade Power Cells */}
    <circle cx="8" cy="18.6" r="1.3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.6" />
    <circle cx="12" cy="18.6" r="1.5" fill="#00f7ff" stroke="#ffffff" strokeWidth="0.8" />
    <circle cx="16" cy="18.6" r="1.3" fill="#34d399" stroke="#10b981" strokeWidth="0.6" />
  </svg>
);

/**
 * Custom Create / Level Studio Icon:
 * Vibrant Breakout matrix constructor featuring colorful neon bricks (cyan, fuchsia, amber apex),
 * blueprint drafting brackets, and precision architect stylus.
 */
export const NavStudioIcon: React.FC<IconProps> = ({ active, className = 'w-6 h-6', style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Corner Blueprint Drafting Brackets */}
    <path d="M3.5 6.5V3.5h3" stroke="#38bdf8" strokeWidth="1.3" strokeLinecap="round" opacity="0.75" />
    <path d="M20.5 17.5v3h-3" stroke="#38bdf8" strokeWidth="1.3" strokeLinecap="round" opacity="0.75" />

    {/* Top Row Neon Cyan Brick */}
    <rect
      x="4.2"
      y="4.5"
      width="7.2"
      height="4.4"
      rx="1.4"
      fill="#062e45"
      stroke="#00f7ff"
      strokeWidth="1.6"
    />
    <line x1="5.8" y1="6" x2="10" y2="6" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />

    {/* Top Row Neon Fuchsia/Purple Brick */}
    <rect
      x="12.6"
      y="4.5"
      width="7.2"
      height="4.4"
      rx="1.4"
      fill="#38083b"
      stroke="#e879f9"
      strokeWidth="1.6"
    />
    <line x1="14.2" y1="6" x2="18.4" y2="6" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />

    {/* Middle Row Staggered Amber Apex Brick */}
    <rect
      x="7.5"
      y="10.2"
      width="9"
      height="4.4"
      rx="1.4"
      fill="#3d2105"
      stroke="#fbbf24"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="12.4" r="1.2" fill="#fef08a" />

    {/* Architect Precision Stylus / Level Constructor Wand */}
    <path
      d="M5.5 19.5l4-4"
      stroke="#38bdf8"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Stylus Tip Placing Laser Beam */}
    <circle cx="10" cy="15" r="1.4" fill="#00f7ff" />
    <circle cx="10" cy="15" r="0.7" fill="#ffffff" />
    <path d="M11.8 13.8l1.6-1.6M10 13v-1.5" stroke="#00f7ff" strokeWidth="1.1" strokeLinecap="round" opacity="0.9" />
  </svg>
);

/** Alias for backward compatibility with StudioView */
export const StudioMatrixForgeIcon = NavStudioIcon;

/**
 * Custom Core Vault / Shop Icon:
 * High-tech cyber treasury chest with radiant gold borders, multifaceted cyan quantum core cube,
 * and diamond currency spark crystals.
 */
export const NavShopIcon: React.FC<IconProps> = ({ active, className = 'w-6 h-6', style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Cyber Vault Canopy / Shielding Frame */}
    <path
      d="M3.5 8l2.5-4.5h12L20.5 8v2a2 2 0 0 1-2 2H17a2 2 0 0 1-2-2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2 2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2V8Z"
      fill="#291804"
      stroke="#fbbf24"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    {/* Vault Chest Base */}
    <path
      d="M4.5 12v6.5c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V12"
      fill="#171107"
      stroke="#f59e0b"
      strokeWidth="1.5"
    />
    {/* Center Glowing Quantum Core Crystal (Isometric Cube) */}
    {/* Top Face */}
    <path d="M12 11.5l3.2 1.6-3.2 1.6-3.2-1.6L12 11.5Z" fill="#00f7ff" stroke="#ffffff" strokeWidth="0.6" />
    {/* Left Face */}
    <path d="M8.8 13.1v3.4l3.2 1.6v-3.4L8.8 13.1Z" fill="#0284c7" />
    {/* Right Face */}
    <path d="M15.2 13.1v3.4l-3.2 1.6v-3.4l3.2-1.6Z" fill="#0369a1" />
    {/* Core Center Light Spot */}
    <circle cx="12" cy="14.7" r="0.9" fill="#ffffff" />
    {/* Sparkling Shard Bits */}
    <circle cx="6.5" cy="16" r="0.9" fill="#fbbf24" />
    <circle cx="17.5" cy="16" r="0.9" fill="#00f7ff" />
  </svg>
);

/**
 * Custom Leaderboard / Global Ranks Icon:
 * Prestigious Championship Trophy in imperial gold, crowned with an apex crest,
 * and featuring a glowing cyan Breakout star badge.
 */
export const NavRanksIcon: React.FC<IconProps> = ({ active, className = 'w-6 h-6', style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Apex Crown / Tiara Top Crest */}
    <path
      d="M8.5 3.5l1.5 2 2-3 2 3 1.5-2v2.5h-7V3.5Z"
      fill="#fde047"
      stroke="#f59e0b"
      strokeWidth="0.9"
      strokeLinejoin="round"
    />

    {/* Championship Cup Main Vessel */}
    <path
      d="M6 6h12v4.8c0 3.3-2.7 6-6 6s-6-2.7-6-6V6Z"
      fill="#2e1f04"
      stroke="#ffd700"
      strokeWidth="1.6"
    />

    {/* Dual Aero Handles with Cyan Neon Accents */}
    <path
      d="M6 7.5H4a2 2 0 0 0-2 2v1a3 3 0 0 0 3 3h1M18 7.5h2a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-1"
      stroke="#00f7ff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* Engraved Glowing Breakout Star Badge in Cup Center */}
    <polygon
      points="12,8.2 12.9,10.2 15,10.4 13.4,11.8 13.9,13.8 12,12.7 10.1,13.8 10.6,11.8 9,10.4 11.1,10.2"
      fill="#00f7ff"
      stroke="#ffffff"
      strokeWidth="0.6"
    />

    {/* Trophy Stem & Tiered Pedestal Base */}
    <path d="M12 16.8v2.2" stroke="#ffd700" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M7.5 19h9" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M6 21.2h12" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />

    {/* Tier 1, 2, 3 LED Rank Dots on Pedestal */}
    <circle cx="9" cy="21.2" r="0.7" fill="#ffffff" />
    <circle cx="12" cy="21.2" r="0.7" fill="#fde047" />
    <circle cx="15" cy="21.2" r="0.7" fill="#fb923c" />
  </svg>
);

/**
 * Custom Breakout Cyber-Pilot Identity / Profile Icon:
 * Futuristic cyber-helm with wraparound neon magenta-purple visor, targeting telemetry reticle,
 * and illuminated amber side comms ports.
 */
export const CyberPilotIcon: React.FC<IconProps> = ({ active, className = 'w-6 h-6', style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer Armored Cyber-Helm */}
    <path
      d="M12 2.5C7.2 2.5 4.5 6 4.5 11v2.5c0 1.2.6 2.3 1.6 2.9l1.4 3.6c.3.8 1.1 1.5 2 1.5h5c.9 0 1.7-.7 2-1.5l1.4-3.6c1-.6 1.6-1.7 1.6-2.9V11c0-5-2.7-8.5-7.5-8.5Z"
      fill={active ? '#08142c' : '#070d1e'}
      stroke="#00f7ff"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    {/* Crest Antenna / Top Fin */}
    <path
      d="M12 2.5V5.5M10.5 4h3"
      stroke="#38bdf8"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    {/* Panoramic Holographic HUD Visor */}
    <path
      d="M6 10.5h12c.5 0 1 .4 1 1v1c0 .8-.5 1.5-1.3 1.5H6.3c-.8 0-1.3-.7-1.3-1.5v-1c0-.6.5-1 1-1Z"
      fill="url(#pilotVisorGrad)"
      stroke="#e879f9"
      strokeWidth="1.3"
    />
    {/* Visor HUD Telemetry Scanline & Aim Reticle */}
    <line x1="7.5" y1="11.8" x2="16.5" y2="11.8" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" opacity="0.85" />
    <circle cx="12" cy="11.8" r="1.1" fill="#00f7ff" />
    {/* Side Cyber Comms / Ear Pods */}
    <rect x="3.2" y="10.5" width="2" height="4" rx="1" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.8" />
    <rect x="18.8" y="10.5" width="2" height="4" rx="1" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.8" />
    {/* Rebreather Intake Ports on Chin */}
    <line x1="10" y1="17.5" x2="14" y2="17.5" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="12" cy="19.2" r="0.8" fill="#00f7ff" />
    <defs>
      <linearGradient id="pilotVisorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="50%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#00f7ff" />
      </linearGradient>
    </defs>
  </svg>
);

/** Alias for NavProfileIcon */
export const NavProfileIcon = CyberPilotIcon;

/**
 * Custom Breakout System Settings / Quantum Gear Icon:
 * 8-tooth mechanical cyber-gear chassis with glowing central hexagonal reactor core,
 * 4 telemetry crosshair conduits, and neon violet/fuchsia styling.
 */
export const CyberGearIcon: React.FC<IconProps> = ({ active, className = 'w-6 h-6', style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 8-Tooth Cyber Cog Outer Perimeter */}
    <path
      d="M10.2 2.5h3.6l.6 2.3 2 .8 1.9-1.4 2.5 2.5-1.4 1.9.8 2 2.3.6v3.6l-2.3.6-.8 2 1.4 1.9-2.5 2.5-1.9-1.4-2 .8-.6 2.3h-3.6l-.6-2.3-2-.8-1.9 1.4-2.5-2.5 1.4-1.9-.8-2-2.3-.6v-3.6l2.3-.6.8-2-1.4-1.9 2.5-2.5 1.9 1.4 2-.8.6-2.3Z"
      fill={active ? '#180e2f' : '#120b24'}
      stroke="#c084fc"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    {/* Inner Hexagonal Reactor Wall */}
    <path
      d="M12 6.5l4.5 2.6v5.2L12 16.9l-4.5-2.6V9.1L12 6.5Z"
      fill="#2e1065"
      stroke="#e879f9"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    {/* 4 Radial Energy Conduits */}
    <line x1="12" y1="3.5" x2="12" y2="6.5" stroke="#00f7ff" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="12" y1="16.9" x2="12" y2="19.9" stroke="#00f7ff" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="3.5" y1="11.7" x2="7.5" y2="11.7" stroke="#00f7ff" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="16.5" y1="11.7" x2="20.5" y2="11.7" stroke="#00f7ff" strokeWidth="1.2" strokeLinecap="round" />
    {/* Central Pulsing Power Node */}
    <circle cx="12" cy="11.7" r="2.2" fill="#00f7ff" />
    <circle cx="12" cy="11.7" r="1.1" fill="#ffffff" />
  </svg>
);
