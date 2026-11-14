import React, { forwardRef } from 'react';
import { Play, Check } from 'lucide-react';
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
        ? 'radial-gradient(circle at 35% 25%, #0f4538 0%, #06231c 55%, #020d0a 100%)'
        : isCurrent
        ? 'radial-gradient(circle at 35% 25%, #144272 0%, #0a2544 55%, #030d1a 100%)'
        : 'radial-gradient(circle at 35% 25%, #202752 0%, #0d1436 55%, #04081c 100%)'
      : 'radial-gradient(circle at 35% 25%, #182030 0%, #0b101c 60%, #03050a 100%)';

    const orbBorder = isUnlocked
      ? isComplete
        ? '#10b981'
        : isCurrent
        ? '#00f7ff'
        : sectorColor
      : '#334155';

    const orbShadow = isUnlocked
      ? isCurrent
        ? '0 0 28px rgba(0, 247, 255, 0.75), 0 0 12px rgba(0, 247, 255, 0.9), inset 0 2px 6px rgba(255,255,255,0.55), inset 0 -4px 8px rgba(0,0,0,0.9)'
        : isComplete
        ? '0 0 22px rgba(16, 185, 129, 0.55), inset 0 2px 5px rgba(255,255,255,0.45), inset 0 -4px 8px rgba(0,0,0,0.9)'
        : `0 0 16px ${sectorColor}55, inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -4px 8px rgba(0,0,0,0.9)`
      : '0 4px 12px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.08), inset 0 -3px 6px rgba(0,0,0,0.95)';

    // 3D Extruded Tactile Lettering for Level Numbers
    const numberColor = isUnlocked ? '#ffffff' : '#94a3b8';

    const numberShadow = isUnlocked
      ? isComplete
        ? '0 1px 0 #a7f3d0, 0 2px 0 #34d399, 0 3px 0 #059669, 0 4px 0 #064e3b, 0 5px 6px rgba(0, 0, 0, 0.9), 0 0 16px rgba(52, 211, 153, 0.85)'
        : isCurrent
        ? '0 1px 0 #cffafe, 0 2px 0 #00f7ff, 0 3px 0 #00b4d8, 0 4px 0 #0077b6, 0 5px 0 #03045e, 0 6px 8px rgba(0, 0, 0, 0.9), 0 0 22px rgba(0, 247, 255, 0.95)'
        : `0 1px 0 rgba(255,255,255,0.8), 0 2px 0 ${sectorColor}, 0 3px 0 ${sectorColor}cc, 0 4px 0 rgba(0,0,0,0.8), 0 5px 6px rgba(0,0,0,0.9), 0 0 14px ${sectorColor}88`
      : '0 1px 0 rgba(255,255,255,0.25), 0 2px 0 #475569, 0 3px 0 #334155, 0 4px 0 #1e293b, 0 5px 6px rgba(0,0,0,0.95)';

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
        {/* Floating Bouncing Energy Ball & High-Tech PLAY Beacon above Current Active Level */}
        {isCurrent && (
          <div
            onClick={() => onLevelClick(node.id)}
            className="z-30 cursor-pointer active:scale-95 transition-transform flex flex-col items-center select-none"
            style={{
              position: 'absolute',
              top: '-56px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {/* 3D Glowing Cyber Ball with Radiant Core */}
            <div className="relative mb-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 via-white to-cyan-200 shadow-[0_0_18px_#00f7ff,0_0_8px_#ffffff] border-2 border-white animate-ball-bounce" />
              <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-sm animate-pulse pointer-events-none" />
            </div>

            {/* High-tech Arcade PLAY Button with 3D Extruded Game Font */}
            <div
              style={{
                background: 'linear-gradient(180deg, #00f7ff 0%, #00b4d8 60%, #0077b6 100%)',
                color: '#ffffff',
                border: '1.5px solid #ffffff',
                boxShadow: '0 3px 0 #023e8a, 0 6px 14px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 247, 255, 0.8), inset 0 1px 2px #ffffff',
                borderRadius: '9999px',
                transform: 'perspective(400px) rotateX(-6deg)',
              }}
              className="flex items-center gap-1.5 px-3.5 py-1 font-display font-black text-xs tracking-widest uppercase shadow-lg"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
              <span
                style={{
                  color: '#ffffff',
                  textShadow: '0 1px 0 #cffafe, 0 2px 0 #0077b6, 0 3px 0 #023e8a, 0 4px 5px rgba(0,0,0,0.8)',
                  letterSpacing: '0.12em',
                }}
              >
                PLAY
              </span>
            </div>

            {/* Glowing Pointer Notch */}
            <div
              className="w-2 h-2 rotate-45 -mt-1 shadow-sm"
              style={{
                backgroundColor: '#00d2eb',
                borderRight: '1px solid #ffffff',
                borderBottom: '1px solid #ffffff',
              }}
            />
          </div>
        )}

        {/* 3D Tactile Cyber Core Orb (High-tech Arcade Stage Node) */}
        <button
          type="button"
          onClick={() => onLevelClick(node.id)}
          aria-label={`Level ${node.id} ${isUnlocked ? (isComplete ? 'Completed' : 'Unlocked') : 'Locked'}`}
          style={{
            width: '68px',
            height: '68px',
            background: orbBg,
            borderColor: orbBorder,
            boxShadow: orbShadow,
            WebkitTapHighlightColor: 'transparent',
            outline: 'none',
          }}
          className={`relative rounded-full flex items-center justify-center transition-all duration-200 select-none cursor-pointer border-[2.5px] ${
            isUnlocked
              ? isCurrent
                ? 'scale-105 ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#03040c]'
                : 'hover:scale-105 active:scale-95'
              : 'hover:border-slate-400 active:scale-95 opacity-75 hover:opacity-100'
          }`}
        >
          {/* Top Curved Specular Sheen (Spherical 3D Glass Arc) */}
          <div
            style={{
              position: 'absolute',
              top: '6px',
              left: '14px',
              right: '14px',
              height: '16px',
              borderRadius: '9999px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 60%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Level Number with Authentic Arcade Game Font */}
          <span
            className="font-display font-black leading-none select-none"
            style={{
              fontSize: '28px',
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
                width: '22px',
                height: '22px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 0 12px #34d399, 0 2px 6px rgba(0,0,0,0.7)',
                border: '1.5px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <Check style={{ color: '#ffffff' }} className="w-3.5 h-3.5 stroke-[3.5]" />
            </div>
          )}

          {/* Ready Status Pill Anchored Cleanly BELOW Active Current Node */}
          {isCurrent ? (
            <div
              style={{
                position: 'absolute',
                bottom: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(3, 8, 20, 0.96)',
                border: '1.5px solid rgba(0, 247, 255, 0.8)',
                boxShadow: '0 0 14px rgba(0, 247, 255, 0.6), 0 2px 6px rgba(0,0,0,0.8)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                zIndex: 10,
              }}
              className="flex items-center gap-1.5 px-3 py-0.5 rounded-full"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f7ff] animate-pulse" />
              <span
                className="font-display font-black text-[10px] tracking-widest text-white leading-none"
                style={{
                  textShadow: '0 1px 0 #00f7ff, 0 2px 0 #0077b6, 0 3px 4px rgba(0,0,0,0.9)',
                }}
              >
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
