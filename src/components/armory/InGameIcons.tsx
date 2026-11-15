import React from 'react';

// ─── 1. Top Navigation Icons ─────────────────────────────────────

/** Custom Cyber Kinetic Upgrade / Ascension Chevron Icon for UPGRADE Section */
export const UpgradeTabIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 18,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    {/* Upper Tech Level-Up Chevron */}
    <path
      d="M4.5 10.5L12 4L19.5 10.5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Lower Tier Boost Chevron */}
    <path
      d="M4.5 17.5L12 11L19.5 17.5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity="0.75"
    />
    {/* Kinetic Apex Core Crystal */}
    <circle cx="12" cy="7.5" r="1.5" fill="currentColor" />
  </svg>
);

/** Custom Cyber Vault / Shop Icon for SHOP Section */
export const ShopTabIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 18,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
  >
    <path
      d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 6h18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 10a4 4 0 0 1-8 0"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Glowing diamond vault core mark */}
    <polygon points="12,13 14.5,16 12,19 9.5,16" fill="currentColor" />
  </svg>
);

// ─── 2. In-Game Drawn Visual Icons ───────────────────────────────

/** In-Game 3D Cylindrical Paddle Icon */
export const GamePaddleIcon: React.FC<{
  widthRatio?: number;
  className?: string;
  size?: number;
  accentColor?: string;
}> = ({ widthRatio = 1, className = '', size = 32, accentColor = '#06b6d4' }) => {
  // Pad width visually scales based on upgrade ratio
  const padW = Math.min(26, 16 * widthRatio);
  const padX = 14 - padW / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
    >
      <defs>
        <linearGradient id="padBodyGrad" x1="0" y1="9" x2="0" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#59f7ff" />
          <stop offset="30%" stopColor="#0055ff" />
          <stop offset="70%" stopColor="#6700ff" />
          <stop offset="100%" stopColor="#001a40" />
        </linearGradient>
      </defs>

      {/* Thruster exhaust glow */}
      <circle cx={padX} cy="14" r="2.5" fill="#ffaa00" opacity="0.8" />
      <circle cx={padX + padW} cy="14" r="2.5" fill="#ffaa00" opacity="0.8" />

      {/* 3D Paddle body */}
      <rect
        x={padX}
        y="10"
        width={padW}
        height="8"
        rx="4"
        fill="url(#padBodyGrad)"
        stroke="#ffffff"
        strokeWidth="1.2"
      />

      {/* Top specular highlight bar */}
      <rect
        x={padX + 2.5}
        y="11.5"
        width={Math.max(4, padW - 5)}
        height="2"
        rx="1"
        fill="#ffffff"
        fillOpacity="0.75"
      />

      {/* Cyan center reactor slot */}
      <rect
        x={14 - (padW * 0.35) / 2}
        y="13.5"
        width={padW * 0.35}
        height="2.5"
        rx="0.5"
        fill={accentColor}
      />
    </svg>
  );
};

/** In-Game 3D Spherical Neon Ball Icon */
export const GameBallIcon: React.FC<{
  sizeMultiplier?: number;
  className?: string;
  size?: number;
  skin?: string;
}> = ({ sizeMultiplier = 1, className = '', size = 32, skin = 'cyan' }) => {
  const PALETTES: Record<string, { c1: string; c2: string; c3: string; glow: string }> = {
    cyan: { c1: '#ffffff', c2: '#7df9ff', c3: '#00f7ff', glow: '#00f7ff' },
    fire: { c1: '#ffffff', c2: '#ff9900', c3: '#ff0055', glow: '#ff5500' },
    void: { c1: '#ffffff', c2: '#e879f9', c3: '#7c3aed', glow: '#c084fc' },
    matrix: { c1: '#ffffff', c2: '#6ee7b7', c3: '#059669', glow: '#10b981' },
    gold: { c1: '#ffffff', c2: '#fef08a', c3: '#eab308', glow: '#ffd700' },
  };

  const p = PALETTES[skin] || PALETTES.cyan;
  const radius = Math.min(10, 7 * sizeMultiplier);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
    >
      <defs>
        <radialGradient
          id={`ballGrad-${skin}`}
          cx="11"
          cy="11"
          r={radius}
          fx="11"
          fy="11"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={p.c1} />
          <stop offset="35%" stopColor={p.c2} />
          <stop offset="100%" stopColor={p.c3} />
        </radialGradient>
      </defs>

      {/* Outer Glow Halo */}
      <circle cx="14" cy="14" r={radius + 3} fill={p.glow} fillOpacity="0.3" />

      {/* 3D Ball Sphere */}
      <circle
        cx="14"
        cy="14"
        r={radius}
        fill={`url(#ballGrad-${skin})`}
        stroke="#ffffff"
        strokeWidth="1.2"
      />

      {/* Top Specular Glint */}
      <circle cx={14 - radius * 0.3} cy={14 - radius * 0.3} r={radius * 0.22} fill="#ffffff" />
    </svg>
  );
};

/** Exact In-Game Diamond Power-Up Shard Icon */
export const GamePowerShardIcon: React.FC<{
  type: string;
  symbol: string;
  color: string;
  glow?: string;
  size?: number;
  className?: string;
}> = ({ symbol, color, size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
    >
      {/* 1. In-Game Diamond Crystal Shard */}
      <polygon
        points="14,2 25,14 14,26 3,14"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* 2. Inner Reflective Facet */}
      <polygon
        points="14,5 22,14 14,23 6,14"
        fill="#050716"
        fillOpacity="0.45"
      />

      {/* 3. Center White Circular Core */}
      <circle cx="14" cy="14" r="6.2" fill="#ffffff" />

      {/* 4. Exact In-Game Symbol Stamped in Center */}
      <text
        x="14"
        y="14.5"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#050716"
        fontSize="8"
        fontWeight="bold"
        fontFamily="monospace, sans-serif"
      >
        {symbol}
      </text>
    </svg>
  );
};
