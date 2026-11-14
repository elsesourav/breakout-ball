import React from 'react';
import { ShieldAlert, Flame } from 'lucide-react';
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
              className="absolute z-10 -translate-x-1/2 flex flex-col items-center pointer-events-none"
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                contentVisibility: 'auto',
                containIntrinsicSize: '200px 50px',
              }}
            >
              {/* Laser Forcefield Barrier Line */}
              <div
                className="w-48 h-1.5 rounded-full mb-1 flex items-center justify-between px-1"
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

              {/* Barrier Security Tag */}
              <div
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-tech font-bold tracking-wider uppercase shadow-md"
                style={{
                  backgroundColor: obs.locked ? 'rgba(26, 6, 16, 0.95)' : 'rgba(5, 24, 18, 0.95)',
                  borderColor: obs.locked ? '#ff0844' : '#10b981',
                  color: obs.locked ? '#ff4b72' : '#34d399',
                  boxShadow: obs.locked
                    ? '0 0 12px rgba(255, 8, 68, 0.35)'
                    : '0 0 12px rgba(16, 185, 129, 0.35)',
                }}
              >
                <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                <span>{obs.label} // {obs.locked ? 'GATE ACTIVE' : 'PASSED'}</span>
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
                contentVisibility: 'auto',
                containIntrinsicSize: '40px 20px',
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
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                contentVisibility: 'auto',
                containIntrinsicSize: '24px 24px',
              }}
            >
              {/* Plasma Hazard Deflector Orb */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center border"
                style={{
                  backgroundColor: 'rgba(244, 63, 94, 0.25)',
                  borderColor: '#f43f5e',
                  boxShadow: '0 0 12px rgba(244, 63, 94, 0.5)',
                }}
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
              </div>
            </div>
          );
        }

        return null;
      })}
    </>
  );
};
