import React from 'react';

interface CyberTrophyIconProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export const CyberTrophyIcon: React.FC<CyberTrophyIconProps> = ({
  size = 26,
  className = '',
  glow = true,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-300 select-none ${className}`}
      style={{
        filter: glow
          ? 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 12px rgba(245, 158, 11, 0.35))'
          : undefined,
      }}
    >
      <defs>
        {/* Main Golden Gradient */}
        <linearGradient id="cyberGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff3a1" />
          <stop offset="35%" stopColor="#ffd700" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Cyber Neon Cyan Core Accent */}
        <linearGradient id="cyberCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="50%" stopColor="#00f7ff" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Pedestal Metallic Gradient */}
        <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Rim Specular Highlight */}
        <linearGradient id="rimHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Left Cyber Wing Handle */}
      <path
        d="M9 7C5.5 7 4 9.5 4 13C4 16.5 6.5 19 9.5 19.5L10 18C7.5 17.5 5.8 15.5 5.8 13C5.8 10.5 7 8.5 9 8.5V7Z"
        fill="url(#cyberGoldGrad)"
      />
      <path
        d="M4.5 11.5L2 10V8L4.8 9.5L4.5 11.5Z"
        fill="#00f7ff"
        opacity="0.85"
      />

      {/* Right Cyber Wing Handle */}
      <path
        d="M23 7C26.5 7 28 9.5 28 13C28 16.5 25.5 19 22.5 19.5L22 18C24.5 17.5 26.2 15.5 26.2 13C26.2 10.5 25 8.5 23 8.5V7Z"
        fill="url(#cyberGoldGrad)"
      />
      <path
        d="M27.5 11.5L30 10V8L27.2 9.5L27.5 11.5Z"
        fill="#00f7ff"
        opacity="0.85"
      />

      {/* Trophy Chalice / Cup Body */}
      <path
        d="M8.5 5.5H23.5L21.8 14.5C21.2 17.8 18.8 20.2 16 20.2C13.2 20.2 10.8 17.8 10.2 14.5L8.5 5.5Z"
        fill="url(#cyberGoldGrad)"
        stroke="#ffd700"
        strokeWidth="0.8"
      />

      {/* Chalice Top Rim */}
      <ellipse
        cx="16"
        cy="5.5"
        rx="7.5"
        ry="1.8"
        fill="url(#rimHighlight)"
        stroke="#ffffff"
        strokeWidth="0.5"
      />

      {/* Chalice Deep Inner Glow */}
      <ellipse
        cx="16"
        cy="5.6"
        rx="6"
        ry="1.2"
        fill="#b45309"
        opacity="0.7"
      />

      {/* Central Cyber Diamond Emblem */}
      <polygon
        points="16,8.5 18.5,12 16,15.5 13.5,12"
        fill="url(#cyberCyanGrad)"
        stroke="#ffffff"
        strokeWidth="0.6"
      />
      {/* Emblem Center Core */}
      <circle cx="16" cy="12" r="1.2" fill="#ffffff" />

      {/* Stem / Neck */}
      <path
        d="M14.2 20H17.8V23.5H14.2V20Z"
        fill="url(#cyberGoldGrad)"
        stroke="#ffd700"
        strokeWidth="0.5"
      />
      <rect x="13.5" y="21.5" width="5" height="1.2" rx="0.6" fill="#00f7ff" opacity="0.9" />

      {/* Pedestal Tier 1 */}
      <path
        d="M12 23.5H20L21 25.5H11L12 23.5Z"
        fill="url(#cyberGoldGrad)"
      />

      {/* Pedestal Tier 2 (Base Block) */}
      <rect
        x="9"
        y="25.5"
        width="14"
        height="4"
        rx="1"
        fill="url(#pedestalGrad)"
        stroke="#00f7ff"
        strokeWidth="0.8"
      />

      {/* Neon Cyber Status Horizon Line on Base */}
      <line
        x1="10"
        y1="27.5"
        x2="22"
        y2="27.5"
        stroke="#00f7ff"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Top Victory Star Specular Shimmer */}
      <path
        d="M16 2.5L16.6 4.2L18.3 4.8L16.6 5.4L16 7.1L15.4 5.4L13.7 4.8L15.4 4.2L16 2.5Z"
        fill="#ffffff"
        opacity="0.9"
      />
    </svg>
  );
};
