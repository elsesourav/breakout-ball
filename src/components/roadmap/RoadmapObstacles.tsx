import React from 'react';
import { Obstacle, RouteBlocker, SVG_WIDTH } from './types';

interface RoadmapObstaclesProps {
  obstacles: Obstacle[];
  routeBlockers?: RouteBlocker[];
  onBlockerClick?: (blocker: RouteBlocker) => void;
}

export const RoadmapObstacles: React.FC<RoadmapObstaclesProps> = ({
  obstacles,
  routeBlockers = [],
  onBlockerClick,
}) => {
  return (
    <>
      {/* 1. Kinetic Route Obstacle Objects (Physical 3D Blockers on the Conduit Path) */}
      {routeBlockers.map((b) => {
        // When level is cleared, the blocker object is completely destroyed/removed!
        if (b.isCleared) {
          return null;
        }

        if (b.isActive) {
          // ACTIVE BLOCKER: 3D High-Tech Energy Barrier Clamp Severing the Active Route
          return (
            <div
              key={b.id}
              onClick={() => onBlockerClick?.(b)}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 select-none cursor-pointer active:scale-95 transition-transform"
              style={{
                left: `${(b.x / SVG_WIDTH) * 100}%`,
                top: `${b.y}px`,
                transform: 'translate(-50%, -50%) translateZ(22px) rotateX(-14deg)',
                transformStyle: 'preserve-3d',
              }}
              title="Route Blocked: Complete previous level to destroy this barrier"
            >
              {/* 3D Cyber Barrier Object across the Conduit Track */}
              <svg
                width="64"
                height="32"
                viewBox="0 0 64 32"
                className="overflow-visible select-none drop-shadow-[0_0_12px_rgba(255,8,68,0.7)]"
              >
                <defs>
                  {/* Metallic Clamp Gradient */}
                  <linearGradient id={`clampGrad-${b.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="40%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#090d16" />
                  </linearGradient>

                  {/* Active Laser Force Beam Gradient */}
                  <linearGradient id={`laserBeam-${b.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff0844" stopOpacity="0.3" />
                    <stop offset="25%" stopColor="#ff0844" stopOpacity="1" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="75%" stopColor="#ff0844" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ff0844" stopOpacity="0.3" />
                  </linearGradient>

                  {/* Center Lock Core Glow */}
                  <radialGradient id={`coreGlow-${b.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ff4b72" />
                    <stop offset="60%" stopColor="#be123c" />
                    <stop offset="100%" stopColor="#1c040d" />
                  </radialGradient>
                </defs>

                {/* Transverse Heavy Security Rail Chassis */}
                <rect
                  x="8"
                  y="12"
                  width="48"
                  height="8"
                  rx="4"
                  fill={`url(#clampGrad-${b.id})`}
                  stroke="#ff0844"
                  strokeWidth="1.5"
                />

                {/* Left Conduit Clamp Shoe */}
                <rect
                  x="4"
                  y="6"
                  width="10"
                  height="20"
                  rx="3"
                  fill="#0b0f1d"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                />
                <circle cx="9" cy="11" r="1.5" fill="#f43f5e" />
                <circle cx="9" cy="21" r="1.5" fill="#f43f5e" />

                {/* Right Conduit Clamp Shoe */}
                <rect
                  x="50"
                  y="6"
                  width="10"
                  height="20"
                  rx="3"
                  fill="#0b0f1d"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                />
                <circle cx="55" cy="11" r="1.5" fill="#f43f5e" />
                <circle cx="55" cy="21" r="1.5" fill="#f43f5e" />

                {/* High-Voltage Crimson Laser Barrier Line across Conduit */}
                <line
                  x1="12"
                  y1="16"
                  x2="52"
                  y2="16"
                  stroke={`url(#laserBeam-${b.id})`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line
                  x1="16"
                  y1="16"
                  x2="48"
                  y2="16"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Central 3D Cyber Lock Nucleus */}
                <circle
                  cx="32"
                  cy="16"
                  r="9"
                  fill={`url(#coreGlow-${b.id})`}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
                {/* Security Keyhole / Padlock Geometry */}
                <path
                  d="M 29.5 14.5 A 2.5 2.5 0 0 1 34.5 14.5 V 16 H 29.5 Z M 28.5 16 H 35.5 V 19 H 28.5 Z"
                  fill="#ffffff"
                />
                <circle cx="32" cy="17.2" r="0.8" fill="#ff0844" />
              </svg>
            </div>
          );
        }

        // FUTURE BLOCKER: Dark Inactive Mechanical Barricade Clamp (Zero Text)
        return (
          <div
            key={b.id}
            className="absolute z-10 select-none pointer-events-none opacity-70"
            style={{
              left: `${(b.x / SVG_WIDTH) * 100}%`,
              top: `${b.y}px`,
              transform: 'translate(-50%, -50%) translateZ(12px)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Dormant Mechanical Track Clamp Object */}
            <svg
              width="44"
              height="22"
              viewBox="0 0 44 22"
              className="overflow-visible select-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
            >
              {/* Transverse Crossbar */}
              <rect
                x="6"
                y="8"
                width="32"
                height="6"
                rx="3"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="1.2"
              />
              {/* Left Clamp Foot */}
              <rect
                x="3"
                y="4"
                width="7"
                height="14"
                rx="2"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1"
              />
              {/* Right Clamp Foot */}
              <rect
                x="34"
                y="4"
                width="7"
                height="14"
                rx="2"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1"
              />
              {/* Center Mechanical Lock Core with Dim Crimson Diode */}
              <circle
                cx="22"
                cy="11"
                r="5.5"
                fill="#0b0f1d"
                stroke="#475569"
                strokeWidth="1.2"
              />
              <circle cx="22" cy="11" r="2" fill="#be123c" opacity="0.8" />
            </svg>
          </div>
        );
      })}

      {/* 2. Major Sector Forcefield Gateways (Pure Visual Laser Arch - No Red Text Pill) */}
      {obstacles.map((obs) => {
        if (obs.type === 'forcefield') {
          const isLocked = obs.locked;
          const laserColor = isLocked ? '#ff0844' : '#10b981';
          const laserGlow = isLocked ? 'rgba(255, 8, 68, 0.7)' : 'rgba(16, 185, 129, 0.6)';

          return (
            <div
              key={obs.id}
              className="absolute z-10 flex flex-col items-center pointer-events-none select-none"
              style={{
                left: `${(obs.x / SVG_WIDTH) * 100}%`,
                top: `${obs.y}px`,
                transform: 'translateX(-50%) translateZ(30px) rotateX(-14deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Visual Laser Forcefield Arch stretched across the Roadmap */}
              <div className="relative flex items-center justify-between w-64 h-8 px-1">
                {/* Left Emitter Pylon */}
                <div
                  className="w-4 h-8 rounded-sm flex flex-col items-center justify-between py-1 border shadow-lg"
                  style={{
                    backgroundColor: '#0a0f24',
                    borderColor: laserColor,
                    boxShadow: `0 0 10px ${laserGlow}`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: laserColor,
                      boxShadow: `0 0 6px ${laserColor}`,
                    }}
                  />
                  <span className="w-2 h-0.5 bg-slate-500 rounded-full" />
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: laserColor }}
                  />
                </div>

                {/* Laser Forcefield Beam Line */}
                <div className="flex-1 relative mx-1 h-2 flex items-center">
                  <div
                    className="w-full h-1 rounded-full"
                    style={{
                      backgroundColor: laserColor,
                      boxShadow: `0 0 14px ${laserColor}, 0 0 22px ${laserGlow}`,
                    }}
                  />
                  <div
                    className="absolute inset-x-4 h-[1.5px] bg-white rounded-full opacity-80"
                  />
                </div>

                {/* Right Emitter Pylon */}
                <div
                  className="w-4 h-8 rounded-sm flex flex-col items-center justify-between py-1 border shadow-lg"
                  style={{
                    backgroundColor: '#0a0f24',
                    borderColor: laserColor,
                    boxShadow: `0 0 10px ${laserGlow}`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: laserColor,
                      boxShadow: `0 0 6px ${laserColor}`,
                    }}
                  />
                  <span className="w-2 h-0.5 bg-slate-500 rounded-full" />
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: laserColor }}
                  />
                </div>
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
              }}
            >
              {/* Pure SVG Vector Plasma Orb */}
              <svg width="34" height="34" viewBox="0 0 34 34" className="overflow-visible select-none">
                <defs>
                  <radialGradient id={`plasma-grad-${obs.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                    <stop offset="65%" stopColor="#e11d48" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#881337" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="17" cy="17" r="16" fill={`url(#plasma-grad-${obs.id})`} />
                <circle cx="17" cy="17" r="13" fill="#140308" stroke="#f43f5e" strokeWidth="1.75" />
                <circle cx="17" cy="17" r="10.5" fill="none" stroke="#fb7185" strokeWidth="0.75" strokeOpacity="0.7" />
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
