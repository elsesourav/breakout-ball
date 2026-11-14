import React, { forwardRef } from 'react';
import { Play, Check, Sparkles } from 'lucide-react';
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
        ? '#f43f5e'
        : '#ffd700';

    // Format number to 2 digits for aesthetic cyber consistency (01, 02, ... 20)
    const formattedNumber = node.id < 10 ? `0${node.id}` : String(node.id);

    return (
      <div
        ref={isCurrent ? ref : undefined}
        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
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
            {/* Bouncing Breakout Ball with motion glow */}
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-white shadow-[0_0_16px_#00f7ff] border border-white animate-ball-bounce mb-1" />

            {/* High-tech LAUNCH Pill */}
            <div
              style={{
                backgroundColor: '#00f7ff',
                color: '#000000',
                boxShadow: '0 0 16px rgba(0, 247, 255, 0.9)',
              }}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full font-display font-black text-[10px] tracking-wider whitespace-nowrap shadow-md"
            >
              <Play style={{ fill: '#000000', color: '#000000' }} className="w-3 h-3" />
              <span>LAUNCH</span>
            </div>
          </div>
        )}

        {/* Level Reactor Node Capsule */}
        <button
          type="button"
          onClick={() => onLevelClick(node.id)}
          aria-label={`Level ${node.id} ${isUnlocked ? (isComplete ? 'Completed' : 'Unlocked') : 'Locked'}`}
          style={{
            width: '64px',
            height: '64px',
            backgroundColor: isUnlocked
              ? isComplete
                ? '#041822'
                : isCurrent
                ? '#081433'
                : '#080d28'
              : '#060818',
            borderColor: isUnlocked
              ? isComplete
                ? '#10b981'
                : isCurrent
                ? '#00f7ff'
                : sectorColor
              : '#1e293b',
            boxShadow: isUnlocked
              ? isCurrent
                ? '0 0 26px rgba(0, 247, 255, 0.75), inset 0 0 15px rgba(0, 247, 255, 0.35)'
                : isComplete
                ? '0 0 18px rgba(16, 185, 129, 0.55), inset 0 0 10px rgba(16, 185, 129, 0.2)'
                : `0 0 14px ${sectorColor}40`
              : '0 4px 12px rgba(0,0,0,0.6)',
          }}
          className={`relative group rounded-2xl flex flex-col items-center justify-center transition-all duration-200 outline-none select-none cursor-pointer border-[2.5px] ${
            isUnlocked
              ? isCurrent
                ? 'scale-105 ring-2 ring-cyan-400/50'
                : 'hover:scale-105 active:scale-95'
              : 'hover:border-slate-500 active:scale-95 opacity-80 hover:opacity-100'
          }`}
        >
          {/* Top Decorative Neon Accent Strip */}
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-1.5 rounded-full pointer-events-none"
            style={{
              backgroundColor: isUnlocked ? (isComplete ? '#10b981' : sectorColor) : '#334155',
              boxShadow: isUnlocked ? `0 0 10px ${isComplete ? '#10b981' : sectorColor}` : 'none',
            }}
          />

          {/* Corner Cyber Accents for tech look */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/20 pointer-events-none" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-white/20 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-white/20 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-white/20 pointer-events-none" />

          {/* BIG PROMINENT LEVEL NUMBER */}
          <div className="flex flex-col items-center justify-center leading-none">
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

            {/* Discrete Status Indicator at bottom of node */}
            <div className="flex items-center gap-1 mt-0.5">
              {isUnlocked ? (
                isComplete ? (
                  <span className="font-tech text-[8px] font-black text-emerald-400 tracking-wider">
                    CLEARED
                  </span>
                ) : (
                  <span className="font-tech text-[8px] font-black text-cyan-300 tracking-wider">
                    ONLINE
                  </span>
                )
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600/70" />
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
