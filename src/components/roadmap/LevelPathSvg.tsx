import React, { useMemo } from 'react';
import { RoadmapNode, SVG_WIDTH, TOTAL_HEIGHT } from './types';

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
        contain: 'paint layout',
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
            stroke="rgba(0, 247, 255, 0.05)"
            strokeWidth="1"
          />
        </pattern>

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

      {/* Hexagonal Cyber Honeycomb Matrix Base */}
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
        Perspective scaling ensures the trajectory shrinks into the 3D horizon while remaining
        100% gapless and centered on every node.
      */}
      {segments.map((seg) => (
        <g
          key={`conduit-seg-${seg.levelId}`}
          className="roadmap-conduit-segment"
          data-curr-y={seg.currY}
          data-next-y={seg.nextY}
          data-mid-x={seg.midX}
          data-mid-y={seg.midY}
          style={{ willChange: 'transform, opacity' }}
        >
          {/* 1. Ambient Trajectory Optical Aura (Soft Laser Glow) */}
          <path
            d={seg.fullPath}
            fill="none"
            stroke="url(#ballAuraGrad)"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="path-aura"
          />

          {/* 2. Cyber Laser Optical Containment Rail */}
          <path
            d={seg.fullPath}
            fill="none"
            stroke="url(#ballTrajectoryGrad)"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
            className="path-guide-rail"
          />

          {/* 3. Central Kinetic Vector Beam Line */}
          <path
            d={seg.fullPath}
            fill="none"
            stroke="url(#ballTrajectoryGrad)"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
            className="path-vector-line"
          />

          {/* 4. Base Breakout Aiming Guide Beads (Spaced Energy Balls) */}
          <path
            d={seg.fullPath}
            fill="none"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeDasharray="0 22"
            opacity="0.4"
            className="path-ball-beads animate-breakout-ball-flow"
          />

          {/* ── Cleared Route: Radiant Emerald Trajectory & Energized Balls ── */}
          {seg.isCleared && (
            <>
              {/* Outer Emerald Laser Aura */}
              <path
                d={seg.fullPath}
                fill="none"
                stroke="#10b981"
                strokeLinecap="round"
                opacity="0.25"
                className="conduit-glow-emerald"
              />
              {/* High-Tech Laser Beam */}
              <path
                d={seg.fullPath}
                fill="none"
                stroke="#34d399"
                strokeLinecap="round"
                opacity="0.95"
                className="conduit-laser-emerald"
              />
              {/* White Photon Core Line */}
              <path
                d={seg.fullPath}
                fill="none"
                stroke="#ffffff"
                strokeLinecap="round"
                opacity="0.85"
                className="conduit-core-white"
              />
              {/* Animated Breakout Energy Balls streaming through cleared path */}
              <path
                d={seg.fullPath}
                fill="none"
                stroke="#a7f3d0"
                strokeLinecap="round"
                strokeDasharray="0 18"
                className="animate-breakout-ball-fast conduit-balls-emerald"
                opacity="0.95"
              />
            </>
          )}

          {/* ── Current Active Route: Electric Cyan Ricochet Path to Gate ── */}
          {seg.isCurrentRoute && (
            <>
              {/* Electric Cyan Laser Bloom */}
              <path
                d={seg.toBlockerPath}
                fill="none"
                stroke="#00f7ff"
                strokeLinecap="round"
                opacity="0.30"
                className="conduit-glow-cyan"
              />
              {/* High-Voltage Cyan Beam */}
              <path
                d={seg.toBlockerPath}
                fill="none"
                stroke="#00f7ff"
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
              {/* Animated Breakout Energy Ball Beads surging toward the active blocker */}
              <path
                d={seg.toBlockerPath}
                fill="none"
                stroke="#ffffff"
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
                opacity="0.75"
                className="conduit-aim-red"
              />
            </>
          )}

          {/* ── Future Locked Route: Holographic Breakout Aiming Line ── */}
          {seg.isFutureRoute && (
            <path
              d={seg.fullPath}
              fill="none"
              stroke="rgba(129, 140, 248, 0.35)"
              strokeDasharray="2 8"
              strokeLinecap="round"
              className="conduit-aim-future"
            />
          )}
        </g>
      ))}
    </svg>
  );
};
