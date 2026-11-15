import React from 'react';

interface CyberTrophyIconProps {
  size?: number;
  className?: string;
}

export const CyberTrophyIcon: React.FC<CyberTrophyIconProps> = ({
  size = 20,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none flex-shrink-0 ${className}`}
    >
      <defs>
        {/* Simple, Clean Metallic Gold Gradients */}
        <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        <linearGradient id="trophyDarkGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>

        <linearGradient id="trophyBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Left Handle */}
      <path
        d="M6.5 5H4C2.9 5 2 5.9 2 7C2 9.8 4.2 11.5 6.5 11.8"
        stroke="url(#trophyGold)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Right Handle */}
      <path
        d="M17.5 5H20C21.1 5 22 5.9 22 7C22 9.8 19.8 11.5 17.5 11.8"
        stroke="url(#trophyGold)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Cup Body */}
      <path
        d="M6 3.5H18V9.5C18 12.8 15.3 15.5 12 15.5C8.7 15.5 6 12.8 6 9.5V3.5Z"
        fill="url(#trophyGold)"
      />

      {/* Top Rim */}
      <rect
        x="5.5"
        y="2.5"
        width="13"
        height="1.6"
        rx="0.8"
        fill="#fef9c3"
      />

      {/* Center Star Badge */}
      <path
        d="M12 6.2L12.7 7.7L14.3 7.9L13.1 9.1L13.4 10.7L12 9.9L10.6 10.7L10.9 9.1L9.7 7.9L11.3 7.7L12 6.2Z"
        fill="#ffffff"
        opacity="0.95"
      />

      {/* Stem */}
      <rect
        x="10.5"
        y="15.5"
        width="3"
        height="2.5"
        fill="url(#trophyDarkGold)"
      />

      {/* Base Tier 1 */}
      <path
        d="M8.5 18H15.5L16 19.5H8L8.5 18Z"
        fill="url(#trophyDarkGold)"
      />

      {/* Base Block Tier 2 */}
      <rect
        x="7"
        y="19.5"
        width="10"
        height="2.5"
        rx="0.6"
        fill="url(#trophyBase)"
        stroke="#ca8a04"
        strokeWidth="0.8"
      />
    </svg>
  );
};
