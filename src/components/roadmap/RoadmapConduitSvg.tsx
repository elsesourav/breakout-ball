import React, { useMemo } from 'react';
import { RoadmapNode, SVG_WIDTH, TOTAL_HEIGHT } from './types';

interface RoadmapConduitSvgProps {
  nodes: RoadmapNode[];
  pathData: string;
  activePathData?: string;
  currentUnlockedId: number;
}

export const RoadmapConduitSvg: React.FC<RoadmapConduitSvgProps> = ({
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
        {/* Multi-tier Cyber Conduit Gradients */}
        <linearGradient id="laserBeamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#00f7ff" stopOpacity="0.85" />
          <stop offset="30%" stopColor="#818cf8" stopOpacity="0.85" />
          <stop offset="65%" stopColor="#f43f5e" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffd700" stopOpacity="0.95" />
        </linearGradient>

        <linearGradient id="clearedLaserGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        <linearGradient id="conduitBaseGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#080e28" />
          <stop offset="30%" stopColor="#0a1032" />
          <stop offset="65%" stopColor="#120c24" />
          <stop offset="100%" stopColor="#1a1408" />
        </linearGradient>

        {/* Futuristic Sci-Fi Hexagonal Honeycomb Matrix */}
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
        {/* Scoped CSS for Dynamic Perspective Stroke Width Scaling */}
        <style>{`
          .roadmap-conduit-segment .conduit-chassis      { stroke-width: calc(18px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-groove       { stroke-width: calc(12px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-glow-emerald { stroke-width: calc(20px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-laser-emerald{ stroke-width: calc(3.5px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-core-white   { stroke-width: calc(1.5px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-dash-emerald { stroke-width: calc(2.5px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-glow-cyan    { stroke-width: calc(16px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-laser-cyan   { stroke-width: calc(3px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-core-cyan    { stroke-width: calc(1.2px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-dash-red     { stroke-width: calc(2px * var(--stroke-factor, 1)); }
          .roadmap-conduit-segment .conduit-future-dash  { stroke-width: calc(2px * var(--stroke-factor, 1)); }
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
        Individual Conduit Path Segments:
        Each segment is individually foreshortened and scaled in tick() so that
        the top path becomes thin (small) and vertically compressed (short),
        matching true 3D road perspective foreshortening while keeping 100% exact node alignment.
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
          {/* Outer track chassis */}
          <path
            d={seg.fullPath}
            fill="none"
            stroke="url(#conduitBaseGrad)"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="conduit-chassis"
          />
          {/* Inner track groove */}
          <path
            d={seg.fullPath}
            fill="none"
            stroke="#040714"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="conduit-groove"
          />

          {/* Cleared Route: Energized laser conduit */}
          {seg.isCleared && (
            <>
              <path
                d={seg.fullPath}
                fill="none"
                stroke="#10b981"
                strokeLinecap="round"
                opacity="0.22"
                className="conduit-glow-emerald"
              />
              <path
                d={seg.fullPath}
                fill="none"
                stroke="#34d399"
                strokeLinecap="round"
                opacity="0.9"
                className="conduit-laser-emerald"
              />
              <path
                d={seg.fullPath}
                fill="none"
                stroke="#ffffff"
                strokeLinecap="round"
                opacity="0.8"
                className="conduit-core-white"
              />
              <path
                d={seg.fullPath}
                fill="none"
                stroke="#a7f3d0"
                strokeLinecap="round"
                strokeDasharray="6 8"
                className="animate-energy-flow conduit-dash-emerald"
                opacity="0.9"
              />
            </>
          )}

          {/* Current Active Route: Energy flows into blocker clamp */}
          {seg.isCurrentRoute && (
            <>
              <path
                d={seg.toBlockerPath}
                fill="none"
                stroke="#00f7ff"
                strokeLinecap="round"
                opacity="0.25"
                className="conduit-glow-cyan"
              />
              <path
                d={seg.toBlockerPath}
                fill="none"
                stroke="#00f7ff"
                strokeLinecap="round"
                className="conduit-laser-cyan"
              />
              <path
                d={seg.toBlockerPath}
                fill="none"
                stroke="#ffffff"
                strokeLinecap="round"
                className="conduit-core-cyan"
              />
              <path
                d={seg.fromBlockerPath}
                fill="none"
                stroke="#ff0844"
                strokeDasharray="4 6"
                strokeLinecap="round"
                opacity="0.6"
                className="conduit-dash-red"
              />
            </>
          )}

          {/* Future Locked Route: Dim mechanical guide track */}
          {seg.isFutureRoute && (
            <path
              d={seg.fullPath}
              fill="none"
              stroke="rgba(100, 116, 139, 0.25)"
              strokeDasharray="3 6"
              strokeLinecap="round"
              className="conduit-future-dash"
            />
          )}
        </g>
      ))}
    </svg>
  );
};
