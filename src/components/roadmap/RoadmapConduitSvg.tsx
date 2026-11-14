import React from 'react';
import { RoadmapNode, SVG_WIDTH, TOTAL_HEIGHT } from './types';

interface RoadmapConduitSvgProps {
  nodes: RoadmapNode[];
  pathData: string;
  activePathData?: string;
}

export const RoadmapConduitSvg: React.FC<RoadmapConduitSvgProps> = ({
  nodes,
  pathData,
  activePathData,
}) => {
  return (
    <>
      {/* 1. Static Hardware-Accelerated Conduit Base (Zero SVG Filters for 120 FPS Performance) */}
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

          <linearGradient id="conduitBaseGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#080e28" />
            <stop offset="30%" stopColor="#0a1032" />
            <stop offset="65%" stopColor="#120c24" />
            <stop offset="100%" stopColor="#1a1408" />
          </linearGradient>
        </defs>

        {/* Outer Soft Ambient Aura (Multi-pass opacity strokes replace CPU-heavy Gaussian Blur) */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#laserBeamGrad)"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.12"
        />
        <path
          d={pathData}
          fill="none"
          stroke="url(#laserBeamGrad)"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.25"
        />

        {/* Cyber Circuit Conduit Bus Track */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#conduitBaseGrad)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Outer Neon Guard Rail Edges */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#laserBeamGrad)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <path
          d={pathData}
          fill="none"
          stroke="url(#conduitBaseGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner Dormant Guide Line */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(0, 247, 255, 0.22)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 6"
        />

        {/* Deflection Junction Points between levels */}
        {nodes.map((n, idx) => {
          if (idx === nodes.length - 1) return null;
          const nextNode = nodes[idx + 1];
          const midX = (n.x + nextNode.x) / 2;
          const midY = (n.y + nextNode.y) / 2;
          return (
            <g key={`junction-${n.id}`}>
              <circle cx={midX} cy={midY} r="3" fill="#00f7ff" opacity="0.6" />
              <circle cx={midX} cy={midY} r="1.5" fill="#ffffff" />
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
          {/* Active Flowing Laser Energy Pulse */}
          <path
            d={activePathData}
            fill="none"
            stroke="#00f7ff"
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
