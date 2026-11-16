import React, { forwardRef } from 'react';
import { Play, Check, Star } from 'lucide-react';
import { RoadmapNode, SVG_WIDTH } from './types';
import { LocalLevelProgress } from '../../types/game';

interface RoadmapNodeItemProps {
  node: RoadmapNode;
  progress?: LocalLevelProgress;
  isCurrent: boolean;
  disabled?: boolean;
  onLevelClick: (levelId: number) => void;
}

export const RoadmapNodeItem = forwardRef<HTMLDivElement, RoadmapNodeItemProps>(
  ({ node, progress, isCurrent, disabled = false, onLevelClick }, ref) => {
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

    // High-Contrast Clean Typography for Level Numbers
    const numberColor = isUnlocked ? '#ffffff' : '#94a3b8';

    const numberShadow = isUnlocked
      ? isCurrent
        ? '0 0 14px #00f7ff, 0 2px 4px rgba(0, 0, 0, 0.95)'
        : isComplete
        ? '0 0 12px #34d399, 0 2px 4px rgba(0, 0, 0, 0.95)'
        : `0 0 10px ${sectorColor}, 0 2px 4px rgba(0, 0, 0, 0.95)`
      : '0 2px 4px rgba(0, 0, 0, 0.95)';

    return (
      <div
        ref={ref}
        className="roadmap-scale-item absolute z-20 flex flex-col items-center"
        data-base-transform="translate(-50%, -50%)"
        data-y={node.y}
        style={{
          left: `${(node.x / SVG_WIDTH) * 100}%`,
          top: `${node.y}px`,
          transform: 'translate(-50%, -50%)',
          willChange: 'transform, opacity',
        }}
      >
        {/* 3D Ground Elevation Contact Shadow */}
        <div
          className="absolute -bottom-2.5 w-16 h-3 rounded-full pointer-events-none select-none"
          style={{
            background: isCurrent
              ? 'radial-gradient(ellipse at center, rgba(0,247,255,0.4) 0%, rgba(0,0,0,0.85) 50%, transparent 75%)'
              : 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 75%)',
            filter: 'blur(2.5px)',
            transform: 'scaleY(0.45)',
          }}
        />

        {/* 3D Celestial Cyber Globe (High-tech Arcade Stage Node) */}
        <button
          type="button"
          id={`roadmap-level-node-${node.id}`}
          disabled={disabled}
          onClick={() => onLevelClick(node.id)}
          aria-label={`Level ${node.id} ${isUnlocked ? (isComplete ? 'Completed' : 'Unlocked') : 'Locked'}`}
          style={{
            width: '70px',
            height: '70px',
            WebkitTapHighlightColor: 'transparent',
            outline: 'none',
          }}
          className={`relative rounded-full flex items-center justify-center transition-all duration-200 select-none ${
            disabled
              ? 'opacity-80 pointer-events-none cursor-default'
              : 'cursor-pointer'
          } ${
            isUnlocked
              ? isCurrent
                ? 'scale-105'
                : 'hover:scale-105 active:scale-95'
              : 'hover:scale-[1.02] active:scale-95'
          }`}
        >
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

            {/* 3D Fresnel Lower Rim Reflection (Ground Bounce Light) */}
            <path
              d="M 14 46 C 20 58, 50 58, 56 46 C 48 55, 22 55, 14 46 Z"
              fill={isComplete ? '#34d399' : isCurrent ? '#00f7ff' : sectorColor}
              opacity={isUnlocked ? 0.5 : 0.2}
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

          {/* Floating Completed Star Badge on Globe Rim */}
          {isComplete && (
            <div
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                minWidth: '24px',
                height: '20px',
                padding: '0 4px',
                borderRadius: '9999px',
                background:
                  (progress?.stars ?? 3) === 3
                    ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)'
                    : (progress?.stars ?? 3) === 2
                    ? 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow:
                  (progress?.stars ?? 3) === 3
                    ? '0 0 12px rgba(251, 191, 36, 0.8), 0 2px 6px rgba(0,0,0,0.7)'
                    : '0 0 10px rgba(0, 247, 255, 0.6), 0 2px 6px rgba(0,0,0,0.7)',
                border: '1.5px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1px',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <Star className="w-2.5 h-2.5 fill-white text-white shrink-0" />
              <span className="font-display font-black text-[10px] text-white leading-none">
                {progress?.stars ?? 3}
              </span>
            </div>
          )}

          {/* High-Tech Arcade PLAY Button Anchored Below Current Active Level Index */}
          {isCurrent && (
            <div
              style={{
                position: 'absolute',
                bottom: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(180deg, #00f7ff 0%, #00b4d8 60%, #0077b6 100%)',
                border: '1.5px solid #ffffff',
                boxShadow: '0 2.5px 0 #023e8a, 0 4px 12px rgba(0, 0, 0, 0.7), 0 0 18px rgba(0, 247, 255, 0.85), inset 0 1px 2px #ffffff',
                borderRadius: '9999px',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                zIndex: 20,
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1 font-display font-black text-xs uppercase tracking-widest shadow-lg select-none"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] shrink-0" />
              <span
                className="font-display font-black text-xs leading-none uppercase"
                style={{
                  fontFamily: 'var(--font-display), sans-serif',
                  fontWeight: 900,
                  color: '#ffffff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,247,255,0.6)',
                  letterSpacing: '0.12em',
                }}
              >
                PLAY
              </span>
            </div>
          )}
        </button>
      </div>
    );
  }
);

RoadmapNodeItem.displayName = 'RoadmapNodeItem';
