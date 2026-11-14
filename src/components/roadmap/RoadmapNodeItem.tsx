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

    // Sector Theme Color
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

    const formattedNumber = String(node.id);

    // 3D Spherical Radial Background & Border per status
    const orbBg = isUnlocked
      ? isComplete
        ? 'radial-gradient(circle at 35% 28%, #0d3830 0%, #061e1a 55%, #020a08 100%)'
        : isCurrent
        ? 'radial-gradient(circle at 35% 28%, #0f305c 0%, #091a38 55%, #03081a 100%)'
        : 'radial-gradient(circle at 35% 28%, #181d3d 0%, #090e29 55%, #040614 100%)'
      : 'radial-gradient(circle at 35% 28%, #141926 0%, #090c16 60%, #020308 100%)';

    const orbBorder = isUnlocked
      ? isComplete
        ? '#10b981'
        : isCurrent
        ? '#00f7ff'
        : sectorColor
      : '#1e293b';

    const orbShadow = isUnlocked
      ? isCurrent
        ? '0 0 24px rgba(0, 247, 255, 0.6), inset 0 2px 5px rgba(255,255,255,0.45), inset 0 -4px 6px rgba(0,0,0,0.8)'
        : isComplete
        ? '0 0 18px rgba(16, 185, 129, 0.45), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -4px 6px rgba(0,0,0,0.8)'
        : `0 0 14px ${sectorColor}40, inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -4px 6px rgba(0,0,0,0.8)`
      : '0 4px 10px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.08), inset 0 -3px 5px rgba(0,0,0,0.9)';

    const numberColor = isUnlocked
      ? isComplete
        ? '#34d399'
        : isCurrent
        ? '#00f7ff'
        : '#ffffff'
      : '#64748b';

    const numberShadow = isUnlocked
      ? isComplete
        ? '0 0 12px rgba(52, 211, 153, 0.8), 0 2px 4px #000'
        : isCurrent
        ? '0 0 15px rgba(0, 247, 255, 0.9), 0 2px 4px #000'
        : '0 0 8px rgba(255,255,255,0.4), 0 2px 4px #000'
      : '0 2px 4px rgba(0,0,0,0.8)';

    return (
      <div
        ref={isCurrent ? ref : undefined}
        className="absolute z-20 flex flex-col items-center"
        style={{
          left: `${(node.x / SVG_WIDTH) * 100}%`,
          top: `${node.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Floating Bouncing Energy Ball & PLAY Beacon above Current Active Level */}
        {isCurrent && (
          <div
            className="pointer-events-none z-30"
            style={{
              position: 'absolute',
              top: '-46px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
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

        {/* 3D Tactile Cyber Core Orb (Circular, No Box, No Corner Brackets) */}
        <button
          type="button"
          onClick={() => onLevelClick(node.id)}
          aria-label={`Level ${node.id} ${isUnlocked ? (isComplete ? 'Completed' : 'Unlocked') : 'Locked'}`}
          style={{
            width: '64px',
            height: '64px',
            background: orbBg,
            borderColor: orbBorder,
            boxShadow: orbShadow,
            WebkitTapHighlightColor: 'transparent',
            outline: 'none',
          }}
          className={`relative rounded-full flex items-center justify-center transition-all duration-200 select-none cursor-pointer border-[2.5px] ${
            isUnlocked
              ? isCurrent
                ? 'scale-105 ring-2 ring-cyan-400/60'
                : 'hover:scale-105 active:scale-95'
              : 'hover:border-slate-500 active:scale-95 opacity-75 hover:opacity-100'
          }`}
        >
          {/* Top Curved Specular Sheen (Spherical 3D Glass Arc) */}
          <div
            style={{
              position: 'absolute',
              top: '6px',
              left: '14px',
              right: '14px',
              height: '14px',
              borderRadius: '9999px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 60%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Clean Prominent Level Number (100% un-occluded in center) */}
          <span
            className="font-display font-black leading-none select-none"
            style={{
              fontSize: '26px',
              color: numberColor,
              textShadow: numberShadow,
              position: 'relative',
              zIndex: 2,
            }}
          >
            {formattedNumber}
          </span>

          {/* Floating Completed Checkmark Badge on Orb Rim */}
          {isComplete && (
            <div
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '20px',
                height: '20px',
                borderRadius: '9999px',
                backgroundColor: '#10b981',
                boxShadow: '0 0 10px #34d399',
                border: '1.5px solid #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <Check style={{ color: '#000000' }} className="w-3 h-3 stroke-[3.5]" />
            </div>
          )}

          {/* Floating Status / Time Pill Anchored Cleanly BELOW Orb (Zero Collage / Overlap) */}
          {isComplete && progress?.bestTime ? (
            <div
              style={{
                position: 'absolute',
                bottom: '-14px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(3, 6, 20, 0.96)',
                border: '1px solid rgba(16, 185, 129, 0.55)',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                zIndex: 10,
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            >
              <Clock className="w-2.5 h-2.5 text-emerald-400" />
              <span className="font-tech text-[9px] font-bold text-emerald-300 leading-none">
                {progress.bestTime.toFixed(1)}s
              </span>
            </div>
          ) : isCurrent ? (
            <div
              style={{
                position: 'absolute',
                bottom: '-14px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(3, 6, 20, 0.96)',
                border: '1px solid rgba(0, 247, 255, 0.65)',
                boxShadow: '0 0 12px rgba(0, 247, 255, 0.5)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                zIndex: 10,
              }}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f7ff] animate-pulse" />
              <span className="font-tech text-[9px] font-bold text-cyan-300 leading-none">
                READY
              </span>
            </div>
          ) : null}
        </button>
      </div>
    );
  }
);

RoadmapNodeItem.displayName = 'RoadmapNodeItem';
