import React, { useEffect, useRef, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Lock, Play, Trophy, Sparkles, Check, Zap } from 'lucide-react';

interface SectorInfo {
  number: string;
  name: string;
  subtitle: string;
  color: string;
  accentGlow: string;
}

interface RoadmapNode {
  id: number;
  x: number;
  y: number;
  zone: number;
  sector?: SectorInfo;
}

interface FloatingBrick {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  glow: string;
  rotation: number;
  opacity: number;
}

const TOTAL_LEVELS = 20;
const SPACING = 120;
const SVG_WIDTH = 360;
const BOTTOM_OFFSET = 140;
const TOP_OFFSET = 150;
const TOTAL_HEIGHT = (TOTAL_LEVELS - 1) * SPACING + BOTTOM_OFFSET + TOP_OFFSET;

const SECTOR_CONFIG: Record<number, SectorInfo> = {
  1: {
    number: '01',
    name: 'NEON ALLEY',
    subtitle: 'CLASSIC ENERGY MATRIX',
    color: '#00f7ff',
    accentGlow: 'rgba(0, 247, 255, 0.45)',
  },
  6: {
    number: '02',
    name: 'PULSE GRID',
    subtitle: 'SYNTHWAVE MULTI-STRIKE',
    color: '#818cf8',
    accentGlow: 'rgba(129, 140, 248, 0.45)',
  },
  11: {
    number: '03',
    name: 'QUANTUM VOID',
    subtitle: 'HARDENED SHIFTING SHARDS',
    color: '#f43f5e',
    accentGlow: 'rgba(244, 63, 94, 0.45)',
  },
  16: {
    number: '04',
    name: 'HYPER CORE',
    subtitle: 'APEX OVERDRIVE REACTOR',
    color: '#ffd700',
    accentGlow: 'rgba(255, 215, 0, 0.5)',
  },
};

export const LevelRoadmap: React.FC = () => {
  const { localLevels, localProgress, openPreview } = useGame();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeNodeRef = useRef<HTMLDivElement | null>(null);
  const hasInitialScrolled = useRef<boolean>(false);

  // Compute energy conduit nodes along an arcade ricochet path
  const nodes: RoadmapNode[] = useMemo(() => {
    const list: RoadmapNode[] = [];
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      // Y ascends from bottom (Level 1) to top (Level 20)
      const y = TOTAL_HEIGHT - BOTTOM_OFFSET - (i - 1) * SPACING;
      // Kinetic ricochet wave oscillating between x = 85 and x = 275
      const angle = (i - 1) * 1.05;
      const x = 180 + Math.sin(angle) * 92;

      let zone = 1;
      if (i > 15) zone = 4;
      else if (i > 10) zone = 3;
      else if (i > 5) zone = 2;

      const sector = SECTOR_CONFIG[i];

      list.push({
        id: i,
        x: Math.round(x),
        y: Math.round(y),
        zone,
        sector,
      });
    }
    return list;
  }, []);

  // Ambient floating Breakout Bricks in background (theme aligned)
  const floatingBricks: FloatingBrick[] = useMemo(() => {
    const bricks: FloatingBrick[] = [];
    const brickColors = [
      { color: '#00f7ff', glow: 'rgba(0, 247, 255, 0.6)' },
      { color: '#818cf8', glow: 'rgba(129, 140, 248, 0.6)' },
      { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)' },
      { color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' },
      { color: '#ffd700', glow: 'rgba(255, 215, 0, 0.6)' },
    ];

    for (let i = 0; i < 18; i++) {
      const palette = brickColors[i % brickColors.length];
      const y = (TOTAL_HEIGHT / 18) * i + ((i * 37) % 50);
      const isLeft = i % 2 === 0;
      const x = isLeft ? 35 + ((i * 23) % 45) : 325 - ((i * 29) % 45);

      bricks.push({
        id: i,
        x,
        y,
        w: 32 + ((i * 7) % 18),
        h: 14,
        color: palette.color,
        glow: palette.glow,
        rotation: ((i * 17) % 30) - 15,
        opacity: 0.35 + ((i * 3) % 4) * 0.1,
      });
    }
    return bricks;
  }, []);

  // Find player's current active unlocked level
  const currentUnlockedId = useMemo(() => {
    let highest = 1;
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      if (localProgress[String(i)] !== undefined) {
        highest = i;
      }
    }
    return highest;
  }, [localProgress]);

  // Compute smooth high-tech laser conduit path
  const conduitPathData = useMemo(() => {
    if (nodes.length === 0) return '';
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 0; i < nodes.length - 1; i++) {
      const p0 = nodes[i];
      const p1 = nodes[i + 1];
      const cpYOffset = SPACING * 0.48;
      const cp1x = p0.x;
      const cp1y = p0.y - cpYOffset;
      const cp2x = p1.x;
      const cp2y = p1.y + cpYOffset;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [nodes]);

  // FIXED SCROLL: On first load, immediately center viewport on current active level
  // WITHOUT any erratic top-to-bottom sweep or jump
  useEffect(() => {
    if (hasInitialScrolled.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const activeNode = nodes.find((n) => n.id === currentUnlockedId) || nodes[0];
    if (activeNode) {
      const containerHeight = container.clientHeight || 560;
      const targetScrollTop = Math.max(0, activeNode.y - containerHeight / 2);
      // Immediately set scrollTop without sweeping from top to bottom
      container.scrollTop = targetScrollTop;
      hasInitialScrolled.current = true;
    }
  }, [currentUnlockedId, nodes]);

  const handleLevelClick = (levelNumber: number) => {
    const isUnlocked = localProgress[String(levelNumber)] !== undefined;
    if (!isUnlocked) return;

    let levelData = localLevels.find((l) => l.id === String(levelNumber));
    if (!levelData) {
      levelData = {
        id: String(levelNumber),
        name: `Sector ${Math.ceil(levelNumber / 5)} - Core ${levelNumber}`,
        creator: 'sourav',
        playCount: 150 + levelNumber * 20,
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
      className="relative w-full h-full overflow-y-auto overflow-x-hidden select-none cyber-grid-bg"
      style={{
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '90px',
        color: '#ffffff',
      }}
    >
      {/* Background Cyber Bricks (Breakout Ball Vibe) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingBricks.map((b) => (
          <div
            key={`brick-${b.id}`}
            style={{
              position: 'absolute',
              left: `${b.x}px`,
              top: `${b.y}px`,
              width: `${b.w}px`,
              height: `${b.h}px`,
              backgroundColor: b.color,
              borderRadius: '3px',
              opacity: b.opacity,
              boxShadow: `0 0 12px ${b.glow}, inset 0 1px 1px rgba(255,255,255,0.4)`,
              transform: `rotate(${b.rotation}deg)`,
              border: `1px solid ${b.color}`,
            }}
          />
        ))}
      </div>

      {/* Main Container Sizing */}
      <div
        className="relative mx-auto"
        style={{
          width: '100%',
          maxWidth: '440px',
          height: `${TOTAL_HEIGHT}px`,
        }}
      >
        {/* High-Tech Laser Energy Track SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${SVG_WIDTH} ${TOTAL_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="laserBeamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#00f7ff" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#818cf8" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#f43f5e" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffd700" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="conduitBaseGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#040b1e" />
              <stop offset="50%" stopColor="#0c102a" />
              <stop offset="100%" stopColor="#1a102e" />
            </linearGradient>

            <filter id="laserBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Ambient Laser Glow Aura */}
          <path
            d={conduitPathData}
            fill="none"
            stroke="url(#laserBeamGrad)"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.25"
            filter="url(#laserBlur)"
          />

          {/* 2. Cyber Circuit Conduit Bus Track */}
          <path
            d={conduitPathData}
            fill="none"
            stroke="url(#conduitBaseGrad)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3. Outer Neon Guard Rail Edges */}
          <path
            d={conduitPathData}
            fill="none"
            stroke="url(#laserBeamGrad)"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
          />
          <path
            d={conduitPathData}
            fill="none"
            stroke="url(#conduitBaseGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 4. Center Glowing Animated Laser Flow Line */}
          <path
            d={conduitPathData}
            fill="none"
            stroke="#00f7ff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 8"
            className="animate-energy-flow"
            opacity="0.9"
          />

          {/* 5. Deflection Junction Points between levels */}
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

        {/* Sector Gateway Headers (Themed Milestones) */}
        {nodes.map((node) => {
          if (!node.sector) return null;
          const sector = node.sector;
          const isEntrance = node.id === 1;

          return (
            <div
              key={`sector-banner-${node.id}`}
              className="absolute z-10 -translate-x-1/2 flex flex-col items-center pointer-events-none"
              style={{
                left: `${(node.x / SVG_WIDTH) * 100}%`,
                // Sector 1 entrance sits cleanly below Level 1; other sectors sit above their milestone
                top: isEntrance ? `${node.y + 56}px` : `${node.y - 78}px`,
              }}
            >
              <div
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border backdrop-blur-md"
                style={{
                  backgroundColor: 'rgba(8, 12, 32, 0.92)',
                  borderColor: sector.color,
                  boxShadow: `0 0 16px ${sector.accentGlow}, inset 0 0 8px ${sector.accentGlow}`,
                }}
              >
                <Sparkles style={{ color: sector.color }} className="w-3.5 h-3.5" />
                <div className="flex flex-col items-start leading-none">
                  <span
                    className="font-display font-black text-[11px] tracking-wider"
                    style={{
                      color: sector.color,
                      textShadow: `0 0 8px ${sector.accentGlow}`,
                    }}
                  >
                    SECTOR {sector.number} // {sector.name}
                  </span>
                  <span
                    className="font-ui text-[9px] font-semibold text-slate-300 tracking-wider mt-0.5"
                    style={{ color: '#94a3b8' }}
                  >
                    {sector.subtitle}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Grand Apex Summit Reactor at Level 20 */}
        <div
          className="absolute z-10 -translate-x-1/2 flex flex-col items-center pointer-events-none"
          style={{
            left: `${(nodes[nodes.length - 1].x / SVG_WIDTH) * 100}%`,
            top: `${nodes[nodes.length - 1].y - 100}px`,
          }}
        >
          {/* Rotating Golden Apex Ring */}
          <div
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.15)',
              border: '2.5px solid #ffd700',
              boxShadow: '0 0 25px rgba(255, 215, 0, 0.7)',
            }}
            className="w-13 h-13 rounded-full flex items-center justify-center animate-bounce"
          >
            <Trophy style={{ color: '#ffd700' }} className="w-7 h-7 drop-shadow-[0_0_10px_#ffd700]" />
          </div>
          <span
            className="font-display font-black text-xs tracking-widest mt-1.5"
            style={{
              color: '#ffd700',
              textShadow: '0 0 12px rgba(255, 215, 0, 0.9), 0 2px 4px #000',
            }}
          >
            GRAND APEX REACTOR
          </span>
          <span
            className="font-ui text-[10px] font-semibold text-amber-200/90 tracking-wide"
            style={{ color: '#fef08a' }}
          >
            FINAL OVERDRIVE CORE
          </span>
        </div>

        {/* Level Energy Cells (Locked / Unlocked only, NO stars) */}
        {nodes.map((node) => {
          const progress = localProgress[String(node.id)];
          const isUnlocked = progress !== undefined;
          const isComplete = progress?.completed;
          const isCurrent = node.id === currentUnlockedId && !isComplete;

          // Theme colors based on current sector
          const sectorColor =
            node.zone === 1
              ? '#00f7ff'
              : node.zone === 2
              ? '#818cf8'
              : node.zone === 3
              ? '#f43f5e'
              : '#ffd700';

          return (
            <div
              key={`node-${node.id}`}
              ref={isCurrent ? activeNodeRef : undefined}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                left: `${(node.x / SVG_WIDTH) * 100}%`,
                top: `${node.y}px`,
              }}
            >
              {/* Floating Bouncing Energy Ball & LAUNCH Beacon above Active Level */}
              {isCurrent && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30"
                  style={{ top: '-46px' }}
                >
                  {/* Bouncing Breakout Energy Ball */}
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-white shadow-[0_0_14px_#00f7ff] border border-white animate-ball-bounce mb-1" />

                  {/* LAUNCH Badge */}
                  <div
                    style={{
                      backgroundColor: '#00f7ff',
                      color: '#000000',
                      boxShadow: '0 0 16px rgba(0, 247, 255, 0.85)',
                    }}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full font-display font-black text-[10px] tracking-wider whitespace-nowrap"
                  >
                    <Play style={{ fill: '#000000', color: '#000000' }} className="w-3 h-3" />
                    <span style={{ color: '#000000', fontWeight: 900 }}>LAUNCH</span>
                  </div>
                </div>
              )}

              {/* Reactor Node Capsule */}
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
                      ? '#051a26'
                      : isCurrent
                      ? '#0e1233'
                      : '#0a102c'
                    : '#0a0d1e',
                  borderColor: isUnlocked
                    ? isComplete
                      ? '#10b981'
                      : isCurrent
                      ? '#00f7ff'
                      : sectorColor
                    : '#334155',
                  boxShadow: isUnlocked
                    ? isCurrent
                      ? '0 0 24px rgba(0, 247, 255, 0.7), inset 0 0 12px rgba(0, 247, 255, 0.3)'
                      : isComplete
                      ? '0 0 16px rgba(16, 185, 129, 0.5)'
                      : '0 4px 12px rgba(0,0,0,0.6)'
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
                {/* Decorative Top Brick Accent Cap */}
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-1.5 rounded-full pointer-events-none"
                  style={{
                    backgroundColor: isUnlocked ? (isComplete ? '#10b981' : sectorColor) : '#475569',
                    boxShadow: isUnlocked ? `0 0 8px ${isComplete ? '#10b981' : sectorColor}` : 'none',
                  }}
                />

                {/* Node Centerpiece */}
                {isUnlocked ? (
                  <div className="flex flex-col items-center justify-center">
                    {/* Big, Crisp, High-Contrast Level Number */}
                    <span
                      className="font-tech"
                      style={{
                        color: isComplete ? '#34d399' : isCurrent ? '#00f7ff' : '#ffffff',
                        textShadow: isComplete
                          ? '0 0 10px rgba(52,211,153,0.8), 0 2px 4px #000'
                          : '0 0 12px rgba(0,247,255,0.9), 0 2px 4px #000',
                        fontSize: '22px',
                        fontWeight: 900,
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
                        className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      >
                        <Check style={{ color: '#000000' }} className="w-2.5 h-2.5 stroke-[3.5]" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* High-Contrast Locked State: Clear Silver Lock + Bright Crisp Level Number */
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <Lock
                      style={{ color: '#f1f5f9' }}
                      className="w-4 h-4 stroke-[2.4] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                    />
                    <span
                      className="font-tech"
                      style={{
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 800,
                        lineHeight: 1,
                        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                      }}
                    >
                      {node.id}
                    </span>
                  </div>
                )}

                {/* Inner Acrylic Border Bezel */}
                <div className="absolute inset-0.5 rounded-[13px] border border-white/15 pointer-events-none" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
