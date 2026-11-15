import React, { useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { BALL_UPGRADES, UpgradeState, getUpgradeCost } from '../../constants/upgrades';
import { UpgradeCard } from './UpgradeCard';
import { GameBallIcon } from './InGameIcons';

interface BallTabProps {
  upgrades: UpgradeState;
  cores: number;
  onUpgrade: (id: string) => void;
}

const BALL_SKIN_PALETTES: Record<string, { c1: string; c2: string; c3: string; glow: string }> = {
  cyan: { c1: '#ffffff', c2: '#7df9ff', c3: '#00f7ff', glow: '#00f7ff' },
  fire: { c1: '#ffffff', c2: '#ff9900', c3: '#ff0055', glow: '#ff5500' },
  void: { c1: '#ffffff', c2: '#e879f9', c3: '#7c3aed', glow: '#c084fc' },
  matrix: { c1: '#ffffff', c2: '#6ee7b7', c3: '#059669', glow: '#10b981' },
  gold: { c1: '#ffffff', c2: '#fef08a', c3: '#eab308', glow: '#ffd700' },
};

export const BallTab: React.FC<BallTabProps> = ({ upgrades, cores, onUpgrade }) => {
  const { settings } = useGame();
  const currentSkin = settings.ballSkin || 'cyan';
  const palette = BALL_SKIN_PALETTES[currentSkin] || BALL_SKIN_PALETTES.cyan;

  const sizeLvl = upgrades['ball_size'] || 1;
  const speedLvl = upgrades['ball_speed'] || 1;
  const impactLvl = upgrades['ball_impact'] || 1;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // In-Game Live Canvas Rendering for the 3D Ball
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    // Base radius 22px, dynamically scales up with ball_size upgrade
    const baseRadius = 22;
    const radius = baseRadius * (1 + (sizeLvl - 1) * 0.08);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // 1. Orbital Velocity Motes (Rotates faster with ball_speed upgrade)
      angle += 0.035 * (1 + (speedLvl - 1) * 0.12);
      const orbitCount = 4;
      const orbitR = radius + 14 + (impactLvl - 1) * 1.5;

      ctx.save();
      for (let i = 0; i < orbitCount; i++) {
        const a = angle + (i * Math.PI * 2) / orbitCount;
        const ox = cx + Math.cos(a) * orbitR;
        const oy = cy + Math.sin(a) * orbitR;
        ctx.fillStyle = palette.c3;
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Shockwave Aura Ring (Pulsates with Impact Power)
      if (impactLvl > 1) {
        ctx.save();
        ctx.strokeStyle = palette.c3;
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 1 + (impactLvl - 1) * 0.35;
        ctx.globalAlpha = 0.4 + Math.sin(angle * 2.5) * 0.25;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. 3D Spherical Neon Ball with Radial Specular Highlight
      ctx.save();
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 24;

      const grad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.08,
        cx,
        cy,
        radius
      );
      grad.addColorStop(0, palette.c1);
      grad.addColorStop(0.35, palette.c2);
      grad.addColorStop(1, palette.c3);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Specular High-Gloss Outer Rim
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [palette, sizeLvl, speedLvl, impactLvl]);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Live 3D In-Game Ball Visualizer */}
      <div
        style={{
          backgroundColor: 'rgba(8, 13, 38, 0.94)',
          border: '1.2px solid rgba(0, 247, 255, 0.35)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 16px rgba(0, 247, 255, 0.15)',
          borderRadius: '18px',
        }}
        className="p-4 flex flex-col items-center gap-3 relative overflow-hidden"
      >
        <div className="w-full flex items-center justify-between text-[10px] font-tech text-cyan-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            LIVE BALL KINETICS
          </span>
          <span className="text-slate-400">CYBER SPHERE</span>
        </div>

        {/* Dynamic Canvas Presentation Box */}
        <div
          style={{ border: '1px solid rgba(0, 247, 255, 0.22)' }}
          className="w-full h-28 flex items-center justify-center relative bg-black/40 rounded-xl overflow-hidden"
        >
          {/* Subtle Cyber Grid Backdrop */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,247,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,247,255,0.4) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          <canvas ref={canvasRef} width={110} height={110} className="w-28 h-28 z-10" />

          {/* Calibrated Radius Indicator */}
          <div className="absolute bottom-1.5 flex items-center gap-1 font-mono text-[9px] text-cyan-300/80 z-10">
            <span>◀</span>
            <span className="font-bold tracking-wider">
              {Math.round(22 * (1 + (sizeLvl - 1) * 0.08))}PX RADIUS (+{(sizeLvl - 1) * 5}%)
            </span>
            <span>▶</span>
          </div>
        </div>

        {/* Realtime 3-Column Stat Badges */}
        <div className="w-full grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-black/50 border border-purple-500 flex flex-col items-center">
            <span className="text-[8.5px] font-tech text-slate-400 uppercase">RADIUS</span>
            <span className="font-tech font-black text-xs text-purple-300">
              +{sizeLvl * 5}%
            </span>
          </div>
          <div className="p-2 rounded-xl bg-black/50 border border-cyan-500/20 flex flex-col items-center">
            <span className="text-[8.5px] font-tech text-slate-400 uppercase">VELOCITY</span>
            <span className="font-tech font-black text-xs text-cyan-300">
              +{speedLvl * 8}%
            </span>
          </div>
          <div className="p-2 rounded-xl bg-black/50 border border-rose-500/20 flex flex-col items-center">
            <span className="text-[8.5px] font-tech text-slate-400 uppercase">IMPACT</span>
            <span className="font-tech font-black text-xs text-rose-300">
              +{impactLvl * 12}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Ball Kinetics Upgrades List */}
      <div className="flex items-center justify-between text-[11px] font-tech text-cyan-400 uppercase tracking-wider px-1 pt-1">
        <span>⚡ BALL KINETIC MODULES</span>
        <span>LEVEL 1–10</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {BALL_UPGRADES.map((upgrade) => {
          const level = upgrades[upgrade.id] || 1;
          const cost = getUpgradeCost(upgrade.baseCost, level);
          const isSize = upgrade.id === 'ball_size';

          return (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              level={level}
              cores={cores}
              cost={cost}
              onUpgrade={onUpgrade}
              icon={
                <GameBallIcon
                  sizeMultiplier={isSize ? 0.75 + level * 0.1 : 1}
                  size={26}
                  skin={currentSkin}
                />
              }
            />
          );
        })}
      </div>
    </div>
  );
};
