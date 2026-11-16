import React from 'react';
import { RouteBlocker, SVG_WIDTH } from './types';

interface RoadmapRouteBlockersProps {
  routeBlockers?: RouteBlocker[];
  onBlockerClick?: (blocker: RouteBlocker) => void;
}

interface BlockerTheme {
  primary: string;
  secondary: string;
  glow: string;
  beamGlow: string;
  diode: string;
}

const BLOCKER_THEMES: Record<number, BlockerTheme> = {
  1: {
    primary: '#00f7ff',
    secondary: '#0284c7',
    glow: 'rgba(0, 247, 255, 0.75)',
    beamGlow: 'rgba(0, 247, 255, 0.45)',
    diode: '#00f7ff',
  },
  2: {
    primary: '#818cf8',
    secondary: '#4f46e5',
    glow: 'rgba(129, 140, 248, 0.75)',
    beamGlow: 'rgba(129, 140, 248, 0.45)',
    diode: '#818cf8',
  },
  3: {
    primary: '#c084fc',
    secondary: '#9333ea',
    glow: 'rgba(192, 132, 252, 0.75)',
    beamGlow: 'rgba(192, 132, 252, 0.45)',
    diode: '#c084fc',
  },
  4: {
    primary: '#f43f5e',
    secondary: '#e11d48',
    glow: 'rgba(244, 63, 94, 0.75)',
    beamGlow: 'rgba(244, 63, 94, 0.45)',
    diode: '#f43f5e',
  },
  5: {
    primary: '#ffd700',
    secondary: '#d97706',
    glow: 'rgba(255, 215, 0, 0.85)',
    beamGlow: 'rgba(255, 215, 0, 0.50)',
    diode: '#ffd700',
  },
};

export const RoadmapRouteBlockers: React.FC<RoadmapRouteBlockersProps> = ({
  routeBlockers = [],
  onBlockerClick,
}) => {
  return (
    <>
      {routeBlockers.map((b) => {
        if (b.isCleared) return null;
        const sectorId = b.sector || 1;
        const theme = BLOCKER_THEMES[sectorId] || BLOCKER_THEMES[1];

        if (b.isActive) {
          return (
            <div
              key={b.id}
              onClick={() => onBlockerClick?.(b)}
              className="roadmap-scale-item absolute z-20 select-none cursor-pointer active:scale-95 transition-transform"
              data-base-transform="translate(-50%, -50%)"
              data-y={b.y}
              style={{
                left: `${(b.x / SVG_WIDTH) * 100}%`,
                top: `${b.y}px`,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform, opacity',
              }}
              title="Route Blocked: Complete previous level to shatter this barrier"
            >
              <svg
                width="66"
                height="34"
                viewBox="0 0 66 34"
                className="overflow-visible select-none"
                style={{ filter: `drop-shadow(0 0 14px ${theme.glow})` }}
              >
                <defs>
                  <linearGradient id={`clampGrad-${b.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2a3547" />
                    <stop offset="50%" stopColor="#151d2a" />
                    <stop offset="100%" stopColor="#080c14" />
                  </linearGradient>

                  <linearGradient id={`laserBeam-${b.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={theme.primary} stopOpacity="0.2" />
                    <stop offset="25%" stopColor={theme.primary} stopOpacity="1" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="75%" stopColor={theme.primary} stopOpacity="1" />
                    <stop offset="100%" stopColor={theme.primary} stopOpacity="0.2" />
                  </linearGradient>

                  <radialGradient id={`coreGlow-${b.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor={theme.primary} />
                    <stop offset="80%" stopColor={theme.secondary} />
                    <stop offset="100%" stopColor="#080c14" />
                  </radialGradient>
                </defs>

                <rect
                  x="8"
                  y="13"
                  width="50"
                  height="8"
                  rx="4"
                  fill={`url(#clampGrad-${b.id})`}
                  stroke={theme.primary}
                  strokeWidth="1.5"
                />

                {sectorId === 5 ? (
                  <path d="M 3 8 L 13 5 L 15 29 L 3 26 Z" fill="#131006" stroke={theme.primary} strokeWidth="1.5" />
                ) : sectorId === 4 ? (
                  <path d="M 3 17 L 7 5 L 15 5 L 15 29 L 7 29 Z" fill="#18070b" stroke={theme.primary} strokeWidth="1.5" />
                ) : sectorId === 3 ? (
                  <rect x="4" y="6" width="11" height="22" rx="5.5" fill="#12061c" stroke={theme.primary} strokeWidth="1.5" />
                ) : (
                  <rect x="4" y="7" width="11" height="20" rx="3" fill="#0a0f1d" stroke={theme.primary} strokeWidth="1.5" />
                )}
                <circle cx="9.5" cy="12" r="1.6" fill={theme.primary} />
                <circle cx="9.5" cy="22" r="1.6" fill={theme.primary} />

                {sectorId === 5 ? (
                  <path d="M 63 8 L 53 5 L 51 29 L 63 26 Z" fill="#131006" stroke={theme.primary} strokeWidth="1.5" />
                ) : sectorId === 4 ? (
                  <path d="M 63 17 L 59 5 L 51 5 L 51 29 L 59 29 Z" fill="#18070b" stroke={theme.primary} strokeWidth="1.5" />
                ) : sectorId === 3 ? (
                  <rect x="51" y="6" width="11" height="22" rx="5.5" fill="#12061c" stroke={theme.primary} strokeWidth="1.5" />
                ) : (
                  <rect x="51" y="7" width="11" height="20" rx="3" fill="#0a0f1d" stroke={theme.primary} strokeWidth="1.5" />
                )}
                <circle cx="56.5" cy="12" r="1.6" fill={theme.primary} />
                <circle cx="56.5" cy="22" r="1.6" fill={theme.primary} />

                <line x1="13" y1="17" x2="53" y2="17" stroke={`url(#laserBeam-${b.id})`} strokeWidth="3.5" strokeLinecap="round" />
                <line x1="17" y1="17" x2="49" y2="17" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

                <circle
                  cx="33"
                  cy="17"
                  r="9.5"
                  fill={`url(#coreGlow-${b.id})`}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
                <path d="M 30.5 15.5 A 2.5 2.5 0 0 1 35.5 15.5 V 17 H 30.5 Z M 29.5 17 H 36.5 V 20 H 29.5 Z" fill="#ffffff" />
                <circle cx="33" cy="18.2" r="0.8" fill={theme.secondary} />
              </svg>
            </div>
          );
        }

        return (
          <div
            key={b.id}
            className="roadmap-scale-item absolute z-10 select-none pointer-events-none opacity-60"
            data-base-transform="translate(-50%, -50%)"
            data-y={b.y}
            style={{
              left: `${(b.x / SVG_WIDTH) * 100}%`,
              top: `${b.y}px`,
              transform: 'translate(-50%, -50%)',
              willChange: 'transform, opacity',
            }}
          >
            <svg width="46" height="24" viewBox="0 0 46 24" className="overflow-visible select-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              <rect x="6" y="9" width="34" height="6" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
              <rect x="3" y="5" width="7" height="14" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <rect x="36" y="5" width="7" height="14" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <circle cx="23" cy="12" r="6" fill="#0b0f1d" stroke="#475569" strokeWidth="1.2" />
              <circle cx="23" cy="12" r="2" fill={theme.diode} opacity="0.6" />
            </svg>
          </div>
        );
      })}
    </>
  );
};
