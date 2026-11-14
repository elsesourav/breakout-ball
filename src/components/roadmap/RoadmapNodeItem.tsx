import React, { forwardRef } from 'react';
import { Play, Check, Clock } from 'lucide-react';
import { RoadmapNode, SVG_WIDTH } from './types';
import { LocalLevelProgress } from '../../types/game';

interface RoadmapNodeItemProps {
  node: RoadmapNode;
  progress?: LocalLevelProgress;
  isCurrent: boolean;
  onLevelClick: (levelId: number) => void;
}

export const RoadmapNodeItem = forwardRef<HTMLDivElement, RoadmapNodeItemProps>(
  ({ node, progress, isCurrent, onLevelClick }, ref) => {
    const isUnlocked = progress !== undefined;
    const isComplete = progress?.completed;

    // Theme color based on sector zone
    const sectorColor =
      node.zone === 1
        ? '#00f7ff'
        : node.zone === 2
        ? '#818cf8'
        : node.zone === 3
        ? '#b773ff'
        : node.zone === 4
        ? '#f43f5e'
        : '#ffd700';

    // Plain clean number: 1, 2, 3... 30 (no 01, 02)
    const formattedNumber = String(node.id);

    return (
      <div
        ref={isCurrent ? ref : undefined}
        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
        style={{
          left: `${(node.x / SVG_WIDTH) * 100}%`,
          top: `${node.y}px`,
          contentVisibility: 'auto',
          containIntrinsicSize: '70px 70px',
        }}
      >
        {/* Floating Bouncing Energy Ball & PLAY Beacon above Current Active Level */}
        {isCurrent && (
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30"
            style={{ top: '-46px' }}
          >
            {/* 3D Glowing Cyber Ball */}
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-white shadow-[0_0_16px_#00f7ff] border border-white animate-ball-bounce mb-1" />

            {/* High-tech PLAY Pill */}
            <div
              style={{
                backgroundColor: '#00f7ff',
                color: '#000000',
                boxShadow: '0 0 16px rgba(0, 247, 255, 0.9)',
              }}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full font-display font-black text-[10px] tracking-wider whitespace-nowrap shadow-md"
            >
              <Play style={{ fill: '#000000', color: '#000000' }} className="w-3 h-3" />
              <span>PLAY</span>
            </div>
          </div>
        )}

        {/* 3D Tactile Cyber Node Capsule */}
        <button
          type="button"
          onClick={() => onLevelClick(node.id)}
          aria-label={`Level ${node.id} ${isUnlocked ? (isComplete ? 'Completed' : 'Unlocked') : 'Locked'}`}
          style={{
            width: '66px',
            height: '66px',
            backgroundColor: isUnlocked
              ? isComplete
                ? '#061a22'
                : isCurrent
                ? '#091838'
                : '#090e29'
              : '#080a1c',
            borderColor: isUnlocked
              ? isComplete
                ? '#10b981'
                : isCurrent
                ? '#00f7ff'
                : sectorColor
              : '#1e293b',
            boxShadow: isUnlocked
              ? isCurrent
                ? '0 8px 24px rgba(0, 247, 255, 0.45), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.7)'
                : isComplete
                ? '0 6px 18px rgba(16, 185, 129, 0.4), inset 0 2px 3px rgba(255,255,255,0.35), inset 0 -3px 6px rgba(0,0,0,0.7)'
                : `0 4px 14px ${sectorColor}35, inset 0 1px 3px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.7)`
              : '0 4px 10px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.85)',
          }}
          className={`relative group rounded-2xl flex flex-col items-center justify-center transition-all duration-200 outline-none select-none cursor-pointer border-[2.5px] ${
            isUnlocked
              ? isCurrent
                ? 'scale-105 ring-2 ring-cyan-400/50'
                : 'hover:scale-105 active:scale-95'
              : 'hover:border-slate-500 active:scale-95 opacity-75 hover:opacity-100'
          }`}
        >
          {/* Top 3D Specular Sheen Stripe */}
          <div className="absolute top-1 inset-x-2 h-4 rounded-t-xl bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none" />

          {/* Top Decorative Neon Accent Strip */}
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-1.5 rounded-full pointer-events-none"
            style={{
              backgroundColor: isUnlocked ? (isComplete ? '#10b981' : sectorColor) : '#334155',
              boxShadow: isUnlocked ? `0 0 10px ${isComplete ? '#10b981' : sectorColor}` : 'none',
            }}
          />

          {/* Corner Cyber Accents */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/20 pointer-events-none" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-white/20 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-white/20 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-white/20 pointer-events-none" />

          {/* BIG PROMINENT LEVEL NUMBER */}
          <div className="flex flex-col items-center justify-center leading-none mt-0.5">
            <span
              className="font-display font-black tracking-tight"
              style={{
                fontSize: '26px',
                color: isUnlocked
                  ? isComplete
                    ? '#34d399'
                    : isCurrent
                    ? '#00f7ff'
                    : '#ffffff'
                  : '#64748b',
                textShadow: isUnlocked
                  ? isComplete
                    ? '0 0 12px rgba(52, 211, 153, 0.8), 0 2px 4px #000'
                    : isCurrent
                    ? '0 0 15px rgba(0, 247, 255, 0.9), 0 2px 4px #000'
                    : '0 0 8px rgba(255,255,255,0.4), 0 2px 4px #000'
                  : '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {formattedNumber}
            </span>

            {/* Clean Status Pill: Best Time or Subtle Energy Dot (No tacky CLEARED/ONLINE text) */}
            <div className="flex items-center gap-1 mt-1">
              {isComplete ? (
                progress?.bestTime ? (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 font-tech text-[9px] font-bold text-emerald-300">
                    <Clock className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{progress.bestTime.toFixed(1)}s</span>
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                )
              ) : isCurrent ? (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[9px] font-tech font-bold text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f7ff] animate-pulse" />
                  <span>READY</span>
                </div>
              ) : isUnlocked ? (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400/70" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700/60" />
              )}
            </div>
          </div>

          {/* Completed Checkmark Corner Badge */}
          {isComplete && (
            <div
              style={{
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #34d399',
              }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            >
              <Check style={{ color: '#000000' }} className="w-2.5 h-2.5 stroke-[3.5]" />
            </div>
          )}

          {/* Inner Acrylic Border Bezel */}
          <div className="absolute inset-0.5 rounded-[13px] border border-white/10 pointer-events-none" />
        </button>
      </div>
    );
  }
);

RoadmapNodeItem.displayName = 'RoadmapNodeItem';
