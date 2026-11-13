import React, { useEffect, useRef, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { LevelData } from '../types/game';
import { Star, Lock, Play, Trophy, Sparkles } from 'lucide-react';

interface RoadmapNode {
  id: number;
  x: number;
  y: number;
  zone: number;
  zoneName?: string;
}

const TOTAL_LEVELS = 20;
const SPACING = 115;
const SVG_WIDTH = 360;
const BOTTOM_OFFSET = 120;
const TOP_OFFSET = 120;
const TOTAL_HEIGHT = (TOTAL_LEVELS - 1) * SPACING + BOTTOM_OFFSET + TOP_OFFSET;

export const LevelRoadmap: React.FC = () => {
  const { localLevels, localProgress, openPreview } = useGame();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeNodeRef = useRef<HTMLDivElement | null>(null);

  // Compute winding road coordinates along a serpentine wave
  const nodes: RoadmapNode[] = useMemo(() => {
    const list: RoadmapNode[] = [];
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      // Y ascends from bottom (Level 1) to top (Level 20)
      const y = TOTAL_HEIGHT - BOTTOM_OFFSET - (i - 1) * SPACING;
      // Oscillate horizontally between x = 85 and x = 275
      const angle = (i - 1) * 1.02;
      const x = 180 + Math.sin(angle) * 92;

      let zone = 1;
      let zoneName: string | undefined;
      if (i === 1) zoneName = 'ZONE 1 • NEON ALLEY';
      else if (i === 6) { zone = 2; zoneName = 'ZONE 2 • CYBER HIGHWAY'; }
      else if (i === 11) { zone = 3; zoneName = 'ZONE 3 • QUANTUM MATRIX'; }
      else if (i === 16) { zone = 4; zoneName = 'ZONE 4 • COSMIC APEX'; }
      else if (i > 15) zone = 4;
      else if (i > 10) zone = 3;
      else if (i > 5) zone = 2;

      list.push({ id: i, x: Math.round(x), y: Math.round(y), zone, zoneName });
    }
    return list;
  }, []);

  // Compute smooth cubic Bézier SVG path connecting the nodes
  const roadPathData = useMemo(() => {
    if (nodes.length === 0) return '';
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 0; i < nodes.length - 1; i++) {
      const p0 = nodes[i];
      const p1 = nodes[i + 1];
      const cpYOffset = SPACING * 0.5;
      const cp1x = p0.x;
      const cp1y = p0.y - cpYOffset;
      const cp2x = p1.x;
      const cp2y = p1.y + cpYOffset;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [nodes]);

  // Find player's current highest unlocked level
  const currentUnlockedId = useMemo(() => {
    let highest = 1;
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      if (localProgress[String(i)] !== undefined) {
        highest = i;
      }
    }
    return highest;
  }, [localProgress]);

  // Auto-scroll to player's current level on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeNodeRef.current && scrollContainerRef.current) {
        activeNodeRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      } else if (scrollContainerRef.current) {
        // Fallback: scroll to bottom where Level 1 starts
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [currentUnlockedId]);

  const handleLevelClick = (levelNumber: number) => {
    const isUnlocked = localProgress[String(levelNumber)] !== undefined;
    if (!isUnlocked) return;

    let levelData = localLevels.find((l) => l.id === String(levelNumber));
    if (!levelData) {
      levelData = {
        id: String(levelNumber),
        name: `Level ${levelNumber}`,
        creator: 'sourav',
        playCount: 120 + levelNumber * 15,
        blocks: [
          { x: 2, y: 2, h: (levelNumber % 5) + 1 },
          { x: 3, y: 2, h: (levelNumber % 5) + 1 },
          { x: 4, y: 2, h: (levelNumber % 5) + 1 },
          { x: 5, y: 2, h: (levelNumber % 5) + 1 },
          { x: 6, y: 2, h: (levelNumber % 5) + 1 },
          { x: 3, y: 3, h: ((levelNumber + 1) % 5) + 1 },
          { x: 4, y: 3, h: 6 },
          { x: 5, y: 3, h: ((levelNumber + 1) % 5) + 1 },
          { x: 4, y: 4, h: ((levelNumber + 2) % 5) + 1 },
        ],
      };
    }
    openPreview(levelData);
  };

  return (
    <div
      ref={scrollContainerRef}
      className="relative w-full h-full overflow-y-auto overflow-x-hidden select-none bg-gradient-to-b from-[#050610] via-[#090b1c] to-[#04050e]"
      style={{
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 'calc(var(--s) * 2.2)',
      }}
    >
      {/* Container sizing matches the total SVG height */}
      <div
        className="relative mx-auto"
        style={{
          width: '100%',
          maxWidth: '440px',
          height: `${TOTAL_HEIGHT}px`,
        }}
      >
        {/* SVG Curving Highway Track */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${SVG_WIDTH} ${TOTAL_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Cyber Neon Gradient for Road */}
            <linearGradient id="roadGlow" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#00f7ff" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#b773ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffd700" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="roadBase" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0b0f24" />
              <stop offset="50%" stopColor="#111636" />
              <stop offset="100%" stopColor="#1a0b30" />
            </linearGradient>

            <filter id="neonBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Outer Neon Aura Glow */}
          <path
            d={roadPathData}
            fill="none"
            stroke="url(#roadGlow)"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.28"
            filter="url(#neonBlur)"
          />

          {/* 2. Main Road Surface */}
          <path
            d={roadPathData}
            fill="none"
            stroke="url(#roadBase)"
            strokeWidth="28"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3. Outer Neon Guard Rails */}
          <path
            d={roadPathData}
            fill="none"
            stroke="url(#roadGlow)"
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
            strokeDasharray="none"
          />
          <path
            d={roadPathData}
            fill="none"
            stroke="url(#roadBase)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 4. Center Dashed Energy Track */}
          <path
            d={roadPathData}
            fill="none"
            stroke="#00f7ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="7 9"
            opacity="0.8"
          />
        </svg>

        {/* Decorative Scenery & Waypoints along the road */}
        {nodes.map((node) => {
          return (
            <React.Fragment key={`decor-${node.id}`}>
              {/* Zone Threshold Banner */}
              {node.zoneName && (
                <div
                  className="absolute z-10 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0d24]/90 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,247,255,0.25)] text-[10px] font-bold tracking-widest text-cyan-300 font-sans pointer-events-none"
                  style={{
                    left: `${(node.x / SVG_WIDTH) * 100}%`,
                    top: `${node.y - 58}px`,
                  }}
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{node.zoneName}</span>
                </div>
              )}

              {/* Floating Cyber Bricks beside road (decor) */}
              {node.id % 3 === 0 && (
                <div
                  className="absolute z-0 pointer-events-none opacity-40 animate-pulse"
                  style={{
                    left: node.x > 180 ? `${((node.x - 90) / SVG_WIDTH) * 100}%` : `${((node.x + 65) / SVG_WIDTH) * 100}%`,
                    top: `${node.y - 12}px`,
                  }}
                >
                  <div className="w-6 h-3 rounded-[3px] bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_8px_#00f7ff]" />
                </div>
              )}
              {node.id % 4 === 0 && (
                <div
                  className="absolute z-0 pointer-events-none opacity-35"
                  style={{
                    left: node.x > 180 ? `${((node.x - 85) / SVG_WIDTH) * 100}%` : `${((node.x + 68) / SVG_WIDTH) * 100}%`,
                    top: `${node.y + 15}px`,
                  }}
                >
                  <div className="w-6 h-3 rounded-[3px] bg-gradient-to-r from-pink-500 to-yellow-400 shadow-[0_0_8px_#ff0844]" />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Summit Golden Vault at Top (Level 20) */}
        <div
          className="absolute z-10 -translate-x-1/2 flex flex-col items-center pointer-events-none"
          style={{
            left: `${(nodes[nodes.length - 1].x / SVG_WIDTH) * 100}%`,
            top: `${nodes[nodes.length - 1].y - 85}px`,
          }}
        >
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center shadow-[0_0_20px_#ffd700] animate-bounce">
            <Trophy className="w-5 h-5 text-yellow-300" />
          </div>
          <span className="text-[10px] font-black text-yellow-300 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] tracking-wider mt-1">
            GRAND APEX
          </span>
        </div>

        {/* Level Interactive Nodes */}
        {nodes.map((node) => {
          const progress = localProgress[String(node.id)];
          const isUnlocked = progress !== undefined;
          const isComplete = progress?.completed;
          const isCurrent = node.id === currentUnlockedId && !isComplete;

          // Stars count (1-3 stars)
          const starsCount = isComplete
            ? progress?.bestTime && progress.bestTime < 35
              ? 3
              : progress?.bestTime && progress.bestTime < 60
              ? 2
              : 1
            : 0;

          // Left percentage position
          const leftPercent = (node.x / SVG_WIDTH) * 100;

          return (
            <div
              key={node.id}
              ref={isCurrent ? activeNodeRef : undefined}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                left: `${leftPercent}%`,
                top: `${node.y}px`,
              }}
            >
              {/* Floating "PLAY" indicator badge above active level */}
              {isCurrent && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-400 text-black font-black text-[9px] tracking-wider shadow-[0_0_12px_#00f7ff] animate-bounce whitespace-nowrap">
                  <Play className="w-2.5 h-2.5 fill-black" />
                  <span>PLAY</span>
                </div>
              )}

              {/* 3 Stars Container sitting atop the node (matching reference image) */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 z-30 pointer-events-none">
                {[1, 2, 3].map((starIdx) => {
                  const isEarned = starIdx <= starsCount;
                  return (
                    <Star
                      key={starIdx}
                      className={`w-3 h-3 transition-all ${
                        isEarned
                          ? 'fill-yellow-400 text-yellow-300 drop-shadow-[0_0_6px_#ffd700]'
                          : 'fill-slate-800 text-slate-600 opacity-40'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Node Button / Capsule */}
              <button
                type="button"
                onClick={() => handleLevelClick(node.id)}
                disabled={!isUnlocked}
                aria-label={`Level ${node.id} ${isUnlocked ? (isComplete ? 'Completed' : 'Unlocked') : 'Locked'}`}
                className={`relative group w-13 h-13 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 outline-none select-none cursor-pointer ${
                  isUnlocked
                    ? isComplete
                      ? 'bg-gradient-to-b from-[#0a2538] via-[#041a29] to-[#010e17] border-2 border-emerald-400 shadow-[0_4px_15px_rgba(16,185,129,0.35)] hover:scale-110 active:scale-95'
                      : isCurrent
                      ? 'bg-gradient-to-b from-[#180a38] via-[#100629] to-[#080217] border-2 border-cyan-300 shadow-[0_0_20px_#00f7ff] ring-4 ring-cyan-500/30 scale-105 animate-pulse'
                      : 'bg-gradient-to-b from-[#0e122a] to-[#070918] border-2 border-cyan-400/60 shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95'
                    : 'bg-[#0a0c16]/80 border-2 border-slate-700/40 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Node Centerpiece */}
                {isUnlocked ? (
                  <>
                    <span
                      className={`font-black text-sm tracking-wider font-mono ${
                        isComplete
                          ? 'text-emerald-300 drop-shadow-[0_0_6px_#34d399]'
                          : isCurrent
                          ? 'text-cyan-200 drop-shadow-[0_0_8px_#00f7ff]'
                          : 'text-white'
                      }`}
                    >
                      {node.id}
                    </span>
                    {isComplete && progress?.bestTime && (
                      <span className="text-[8px] font-mono text-emerald-400/80 -mt-0.5">
                        {progress.bestTime.toFixed(0)}s
                      </span>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Lock className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
                    <span className="text-[9px] font-mono font-bold text-slate-500">
                      {node.id}
                    </span>
                  </div>
                )}

                {/* Subtle Inner Glass Bezel */}
                <div className="absolute inset-0.5 rounded-[13px] border border-white/10 pointer-events-none" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
