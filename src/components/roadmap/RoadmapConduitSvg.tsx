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
  pathData,
  activePathData,
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

      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2;

      // Half from current node to blocker
      const toBlockerPath = `M ${curr.x} ${curr.y} C ${curr.x} ${curr.y + dy * 0.5}, ${midX} ${midY - dy * 0.25}, ${midX} ${midY}`;
      // Half from blocker to next locked node
      const fromBlockerPath = `M ${midX} ${midY} C ${midX} ${midY + dy * 0.25}, ${next.x} ${next.y - dy * 0.5}, ${next.x} ${next.y}`;

      return {
        levelId,
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
    <>
      {/* 1. Hardware-Accelerated Cyber Honeycomb Grid & Base Conduit Track */}
      <svg
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        style={{
          height: `${TOTAL_HEIGHT}px`,
          transform: 'translateZ(0)',
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

        {/* Base Structural Conduit Track across all segments */}
        {segments.map((seg) => (
          <g key={`base-track-${seg.levelId}`}>
            {/* Outer track chassis */}
            <path
              d={seg.fullPath}
              fill="none"
              stroke="url(#conduitBaseGrad)"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner track groove */}
            <path
              d={seg.fullPath}
              fill="none"
              stroke="#040714"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}

        {/* Dynamic Route Segments: Cleared (Connected) vs Blocked (Severed) */}
        {segments.map((seg) => {
          if (seg.isCleared) {
            // CLEARED ROUTE: Fully connected, energized laser conduit
            return (
              <g key={`cleared-seg-${seg.levelId}`}>
                {/* Ambient Aura */}
                <path
                  d={seg.fullPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeLinecap="round"
                  opacity="0.22"
                />
                {/* Laser Power Conduit */}
                <path
                  d={seg.fullPath}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                {/* Core White Pulse Line */}
                <path
                  d={seg.fullPath}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </g>
            );
          }

          if (seg.isCurrentRoute) {
            // CURRENT ACTIVE ROUTE: Energy flows to the blocker, halted by firewall!
            return (
              <g key={`current-seg-${seg.levelId}`}>
                {/* Energy Conduit Leading into Blocker */}
                <path
                  d={seg.toBlockerPath}
                  fill="none"
                  stroke="#00f7ff"
                  strokeWidth="16"
                  strokeLinecap="round"
                  opacity="0.25"
                />
                <path
                  d={seg.toBlockerPath}
                  fill="none"
                  stroke="#00f7ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d={seg.toBlockerPath}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />

                {/* Severed / Disconnected Conduit from Blocker to Next Node (Broken Line) */}
                <path
                  d={seg.fromBlockerPath}
                  fill="none"
                  stroke="#ff0844"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </g>
            );
          }

          // FUTURE DORMANT ROUTE: Inactive, disconnected dashed conduit
          return (
            <g key={`dormant-seg-${seg.levelId}`}>
              <path
                d={seg.fullPath}
                fill="none"
                stroke="rgba(100, 116, 139, 0.25)"
                strokeWidth="2"
                strokeDasharray="3 6"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>

      {/* 2. Isolated Hardware-Composited Active Energy Pulse Layer */}
      {activePathData && (
        <svg
          className="absolute top-0 left-0 w-full pointer-events-none z-0"
          style={{
            height: `${TOTAL_HEIGHT}px`,
            transform: 'translateZ(0)',
            willChange: 'transform',
            contain: 'paint layout',
          }}
          viewBox={`0 0 ${SVG_WIDTH} ${TOTAL_HEIGHT}`}
          preserveAspectRatio="none"
        >
          {/* Active Flowing Laser Energy Pulse along cleared paths */}
          <path
            d={activePathData}
            fill="none"
            stroke="#34d399"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="8 8"
            className="animate-energy-flow"
            opacity="0.95"
          />
        </svg>
      )}
    </>
  );
};
