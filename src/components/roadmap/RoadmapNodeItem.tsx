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
      : '#475569';

    const orbShadow = isUnlocked
      ? isCurrent
        ? '0 0 28px rgba(0, 247, 255, 0.75), 0 0 12px rgba(0, 247, 255, 0.9), inset 0 2px 6px rgba(255,255,255,0.55), inset 0 -4px 8px rgba(0,0,0,0.9)'
        : isComplete
        ? '0 0 22px rgba(16, 185, 129, 0.55), inset 0 2px 5px rgba(255,255,255,0.45), inset 0 -4px 8px rgba(0,0,0,0.9)'
        : `0 0 16px ${sectorColor}55, inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -4px 8px rgba(0,0,0,0.9)`
      : '0 4px 14px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -3px 6px rgba(0,0,0,0.95)';

    // High-Contrast 3D Tactile Lettering for Level Numbers
    const numberColor = isUnlocked ? '#ffffff' : '#f1f5f9';

    const numberShadow = isUnlocked
      ? isComplete
        ? '0 1px 0 #a7f3d0, 0 2px 0 #34d399, 0 3px 0 #059669, 0 4px 0 #064e3b, 0 5px 6px rgba(0, 0, 0, 0.9), 0 0 16px rgba(52, 211, 153, 0.85)'
        : isCurrent
        ? '0 1px 0 #cffafe, 0 2px 0 #00f7ff, 0 3px 0 #00b4d8, 0 4px 0 #0077b6, 0 5px 0 #03045e, 0 6px 8px rgba(0, 0, 0, 0.9), 0 0 22px rgba(0, 247, 255, 0.95)'
        : `0 1px 0 rgba(255,255,255,0.8), 0 2px 0 ${sectorColor}, 0 3px 0 ${sectorColor}cc, 0 4px 0 rgba(0,0,0,0.8), 0 5px 6px rgba(0,0,0,0.9), 0 0 14px ${sectorColor}88`
      : '0 1px 0 #ffffff, 0 2px 0 #64748b, 0 3px 0 #334155, 0 4px 0 #0f172a, 0 5px 6px rgba(0,0,0,0.95), 0 0 8px rgba(255,255,255,0.2)';

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

        {/* 3D Celestial Cyber Globe (High-tech Arcade Stage Node) */}
        <button
          type="button"
          onClick={() => onLevelClick(node.id)}
          aria-label={`Level ${node.id} ${isUnlocked ? (isComplete ? 'Completed' : 'Unlocked') : 'Locked'}`}
          style={{
            width: '70px',
            height: '70px',
            WebkitTapHighlightColor: 'transparent',
            outline: 'none',
          }}
          className={`relative rounded-full flex items-center justify-center transition-all duration-200 select-none cursor-pointer ${
            isUnlocked
              ? isCurrent
                ? 'scale-105'
                : 'hover:scale-105 active:scale-95'
              : 'hover:scale-[1.02] active:scale-95'
          }`}
        >
          {/* 3D Saturnian Orbital Ring for Current Active Node */}
          {isCurrent && (
            <div
              className="absolute -inset-2 rounded-full pointer-events-none animate-spin-slow"
              style={{
                border: '2px solid rgba(0, 247, 255, 0.75)',
                boxShadow: '0 0 16px rgba(0, 247, 255, 0.6), inset 0 0 8px rgba(0, 247, 255, 0.35)',
                transform: 'rotateX(70deg) rotateZ(-25deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00f7ff,0_0_4px_#ffffff] absolute -top-1.5 left-1/2 -translate-x-1/2" />
            </div>
          )}

          {/* 3D Spherical Vector Cyber Globe Base */}
          <svg
            viewBox="0 0 70 70"
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            style={{
              filter: isCurrent
                ? 'drop-shadow(0 0 14px rgba(0, 247, 255, 0.8))'
                : isComplete
                ? 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.6))'
                : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.8))',
            }}
          >
            <defs>
              {/* 3D Sphere Shading with Specular Light Reflection */}
              <radialGradient id={`globe-shell-${node.id}`} cx="35%" cy="28%" r="65%">
                <stop
                  offset="0%"
                  stopColor={isComplete ? '#6ee7b7' : isCurrent ? '#a5f3fc' : '#94a3b8'}
                  stopOpacity={isUnlocked ? '0.45' : '0.25'}
                />
                <stop
                  offset="28%"
                  stopColor={isComplete ? '#065f46' : isCurrent ? '#0e7490' : '#1e293b'}
                  stopOpacity="0.85"
                />
                <stop
                  offset="72%"
                  stopColor={isComplete ? '#022c22' : isCurrent ? '#082f49' : '#0f172a'}
                  stopOpacity="0.95"
                />
                <stop offset="100%" stopColor="#02040a" stopOpacity="0.98" />
              </radialGradient>

              {/* Glowing Inner Core Nucleus */}
              <radialGradient id={`core-glow-${node.id}`} cx="50%" cy="50%" r="50%">
                <stop
                  offset="0%"
                  stopColor={isComplete ? '#34d399' : isCurrent ? '#00f7ff' : sectorColor}
                  stopOpacity={isUnlocked ? '0.8' : '0.25'}
                />
                <stop
                  offset="70%"
                  stopColor={isComplete ? '#059669' : isCurrent ? '#0284c7' : '#334155'}
                  stopOpacity="0.3"
                />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Base Spherical Shell */}
            <circle
              cx="35"
              cy="35"
              r="33"
              fill={`url(#globe-shell-${node.id})`}
              stroke={orbBorder}
              strokeWidth={isCurrent ? '2.5' : '2'}
            />

            {/* 3D Globe Equator & Latitude Arcs (Curved Spherical Latitude Lines) */}
            <ellipse
              cx="35"
              cy="35"
              rx="32"
              ry="11"
              fill="none"
              stroke={isComplete ? '#34d399' : isCurrent ? '#00f7ff' : '#64748b'}
              strokeWidth="1"
              strokeDasharray={isUnlocked ? '3 3' : '2 4'}
              opacity={isUnlocked ? 0.7 : 0.35}
            />
            <ellipse
              cx="35"
              cy="23"
              rx="28"
              ry="8"
              fill="none"
              stroke={isComplete ? '#34d399' : isCurrent ? '#00f7ff' : '#64748b'}
              strokeWidth="0.75"
              opacity={isUnlocked ? 0.5 : 0.25}
            />
            <ellipse
              cx="35"
              cy="47"
              rx="28"
              ry="8"
              fill="none"
              stroke={isComplete ? '#34d399' : isCurrent ? '#00f7ff' : '#64748b'}
              strokeWidth="0.75"
              opacity={isUnlocked ? 0.5 : 0.25}
            />

            {/* 3D Globe Central Meridian Curved Arc */}
            <ellipse
              cx="35"
              cy="35"
              rx="15"
              ry="32"
              fill="none"
              stroke={isComplete ? '#34d399' : isCurrent ? '#00f7ff' : '#64748b'}
              strokeWidth="1"
              opacity={isUnlocked ? 0.6 : 0.25}
            />

            {/* Inner Pulsing Core Nucleus */}
            <circle
              cx="35"
              cy="35"
              r="17"
              fill={`url(#core-glow-${node.id})`}
            />

            {/* Top Specular Curved Glass Highlight Crescent */}
            <path
              d="M 16 22 C 22 10, 48 10, 54 22 C 46 14, 24 14, 16 22 Z"
              fill="#ffffff"
              opacity={isUnlocked ? 0.45 : 0.2}
            />
          </svg>

          {/* Level Number with Authentic Arcade Game Font */}
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

          {/* Floating Completed Checkmark Badge on Globe Rim */}
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
