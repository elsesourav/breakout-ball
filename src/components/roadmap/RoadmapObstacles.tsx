import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Obstacle, SVG_WIDTH } from './types';

interface RoadmapObstaclesProps {
  obstacles: Obstacle[];
}

export const RoadmapObstacles: React.FC<RoadmapObstaclesProps> = ({ obstacles }) => {
  return (
    <>
      {obstacles.map((obs) => {
        if (obs.type === 'forcefield') {
          return (
            <div
              key={obs.id}
              className="absolute z-10 -translate-x-1/2 flex flex-col items-center pointer-events-none select-none"
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'perspective(500px) rotateX(-12deg)',
              }}
            >
              {/* Laser Forcefield Barrier Line */}
              <div
                className="w-44 h-1.5 rounded-full mb-1 flex items-center justify-between px-1"
                style={{
                  backgroundColor: obs.locked ? '#ff0844' : '#10b981',
                  boxShadow: obs.locked
                    ? '0 0 16px #ff0844, 0 0 24px rgba(255, 8, 68, 0.5)'
                    : '0 0 16px #10b981, 0 0 20px rgba(16, 185, 129, 0.45)',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              </div>

              {/* Barrier Security Tag with 3D Extruded Depth and High Contrast */}
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-tech font-bold tracking-wider uppercase whitespace-nowrap"
                style={{
                  backgroundColor: obs.locked ? 'rgba(26, 6, 16, 0.98)' : 'rgba(5, 24, 18, 0.98)',
                  borderColor: obs.locked ? '#ff0844' : '#10b981',
                  color: '#ffffff',
                  boxShadow: obs.locked
                    ? '0 2px 0 rgba(0,0,0,0.9), 0 4px 14px rgba(255, 8, 68, 0.5), inset 0 1px 1px rgba(255,255,255,0.4)'
                    : '0 2px 0 rgba(0,0,0,0.9), 0 4px 14px rgba(16, 185, 129, 0.5), inset 0 1px 1px rgba(255,255,255,0.4)',
                  textShadow: obs.locked
                    ? '0 1px 0 #000, 0 0 8px #ff0844'
                    : '0 1px 0 #000, 0 0 8px #10b981',
                }}
              >
                <ShieldAlert
                  style={{ color: obs.locked ? '#ff4b72' : '#34d399' }}
                  className="w-3.5 h-3.5 flex-shrink-0 drop-shadow-[0_0_6px_currentColor]"
                />
                <span className="whitespace-nowrap">{obs.label} // {obs.locked ? 'GATE ACTIVE' : 'PASSED'}</span>
              </div>
            </div>
          );
        }

        if (obs.type === 'titanium') {
          return (
            <div
              key={obs.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
              }}
            >
              {/* Indestructible Titanium Block */}
              <div
                className="w-10 h-5 rounded-md flex items-center justify-center font-mono font-black text-xs text-slate-200 border-2"
                style={{
                  backgroundColor: '#1e293b',
                  backgroundImage: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
                  borderColor: '#cbd5e1',
                  boxShadow: '0 0 12px rgba(203, 213, 225, 0.35), inset 0 1px 1px #fff',
                }}
              >
                <span style={{ color: '#ffffff', fontWeight: 900 }}>∞</span>
              </div>
            </div>
          );
        }

        if (obs.type === 'plasma') {
          return (
            <div
              key={obs.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center select-none"
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'perspective(500px) rotateX(-12deg)',
              }}
            >
              {/* Pure SVG Vector Plasma Orb: 100% immune to CSS box artifacts or clipping bounds */}
              <svg width="34" height="34" viewBox="0 0 34 34" className="overflow-visible select-none">
                <defs>
                  <radialGradient id={`plasma-grad-${obs.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                    <stop offset="65%" stopColor="#e11d48" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#881337" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Radiant Outer Radial Glow Aura */}
                <circle cx="17" cy="17" r="16" fill={`url(#plasma-grad-${obs.id})`} />
                {/* Plasma Core Disc */}
                <circle cx="17" cy="17" r="13" fill="#140308" stroke="#f43f5e" strokeWidth="1.75" />
                {/* Inner Glow Ring */}
                <circle cx="17" cy="17" r="10.5" fill="none" stroke="#fb7185" strokeWidth="0.75" strokeOpacity="0.7" />
                {/* Vector Flame Glyph */}
                <path
                  d="M17 9.5c.8 1.4 2.8 3.5 2.8 5.6 0 2.4-1.8 3.9-3.8 3.9-1.9 0-3.5-1.5-3.5-3.5 0-1.8 1.2-3.3 2.5-4.8.4 1.1 1.2 1.8 2 2.2-.2-1.3.1-2.4 0-3.4z"
                  fill="#f43f5e"
                />
                <path
                  d="M17 14c.4.8 1.4 1.8 1.4 2.8 0 1.2-.9 2-1.9 2-1 0-1.8-.8-1.8-1.8 0-.9.6-1.7 1.3-2.4.2.5.6.9 1 1.1-.1-.7 0-1.2 0-1.7z"
                  fill="#fecdd3"
                />
              </svg>
            </div>
          );
        }

        return null;
      })}
    </>
  );
};
