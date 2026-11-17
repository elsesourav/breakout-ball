import React, { useMemo } from 'react';
import { RoadmapNode, SVG_WIDTH, TOTAL_HEIGHT, SPACING, BOTTOM_OFFSET, getSectorIndex } from './types';
export { getSectorIndex };

interface LevelPathSvgProps {
  nodes: RoadmapNode[];
  pathData?: string;
  activePathData?: string;
  currentUnlockedId: number;
}

/**
 * Breakout Ball Kinetic Trajectory Path:
 * Replaces the traditional heavy asphalt road with an electric neon ball ricochet
 * trajectory beam matching the Breakout Ball arcade gameplay. Features glowing
 * photon rails, animated streaming Breakout energy balls, and dynamic perspective
 * scaling that tapers toward the distant horizon.
 */
export interface SectorThemeConfig {
  sector: number;
  name: string;
  glow: string;
  laser: string;
  core: string;
  balls: string;
  aim: string;
}

export const SECTOR_THEMES: Record<number, SectorThemeConfig> = {
  1: {
    sector: 1,
    name: 'NEON ALLEY',
    glow: 'rgba(0, 247, 255, 0.45)',
    laser: '#00f7ff',
    core: '#ffffff',
    balls: '#67e8f9',
    aim: 'rgba(0, 247, 255, 0.45)',
  },
  2: {
    sector: 2,
    name: 'DATA FOUNDRY',
    glow: 'rgba(56, 189, 248, 0.45)',
    laser: '#38bdf8',
    core: '#ffffff',
    balls: '#7dd3fc',
    aim: 'rgba(56, 189, 248, 0.45)',
  },
  3: {
    sector: 3,
    name: 'QUANTUM CORE',
    glow: 'rgba(168, 85, 247, 0.45)',
    laser: '#a855f7',
    core: '#ffffff',
    balls: '#d8b4fe',
    aim: 'rgba(168, 85, 247, 0.45)',
  },
  4: {
    sector: 4,
    name: 'CYBER CITADEL',
    glow: 'rgba(244, 63, 94, 0.45)',
    laser: '#f43f5e',
    core: '#ffffff',
    balls: '#fb7185',
    aim: 'rgba(244, 63, 94, 0.45)',
  },
  5: {
    sector: 5,
    name: 'ORBITAL APEX',
    glow: 'rgba(251, 191, 36, 0.50)',
    laser: '#fbbf24',
    core: '#ffffff',
    balls: '#fde047',
    aim: 'rgba(251, 191, 36, 0.50)',
  },
  6: {
    sector: 6,
    name: 'CHROME SKYLINE',
    glow: 'rgba(45, 212, 191, 0.45)',
    laser: '#2dd4bf',
    core: '#ffffff',
    balls: '#5eead4',
    aim: 'rgba(45, 212, 191, 0.45)',
  },
  7: {
    sector: 7,
    name: 'VOID REACTOR',
    glow: 'rgba(236, 72, 153, 0.45)',
    laser: '#ec4899',
    core: '#ffffff',
    balls: '#f472b6',
    aim: 'rgba(236, 72, 153, 0.45)',
  },
  8: {
    sector: 8,
    name: 'HYPERION GRID',
    glow: 'rgba(99, 102, 241, 0.45)',
    laser: '#6366f1',
    core: '#ffffff',
    balls: '#818cf8',
    aim: 'rgba(99, 102, 241, 0.45)',
  },
  9: {
    sector: 9,
    name: 'SINGULARITY DEPTHS',
    glow: 'rgba(139, 92, 246, 0.45)',
    laser: '#8b5cf6',
    core: '#ffffff',
    balls: '#a78bfa',
    aim: 'rgba(139, 92, 246, 0.45)',
  },
  10: {
    sector: 10,
    name: 'OMEGA THRONE',
    glow: 'rgba(255, 0, 85, 0.55)',
    laser: '#ff0055',
    core: '#ffffff',
    balls: '#ff4d88',
    aim: 'rgba(255, 0, 85, 0.55)',
  },
};

export const LevelPathSvg: React.FC<LevelPathSvgProps> = ({
  nodes,
  currentUnlockedId,
}) => {
  // Compute per-segment paths (cleared connected conduits vs blocked/dormant conduits)
  const segments = useMemo(() => {
    return nodes.slice(0, -1).map((curr, idx) => {
      const next = nodes[idx + 1];
      const levelId = idx + 1;
      const isCleared = levelId < currentUnlockedId;
      const isCurrentRoute = levelId === currentUnlockedId;
      const isFutureRoute = levelId > currentUnlockedId;

      const dy = (next.y - curr.y) * 0.5;
      const fullPath = `M ${curr.x} ${curr.y} C ${curr.x} ${curr.y + dy}, ${next.x} ${next.y - dy}, ${next.x} ${next.y}`;

      const midX = Math.round((curr.x + next.x) / 2);
      const midY = Math.round((curr.y + next.y) / 2);

      // Half from current node to blocker
      const toBlockerPath = `M ${curr.x} ${curr.y} C ${curr.x} ${curr.y + dy * 0.5}, ${midX} ${midY - dy * 0.25}, ${midX} ${midY}`;
      // Half from blocker to next locked node
      const fromBlockerPath = `M ${midX} ${midY} C ${midX} ${midY + dy * 0.25}, ${next.x} ${next.y - dy * 0.5}, ${next.x} ${next.y}`;

      return {
        levelId,
        currY: curr.y,
        nextY: next.y,
        fullPath,
        toBlockerPath,
        fromBlockerPath,
        midX,
        midY,
        isCleared,
        isCurrentRoute,
        isFutureRoute,
      };
    });
  }, [nodes, currentUnlockedId]);

  return (
    <svg
      className="absolute top-0 left-0 w-full pointer-events-none z-0 overflow-visible"
      style={{
        height: `${TOTAL_HEIGHT}px`,
      }}
      viewBox={`0 0 ${SVG_WIDTH} ${TOTAL_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <defs>
        {/* Breakout Neon Trajectory Multi-tier Laser Gradients */}
        <linearGradient id="ballTrajectoryGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#00f7ff" stopOpacity="0.9" />
          <stop offset="25%" stopColor="#818cf8" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#c084fc" stopOpacity="0.9" />
          <stop offset="75%" stopColor="#f43f5e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffd700" stopOpacity="0.95" />
        </linearGradient>

        <linearGradient id="ballAuraGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#00f7ff" stopOpacity="0.18" />
          <stop offset="30%" stopColor="#818cf8" stopOpacity="0.15" />
          <stop offset="65%" stopColor="#f43f5e" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffd700" stopOpacity="0.20" />
        </linearGradient>

        {/* Sector Boundary Transition Gradients (Every 10 levels across 10 sectors) */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => {
          const t1 = SECTOR_THEMES[s] || SECTOR_THEMES[1];
          const t2 = SECTOR_THEMES[s + 1] || SECTOR_THEMES[1];
          return (
            <React.Fragment key={`trans-grad-${s}`}>
              <linearGradient id={`sectorTrans-${s}-${s + 1}`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={t1.laser} />
                <stop offset="100%" stopColor={t2.laser} />
              </linearGradient>
              <linearGradient id={`sectorGlowTrans-${s}-${s + 1}`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={t1.glow} />
                <stop offset="100%" stopColor={t2.glow} />
              </linearGradient>
            </React.Fragment>
          );
        })}

        {/* Futuristic Cyber Honeycomb Grid Matrix */}
        <pattern
          id="cyberHexGrid"
          width="36"
          height="62.35"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 18 0 L 36 10.39 L 36 31.18 L 18 41.57 L 0 31.18 L 0 10.39 Z M 18 62.35 L 36 51.96 L 36 31.18 L 18 41.57 L 0 31.18 L 0 51.96 Z"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        </pattern>

        {/* Continuous 100-Level Sector Atmospheric Progression Gradient */}
        <linearGradient id="sectorContinuousAtmosphere" x1="0%" y1="100%" x2="0%" y2="0%">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s, idx) => {
            const t = SECTOR_THEMES[s] || SECTOR_THEMES[1];
            return (
              <React.Fragment key={`atm-${s}`}>
                <stop offset={`${idx * 10}%`} stopColor={t.laser} stopOpacity={0.12} />
                <stop offset={`${Math.min(100, idx * 10 + 9)}%`} stopColor={t.laser} stopOpacity={0.08} />
              </React.Fragment>
            );
          })}
        </linearGradient>

        {/* Scoped CSS for Breakout Ball Trajectory Animations & Perspective Stroke Scaling */}
        <style>{`
          @keyframes breakoutBallFlow {
            from { stroke-dashoffset: 0; }
            to   { stroke-dashoffset: -44; }
          }
          @keyframes breakoutPulseCore {
            0%, 100% { opacity: 0.75; }
            50%      { opacity: 1; }
          }
          .animate-breakout-ball-flow {
            animation: breakoutBallFlow 2.4s linear infinite;
          }
          .animate-breakout-ball-fast {
            animation: breakoutBallFlow 1.5s linear infinite;
          }
          .roadmap-conduit-segment .path-aura             { stroke-width: calc(14px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .path-guide-rail       { stroke-width: calc(5px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .path-vector-line      { stroke-width: calc(2px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .path-ball-beads       { stroke-width: calc(4px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-glow-emerald  { stroke-width: calc(16px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-laser-emerald { stroke-width: calc(3px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-core-white    { stroke-width: calc(1.4px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-balls-emerald { stroke-width: calc(4.5px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-glow-cyan     { stroke-width: calc(16px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-laser-cyan    { stroke-width: calc(3px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-core-cyan     { stroke-width: calc(1.2px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-balls-cyan    { stroke-width: calc(5px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-aim-red       { stroke-width: calc(2px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-aim-future    { stroke-width: calc(2px * var(--stroke-factor, 1)); }
        `}</style>
      </defs>

      {/* ── Continuous Sector Atmospheric Backdrop & Cyber Hex Grid ── */}
      <rect
        x="0"
        y="0"
        width={SVG_WIDTH}
        height={TOTAL_HEIGHT}
        fill="url(#sectorContinuousAtmosphere)"
      />
      <rect
        x="0"
        y="0"
        width={SVG_WIDTH}
        height={TOTAL_HEIGHT}
        fill="url(#cyberHexGrid)"
        opacity="0.85"
      />

      {/*
        Breakout Ball Kinetic Trajectory Segments:
        Instead of a heavy asphalt road, levels are connected by an authentic Breakout Ball
        aiming vector / laser ricochet beam with glowing energy balls gliding along the path.
        Every 10 levels, the path shifts to that sector's unique glowing energy color!
      */}
      {segments.map((seg) => {
        const sectorId = getSectorIndex(seg.levelId);
        const nextSectorId = getSectorIndex(seg.levelId + 1);
        const isBoundary = sectorId !== nextSectorId;
        const theme = SECTOR_THEMES[sectorId] || SECTOR_THEMES[1];
        const laserStroke = isBoundary ? `url(#sectorTrans-${sectorId}-${nextSectorId})` : theme.laser;
        const glowStroke = isBoundary ? `url(#sectorGlowTrans-${sectorId}-${nextSectorId})` : theme.glow;

        return (
          <g
            key={`conduit-seg-${seg.levelId}`}
            className="roadmap-conduit-segment"
            data-curr-y={seg.currY}
            data-next-y={seg.nextY}
            data-mid-x={seg.midX}
            data-mid-y={seg.midY}
            style={{ willChange: 'transform, opacity' }}
          >
            {/* 1. Ambient Trajectory Optical Aura (Soft Laser Glow in Sector Theme) */}
            <path
              d={seg.fullPath}
              fill="none"
              stroke={glowStroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="path-aura"
              opacity={0.32}
            />

            {/* 2. Cyber Laser Optical Containment Rail */}
            <path
              d={seg.fullPath}
              fill="none"
              stroke={laserStroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.25}
              className="path-guide-rail"
            />

            {/* 3. Central Kinetic Vector Beam Line in Sector Color */}
            <path
              d={seg.fullPath}
              fill="none"
              stroke={laserStroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.7}
              className="path-vector-line"
            />

            {/* 4. Base Breakout Aiming Guide Beads in Sector Energy Hue */}
            <path
              d={seg.fullPath}
              fill="none"
              stroke={theme.balls}
              strokeLinecap="round"
              strokeDasharray="0 22"
              opacity={0.45}
              className="path-ball-beads animate-breakout-ball-flow"
            />

            {/* ── Cleared Route: Radiant Sector Trajectory & Streaming Photon Balls ── */}
            {seg.isCleared && (
              <>
                {/* Outer Sector Laser Aura */}
                <path
                  d={seg.fullPath}
                  fill="none"
                  stroke={glowStroke}
                  strokeLinecap="round"
                  opacity={0.4}
                  className="conduit-glow-emerald"
                />
                {/* High-Tech Laser Beam in Sector Color */}
                <path
                  d={seg.fullPath}
                  fill="none"
                  stroke={laserStroke}
                  strokeLinecap="round"
                  opacity={0.95}
                  className="conduit-laser-emerald"
                />
                {/* White Photon Core Line */}
                <path
                  d={seg.fullPath}
                  fill="none"
                  stroke="#ffffff"
                  strokeLinecap="round"
                  opacity={0.9}
                  className="conduit-core-white"
                />
                {/* Animated Breakout Energy Balls streaming through path in Sector Color */}
                <path
                  d={seg.fullPath}
                  fill="none"
                  stroke={theme.balls}
                  strokeLinecap="round"
                  strokeDasharray="0 18"
                  className="animate-breakout-ball-fast conduit-balls-emerald"
                  opacity={0.95}
                />
              </>
            )}

            {/* ── Current Active Route: Electric Sector Ricochet Path to Gate ── */}
            {seg.isCurrentRoute && (
              <>
                {/* Electric Sector Laser Bloom */}
                <path
                  d={seg.toBlockerPath}
                  fill="none"
                  stroke={glowStroke}
                  strokeLinecap="round"
                  opacity={0.45}
                  className="conduit-glow-cyan"
                />
                {/* High-Voltage Sector Beam */}
                <path
                  d={seg.toBlockerPath}
                  fill="none"
                  stroke={laserStroke}
                  strokeLinecap="round"
                  className="conduit-laser-cyan"
                />
                {/* Pure White Laser Core */}
                <path
                  d={seg.toBlockerPath}
                  fill="none"
                  stroke="#ffffff"
                  strokeLinecap="round"
                  className="conduit-core-cyan"
                />
                {/* Animated Breakout Energy Ball Beads surging in Sector Color */}
                <path
                  d={seg.toBlockerPath}
                  fill="none"
                  stroke={theme.balls}
                  strokeLinecap="round"
                  strokeDasharray="0 16"
                  className="animate-breakout-ball-fast conduit-balls-cyan"
                />
                {/* Blocked Path (Post-Clamp): Red Pulsing Laser Aim Trajectory */}
                <path
                  d={seg.fromBlockerPath}
                  fill="none"
                  stroke="#ff0844"
                  strokeDasharray="3 7"
                  strokeLinecap="round"
                  opacity={0.8}
                  className="conduit-aim-red"
                />
              </>
            )}

            {/* ── Future Locked Route: Holographic Sector Aiming Line ── */}
            {seg.isFutureRoute && (
              <path
                d={seg.fullPath}
                fill="none"
                stroke={theme.aim}
                strokeDasharray="2 8"
                strokeLinecap="round"
                className="conduit-aim-future"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
