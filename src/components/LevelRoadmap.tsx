import React, { useEffect, useRef, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { LevelData } from '../types/game';
import { Lock, Play, Trophy, Sparkles, Check } from 'lucide-react';

interface RoadmapNode {
  id: number;
  x: number;
  y: number;
  zone: number;
  zoneName?: string;
}

const TOTAL_LEVELS = 20;
const SPACING = 125;
const SVG_WIDTH = 360;
const BOTTOM_OFFSET = 150;
const TOP_OFFSET = 140;
const TOTAL_HEIGHT = (TOTAL_LEVELS - 1) * SPACING + BOTTOM_OFFSET + TOP_OFFSET;

export const LevelRoadmap: React.FC = () => {
  const { localLevels, localProgress, openPreview } = useGame();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeNodeRef = useRef<HTMLDivElement | null>(null);

  // Compute winding road coordinates along a serpentine S-curve wave
  const nodes: RoadmapNode[] = useMemo(() => {
    const list: RoadmapNode[] = [];
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      // Y ascends from bottom (Level 1) to top (Level 20)
      const y = TOTAL_HEIGHT - BOTTOM_OFFSET - (i - 1) * SPACING;
      // Oscillate horizontally between x = 85 and x = 275
      const angle = (i - 1) * 1.02;
      const x = 180 + Math.sin(angle) * 94;

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
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 120);

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
      className="relative w-full h-full overflow-y-auto overflow-x-hidden select-none bg-gradient-to-b from-[#050614] via-[#090d24] to-[#040510]"
      style={{
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '90px',
        color: '#ffffff',
      }}
    >
      {/* Container sizing matches total SVG road height */}
      <div
        className="relative mx-auto"
        style={{
          width: '100%',
          maxWidth: '440px',
          height: `${TOTAL_HEIGHT}px`,
        }}
      >
        {/* Curving Highway Track SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${SVG_WIDTH} ${TOTAL_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="roadGlow" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#00f7ff" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#b773ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffd700" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="roadBase" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0b0f26" />
              <stop offset="50%" stopColor="#12183d" />
              <stop offset="100%" stopColor="#1e0e38" />
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
            strokeWidth="38"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
            filter="url(#neonBlur)"
          />

          {/* 2. Main Road Surface */}
          <path
            d={roadPathData}
            fill="none"
            stroke="url(#roadBase)"
            strokeWidth="30"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3. Outer Neon Guard Rails */}
          <path
            d={roadPathData}
            fill="none"
            stroke="url(#roadGlow)"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
          <path
            d={roadPathData}
            fill="none"
            stroke="url(#roadBase)"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 4. Center Dashed Energy Track */}
          <path
            d={roadPathData}
            fill="none"
            stroke="#00f7ff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="7 9"
            opacity="0.85"
          />
        </svg>

        {/* Decorative Scenery & Waypoints */}
        {nodes.map((node) => {
          return (
            <React.Fragment key={`decor-${node.id}`}>
              {/* Zone Threshold Banner */}
              {node.zoneName && (
                <div
                  className="absolute z-10 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-sans pointer-events-none"
                  style={{
                    left: `${(node.x / SVG_WIDTH) * 100}%`,
                    top: node.id === 1 ? `${node.y + 54}px` : `${node.y - 74}px`,
                    backgroundColor: '#0c1232',
                    border: '2px solid #00f7ff',
                    boxShadow: '0 0 16px rgba(0, 247, 255, 0.45)',
                  }}
                >
                  <Sparkles style={{ color: '#00f7ff' }} className="w-3.5 h-3.5" />
                  <span
                    style={{
                      color: '#00f7ff',
                      fontWeight: 900,
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      textShadow: '0 0 8px rgba(0,247,255,0.7)',
                    }}
                  >
                    {node.zoneName}
                  </span>
                </div>
              )}

              {/* Floating Cyber Bricks (decor) */}
              {node.id % 3 === 0 && (
                <div
                  className="absolute z-0 pointer-events-none opacity-45 animate-pulse"
                  style={{
                    left: node.x > 180 ? `${((node.x - 90) / SVG_WIDTH) * 100}%` : `${((node.x + 65) / SVG_WIDTH) * 100}%`,
                    top: `${node.y - 12}px`,
                  }}
                >
                  <div className="w-7 h-3.5 rounded-[4px] bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_10px_#00f7ff]" />
                </div>
              )}
              {node.id % 4 === 0 && (
                <div
                  className="absolute z-0 pointer-events-none opacity-40"
                  style={{
                    left: node.x > 180 ? `${((node.x - 85) / SVG_WIDTH) * 100}%` : `${((node.x + 68) / SVG_WIDTH) * 100}%`,
                    top: `${node.y + 15}px`,
                  }}
                >
                  <div className="w-7 h-3.5 rounded-[4px] bg-gradient-to-r from-pink-500 to-yellow-400 shadow-[0_0_10px_#ff0844]" />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Summit Golden Trophy at Top (Level 20) */}
        <div
          className="absolute z-10 -translate-x-1/2 flex flex-col items-center pointer-events-none"
          style={{
            left: `${(nodes[nodes.length - 1].x / SVG_WIDTH) * 100}%`,
            top: `${nodes[nodes.length - 1].y - 96}px`,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
              border: '2.5px solid #ffd700',
              boxShadow: '0 0 25px #ffd700',
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center animate-bounce"
          >
            <Trophy style={{ color: '#ffd700' }} className="w-7 h-7 drop-shadow-[0_0_8px_#ffd700]" />
          </div>
          <span
            style={{
              color: '#ffd700',
              textShadow: '0 0 10px rgba(255,215,0,0.9), 0 2px 4px #000',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.12em',
            }}
            className="mt-1"
          >
            GRAND APEX
          </span>
        </div>

        {/* Level Interactive Nodes (Locked and Unlocked only, NO stars as requested) */}
        {nodes.map((node) => {
          const progress = localProgress[String(node.id)];
          const isUnlocked = progress !== undefined;
          const isComplete = progress?.completed;
          const isCurrent = node.id === currentUnlockedId && !isComplete;

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
              {/* Floating "PLAY" beacon above active current level */}
              {isCurrent && (
                <div
                  style={{
                    backgroundColor: '#00f7ff',
                    color: '#000000',
                    boxShadow: '0 0 16px #00f7ff',
                    top: '-36px',
                  }}
                  className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full font-black text-xs tracking-wider animate-bounce whitespace-nowrap z-30"
                >
                  <Play style={{ fill: '#000000', color: '#000000' }} className="w-3.5 h-3.5" />
                  <span style={{ color: '#000000', fontWeight: 900 }}>PLAY</span>
                </div>
              )}

              {/* Node Button (Solid 58px x 58px Capsule) */}
              <button
                type="button"
                onClick={() => handleLevelClick(node.id)}
                disabled={!isUnlocked}
                aria-label={`Level ${node.id} ${isUnlocked ? (isComplete ? 'Completed' : 'Unlocked') : 'Locked'}`}
                style={{
                  width: '58px',
                  height: '58px',
                  backgroundColor: isUnlocked
                    ? isComplete
                      ? '#062030'
                      : isCurrent
                      ? '#140a33'
                      : '#0a102c'
                    : '#0c1026',
                  borderColor: isUnlocked
                    ? isComplete
                      ? '#10b981'
                      : isCurrent
                      ? '#00f7ff'
                      : '#00f7ff'
                    : '#475569',
                  boxShadow: isUnlocked
                    ? isCurrent
                      ? '0 0 24px #00f7ff, 0 0 10px rgba(0,247,255,0.6)'
                      : isComplete
                      ? '0 0 18px rgba(16,185,129,0.5)'
                      : '0 4px 15px rgba(0,0,0,0.6)'
                    : '0 4px 10px rgba(0,0,0,0.5)',
                }}
                className={`relative group rounded-2xl flex flex-col items-center justify-center transition-all duration-200 outline-none select-none cursor-pointer border-[2.5px] ${
                  isUnlocked
                    ? isCurrent
                      ? 'scale-105 animate-pulse'
                      : 'hover:scale-105 active:scale-95'
                    : 'cursor-not-allowed opacity-90'
                }`}
              >
                {/* Node Centerpiece */}
                {isUnlocked ? (
                  <div className="flex flex-col items-center justify-center">
                    {/* Big, Crisp, High-Contrast Level Number */}
                    <span
                      style={{
                        color: isComplete ? '#34d399' : '#00f7ff',
                        textShadow: isComplete
                          ? '0 0 10px rgba(52,211,153,0.8), 0 2px 4px #000'
                          : '0 0 12px rgba(0,247,255,0.9), 0 2px 4px #000',
                        fontSize: '22px',
                        fontWeight: 900,
                        fontFamily: 'monospace',
                        lineHeight: 1,
                      }}
                    >
                      {node.id}
                    </span>

                    {/* Completion Checkmark Badge */}
                    {isComplete && (
                      <div
                        style={{
                          backgroundColor: '#10b981',
                          boxShadow: '0 0 8px #34d399',
                        }}
                        className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full flex items-center justify-center"
                      >
                        <Check style={{ color: '#000000' }} className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* High-Contrast Locked State: Clear Silver Lock + Bright Crisp Level Number */
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <Lock style={{ color: '#f1f5f9' }} className="w-4.5 h-4.5 stroke-[2.5] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" />
                    <span
                      style={{
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 900,
                        fontFamily: 'monospace',
                        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                      }}
                    >
                      {node.id}
                    </span>
                  </div>
                )}

                {/* Subtle Inner Glass Bezel */}
                <div className="absolute inset-0.5 rounded-[13px] border border-white/20 pointer-events-none" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
