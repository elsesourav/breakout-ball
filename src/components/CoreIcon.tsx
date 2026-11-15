import React from 'react';

export interface CoreIconProps {
  size?: number | string;
  className?: string;
  glow?: boolean;
  variant?: 'cyan' | 'gold' | 'purple' | 'emerald' | 'rose' | 'blue' | 'pink';
  style?: React.CSSProperties;
}

const THEMES = {
  cyan: {
    primary: '#00f7ff',
    secondary: '#0088cc',
    glow: 'rgba(0, 247, 255, 0.7)',
    inner: '#e0ffff',
  },
  blue: {
    primary: '#38bdf8',
    secondary: '#2563eb',
    glow: 'rgba(56, 189, 248, 0.7)',
    inner: '#eff6ff',
  },
  gold: {
    primary: '#ffd700',
    secondary: '#f59e0b',
    glow: 'rgba(255, 215, 0, 0.7)',
    inner: '#fffbeb',
  },
  purple: {
    primary: '#c084fc',
    secondary: '#7c3aed',
    glow: 'rgba(192, 132, 252, 0.7)',
    inner: '#faf5ff',
  },
  pink: {
    primary: '#f472b6',
    secondary: '#ec4899',
    glow: 'rgba(244, 114, 182, 0.7)',
    inner: '#fdf2f8',
  },
  emerald: {
    primary: '#34d399',
    secondary: '#059669',
    glow: 'rgba(52, 211, 153, 0.7)',
    inner: '#ecfdf5',
  },
  rose: {
    primary: '#f87171',
    secondary: '#dc2626',
    glow: 'rgba(239, 68, 68, 0.7)',
    inner: '#fef2f2',
  },
};

export const CoreIcon: React.FC<CoreIconProps> = ({
  size = 16,
  className = '',
  glow = true,
  variant = 'cyan',
  style,
}) => {
  const theme = THEMES[variant] || THEMES.cyan;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 select-none ${className}`}
      style={{
        filter: glow ? `drop-shadow(0 0 5px ${theme.glow})` : undefined,
        ...style,
      }}
    >
      <defs>
        <linearGradient
          id={`grad-facet-top-${variant}`}
          x1="12"
          y1="2"
          x2="12"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={theme.inner} stopOpacity="0.95" />
          <stop offset="100%" stopColor={theme.primary} stopOpacity="0.4" />
        </linearGradient>
        <linearGradient
          id={`grad-facet-bot-${variant}`}
          x1="12"
          y1="12"
          x2="12"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={theme.primary} stopOpacity="0.4" />
          <stop offset="100%" stopColor={theme.secondary} stopOpacity="0.85" />
        </linearGradient>
        <radialGradient
          id={`grad-flare-${variant}`}
          cx="12"
          cy="12"
          r="6.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="45%" stopColor={theme.primary} stopOpacity="0.9" />
          <stop offset="100%" stopColor={theme.secondary} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Outer Faceted Hex Crystal Shell */}
      <polygon
        points="12,1.8 19.5,7 19.5,17 12,22.2 4.5,17 4.5,7"
        fill={`url(#grad-facet-bot-${variant})`}
        stroke={theme.primary}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* 2. Top Reflective Facets */}
      <polygon
        points="12,1.8 19.5,7 12,10.5 4.5,7"
        fill={`url(#grad-facet-top-${variant})`}
        fillOpacity="0.6"
        stroke={theme.primary}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* 3. Internal Crystal Ribs */}
      <line
        x1="12"
        y1="1.8"
        x2="12"
        y2="22.2"
        stroke={theme.inner}
        strokeWidth="0.8"
        strokeOpacity="0.5"
      />
      <line
        x1="4.5"
        y1="7"
        x2="19.5"
        y2="17"
        stroke={theme.primary}
        strokeWidth="0.6"
        strokeOpacity="0.3"
      />
      <line
        x1="4.5"
        y1="17"
        x2="19.5"
        y2="7"
        stroke={theme.primary}
        strokeWidth="0.6"
        strokeOpacity="0.3"
      />

      {/* 4. Radiant Core Flare (4-point energy star) */}
      <path
        d="M 12 5.5 Q 12 12 18.5 12 Q 12 12 12 18.5 Q 12 12 5.5 12 Q 12 12 12 5.5 Z"
        fill={`url(#grad-flare-${variant})`}
      />

      {/* 5. Pure White Energy Nucleus */}
      <circle cx="12" cy="12" r="2.2" fill="#ffffff" />

      {/* 6. Orbital Micro Power Nodes */}
      <circle cx="12" cy="3.5" r="0.9" fill={theme.inner} />
      <circle cx="12" cy="20.5" r="0.9" fill={theme.inner} />
      <circle cx="6" cy="12" r="0.9" fill={theme.inner} />
      <circle cx="18" cy="12" r="0.9" fill={theme.inner} />
    </svg>
  );
};
