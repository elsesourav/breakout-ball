import React from 'react';
import { Obstacle, SVG_WIDTH } from './types';

interface RoadmapAmbientHazardsProps {
  obstacles: Obstacle[];
}

export const RoadmapAmbientHazards: React.FC<RoadmapAmbientHazardsProps> = ({ obstacles }) => {
  return (
    <>
      {obstacles.map((obs) => {
        const sector = obs.sector ?? 1;

        // Sector 1: Electric Cyan Ion Technology
        if (obs.type === 'ion_cell' || (obs.type === 'titanium' && sector === 1)) {
          return (
            <div
              key={obs.id}
              className="roadmap-scale-item absolute z-10 pointer-events-none select-none"
              data-base-transform="translate(-50%, -50%)"
              data-y={obs.y}
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform, opacity',
              }}
            >
              <svg width="44" height="24" viewBox="0 0 44 24" className="overflow-visible select-none">
                <defs>
                  <linearGradient id={`ion-grad-${obs.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f7ff" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#082f49" />
                    <stop offset="100%" stopColor="#020617" />
                  </linearGradient>
                </defs>
                <rect
                  x="2"
                  y="2"
                  width="40"
                  height="20"
                  rx="4"
                  fill={`url(#ion-grad-${obs.id})`}
                  stroke="#00f7ff"
                  strokeWidth="1.5"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0,247,255,0.4))' }}
                />
                <rect x="7" y="7" width="7" height="10" rx="1.5" fill="#00f7ff" opacity="0.85" />
                <rect x="18" y="7" width="8" height="10" rx="1.5" fill="#00f7ff" opacity="0.85" />
                <rect x="30" y="7" width="7" height="10" rx="1.5" fill="#00f7ff" opacity="0.85" />
              </svg>
            </div>
          );
        }

        if (obs.type === 'cyan_vortex' || (obs.type === 'plasma' && sector === 1)) {
          return (
            <div
              key={obs.id}
              className="roadmap-scale-item absolute z-10 pointer-events-none flex items-center justify-center select-none"
              data-base-transform="translate(-50%, -50%)"
              data-y={obs.y}
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform, opacity',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" className="overflow-visible select-none">
                <circle cx="18" cy="18" r="16" fill="rgba(0,247,255,0.12)" />
                <circle cx="18" cy="18" r="13" fill="#04131d" stroke="#00f7ff" strokeWidth="1.5" />
                <circle cx="18" cy="18" r="10" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 3" />
                <circle cx="18" cy="18" r="4.5" fill="#00f7ff" style={{ filter: 'drop-shadow(0 0 6px #00f7ff)' }} />
              </svg>
            </div>
          );
        }

        // Sector 2: Synthwave Resonant Indigo Technology
        if (obs.type === 'sonic_prism' || (obs.type === 'titanium' && sector === 2)) {
          return (
            <div
              key={obs.id}
              className="roadmap-scale-item absolute z-10 pointer-events-none select-none"
              data-base-transform="translate(-50%, -50%)"
              data-y={obs.y}
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform, opacity',
              }}
            >
              <svg width="40" height="26" viewBox="0 0 40 26" className="overflow-visible select-none">
                <polygon
                  points="20,2 38,13 20,24 2,13"
                  fill="#0f172a"
                  stroke="#818cf8"
                  strokeWidth="1.5"
                  style={{ filter: 'drop-shadow(0 0 9px rgba(129,140,248,0.5))' }}
                />
                <line x1="2" y1="13" x2="38" y2="13" stroke="#a5b4fc" strokeWidth="1" strokeDasharray="3 3" />
                <polygon points="20,7 29,13 20,19 11,13" fill="#818cf8" opacity="0.4" />
                <circle cx="20" cy="13" r="2.5" fill="#ffffff" />
              </svg>
            </div>
          );
        }

        if (obs.type === 'pulse_core' || (obs.type === 'plasma' && sector === 2)) {
          return (
            <div
              key={obs.id}
              className="roadmap-scale-item absolute z-10 pointer-events-none flex items-center justify-center select-none"
              data-base-transform="translate(-50%, -50%)"
              data-y={obs.y}
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform, opacity',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" className="overflow-visible select-none">
                <circle cx="18" cy="18" r="17" fill="none" stroke="#818cf8" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 4" />
                <circle cx="18" cy="18" r="13" fill="#131633" stroke="#818cf8" strokeWidth="1.6" />
                <circle cx="18" cy="18" r="8" fill="none" stroke="#c7d2fe" strokeWidth="1" />
                <circle cx="18" cy="18" r="4" fill="#a5b4fc" style={{ filter: 'drop-shadow(0 0 7px #818cf8)' }} />
              </svg>
            </div>
          );
        }

        // Sector 3: Quantum Void Technology
        if (obs.type === 'quantum_monolith' || (obs.type === 'titanium' && sector === 3)) {
          return (
            <div
              key={obs.id}
              className="roadmap-scale-item absolute z-10 pointer-events-none select-none"
              data-base-transform="translate(-50%, -50%)"
              data-y={obs.y}
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform, opacity',
              }}
            >
              <svg width="42" height="26" viewBox="0 0 42 26" className="overflow-visible select-none">
                <rect
                  x="3"
                  y="3"
                  width="36"
                  height="20"
                  rx="6"
                  fill="#170929"
                  stroke="#c084fc"
                  strokeWidth="1.5"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(192,132,252,0.45))' }}
                />
                <path d="M 12 8 L 16 13 L 12 18" fill="none" stroke="#f0abfc" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="21" cy="13" r="3" fill="none" stroke="#e879f9" strokeWidth="1.5" />
                <path d="M 30 8 L 26 13 L 30 18" fill="none" stroke="#f0abfc" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          );
        }

        if (obs.type === 'void_singularity' || (obs.type === 'plasma' && sector === 3)) {
          return (
            <div
              key={obs.id}
              className="roadmap-scale-item absolute z-10 pointer-events-none flex items-center justify-center select-none"
              data-base-transform="translate(-50%, -50%)"
              data-y={obs.y}
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform, opacity',
              }}
            >
              <svg width="38" height="38" viewBox="0 0 38 38" className="overflow-visible select-none">
                <circle cx="19" cy="19" r="17" fill="rgba(192,132,252,0.15)" />
                <circle cx="19" cy="19" r="13" fill="#08020e" stroke="#c084fc" strokeWidth="1.6" />
                <ellipse cx="19" cy="19" rx="14" ry="4.5" fill="none" stroke="#e879f9" strokeWidth="1.2" transform="rotate(-25 19 19)" />
                <circle cx="19" cy="19" r="4.5" fill="#000000" stroke="#f5d0fe" strokeWidth="1" />
              </svg>
            </div>
          );
        }

        // Sector 4: Cyber Bastion Technology
        if (obs.type === 'bastion_turret' || (obs.type === 'titanium' && sector === 4)) {
          return (
            <div
              key={obs.id}
              className="roadmap-scale-item absolute z-10 pointer-events-none select-none"
              data-base-transform="translate(-50%, -50%)"
              data-y={obs.y}
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform, opacity',
              }}
            >
              <svg width="44" height="26" viewBox="0 0 44 26" className="overflow-visible select-none">
                <path
                  d="M 5 5 L 12 2 L 32 2 L 39 5 L 42 21 L 2 21 Z"
                  fill="#1b080f"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(244,63,94,0.45))' }}
                />
                <line x1="14" y1="9" x2="30" y2="9" stroke="#fda4af" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="10" y1="14" x2="34" y2="14" stroke="#fb7185" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="22" cy="18" r="1.5" fill="#ffffff" />
              </svg>
            </div>
          );
        }

        if (obs.type === 'molten_core' || (obs.type === 'plasma' && sector === 4)) {
          return (
            <div
              key={obs.id}
              className="roadmap-scale-item absolute z-10 pointer-events-none flex items-center justify-center select-none"
              data-base-transform="translate(-50%, -50%)"
              data-y={obs.y}
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform, opacity',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" className="overflow-visible select-none">
                <circle cx="18" cy="18" r="16" fill="rgba(244,63,94,0.18)" />
                <circle cx="18" cy="18" r="13" fill="#1f040b" stroke="#f43f5e" strokeWidth="1.6" />
                <circle cx="18" cy="18" r="9" fill="none" stroke="#fb7185" strokeWidth="1" strokeDasharray="5 3" />
                <circle cx="18" cy="18" r="4.5" fill="#f43f5e" style={{ filter: 'drop-shadow(0 0 8px #f43f5e)' }} />
              </svg>
            </div>
          );
        }

        // Sector 5: Imperial Gold Apex Solar Technology
        if (obs.type === 'solar_relic' || (obs.type === 'titanium' && sector === 5)) {
          return (
            <div
              key={obs.id}
              className="roadmap-scale-item absolute z-10 pointer-events-none select-none"
              data-base-transform="translate(-50%, -50%)"
              data-y={obs.y}
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform, opacity',
              }}
            >
              <svg width="42" height="28" viewBox="0 0 42 28" className="overflow-visible select-none">
                <polygon
                  points="21,2 39,14 21,26 3,14"
                  fill="#1b1605"
                  stroke="#ffd700"
                  strokeWidth="1.6"
                  style={{ filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.55))' }}
                />
                <circle cx="21" cy="14" r="5" fill="#ffd700" opacity="0.3" stroke="#fef08a" strokeWidth="1" />
                <circle cx="21" cy="14" r="2.2" fill="#ffffff" />
              </svg>
            </div>
          );
        }

        if (obs.type === 'hyper_singularity' || (obs.type === 'plasma' && sector === 5)) {
          return (
            <div
              key={obs.id}
              className="roadmap-scale-item absolute z-10 pointer-events-none flex items-center justify-center select-none"
              data-base-transform="translate(-50%, -50%)"
              data-y={obs.y}
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform, opacity',
              }}
            >
              <svg width="38" height="38" viewBox="0 0 38 38" className="overflow-visible select-none">
                <circle cx="19" cy="19" r="17" fill="rgba(255,215,0,0.18)" />
                <circle cx="19" cy="19" r="13" fill="#1e1805" stroke="#ffd700" strokeWidth="1.6" />
                <circle cx="19" cy="19" r="9" fill="none" stroke="#fef08a" strokeWidth="1" strokeDasharray="3 4" />
                <circle cx="19" cy="19" r="4.5" fill="#ffd700" style={{ filter: 'drop-shadow(0 0 9px #ffd700)' }} />
              </svg>
            </div>
          );
        }

        // Generic Forcefield Fallback
        if (obs.type === 'forcefield') {
          const isLocked = obs.locked;
          const laserColor = isLocked ? '#ff0844' : '#10b981';
          const laserGlow = isLocked ? 'rgba(255, 8, 68, 0.7)' : 'rgba(16, 185, 129, 0.6)';

          return (
            <div
              key={obs.id}
              className="roadmap-scale-item absolute z-10 flex flex-col items-center pointer-events-none select-none"
              data-base-transform="translate(-50%, -50%)"
              data-y={obs.y}
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'translate(-50%, -50%)',
                willChange: 'transform, opacity',
              }}
            >
              <div className="relative flex items-center justify-between w-64 h-8 px-1">
                <div
                  className="w-4 h-8 rounded-sm flex flex-col items-center justify-between py-1 border shadow-lg"
                  style={{
                    backgroundColor: '#0a0f24',
                    borderColor: laserColor,
                    boxShadow: `0 0 10px ${laserGlow}`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: laserColor, boxShadow: `0 0 6px ${laserColor}` }} />
                  <span className="w-2 h-0.5 bg-slate-500 rounded-full" />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: laserColor }} />
                </div>

                <div className="flex-1 relative mx-1 h-2 flex items-center">
                  <div
                    className="w-full h-1 rounded-full"
                    style={{
                      backgroundColor: laserColor,
                      boxShadow: `0 0 14px ${laserColor}, 0 0 22px ${laserGlow}`,
                    }}
                  />
                  <div className="absolute inset-x-4 h-[1.5px] bg-white rounded-full opacity-80" />
                </div>

                <div
                  className="w-4 h-8 rounded-sm flex flex-col items-center justify-between py-1 border shadow-lg"
                  style={{
                    backgroundColor: '#0a0f24',
                    borderColor: laserColor,
                    boxShadow: `0 0 10px ${laserGlow}`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: laserColor, boxShadow: `0 0 6px ${laserColor}` }} />
                  <span className="w-2 h-0.5 bg-slate-500 rounded-full" />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: laserColor }} />
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}
    </>
  );
};
