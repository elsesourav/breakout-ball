import React, { useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { BallSkin } from '../../types/game';
import { BALL_UPGRADES, UpgradeState, getUpgradeCost } from '../../constants/upgrades';
import { UpgradeCard } from './UpgradeCard';
import { GameBallIcon } from './InGameIcons';
import { Check } from 'lucide-react';

interface BallTabProps {
  upgrades: UpgradeState;
  cores: number;
  onUpgrade: (id: string) => void;
}

const SKINS: {
  id: BallSkin;
  name: string;
  theme: string;
  color: string;
  glow: string;
  gradient: [string, string, string];
}[] = [
  {
    id: 'cyan',
    name: 'Cyber Pulse',
    theme: 'Neo Tokyo Edition',
    color: '#00f7ff',
    glow: 'rgba(0, 247, 255, 0.7)',
    gradient: ['#ffffff', '#7df9ff', '#00f7ff'],
  },
  {
    id: 'fire',
    name: 'Solar Flare',
    theme: 'Inferno Edition',
    color: '#ff4500',
    glow: 'rgba(255, 69, 0, 0.7)',
    gradient: ['#ffffff', '#ff9900', '#ff0055'],
  },
  {
    id: 'void',
    name: 'Hyper Void',
    theme: 'Nebula Edition',
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.7)',
    gradient: ['#ffffff', '#e879f9', '#7c3aed'],
  },
  {
    id: 'matrix',
    name: 'Matrix Glitch',
    theme: 'Cybernetic Edition',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.7)',
    gradient: ['#ffffff', '#6ee7b7', '#059669'],
  },
  {
    id: 'gold',
    name: 'Golden Apex',
    theme: 'Champion Edition',
    color: '#ffd700',
    glow: 'rgba(255, 215, 0, 0.7)',
    gradient: ['#ffffff', '#fef08a', '#eab308'],
  },
];

export const BallTab: React.FC<BallTabProps> = ({ upgrades, cores, onUpgrade }) => {
  const { settings, updateSettings } = useGame();
  const currentSkin: BallSkin = settings.ballSkin || 'cyan';
  const activeSkinObj = SKINS.find((s) => s.id === currentSkin) || SKINS[0];

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

    const baseRadius = 24;
    // Dynamic radius scaling based on ball_size upgrade
    const radius = baseRadius * (1 + (sizeLvl - 1) * 0.08);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // 1. Orbital Motes (Rotates faster with ball_speed upgrade)
      angle += 0.03 * (1 + (speedLvl - 1) * 0.12);
      const orbitCount = 4;
      const orbitR = radius + 14 + (impactLvl - 1) * 1.5;

      ctx.save();
      for (let i = 0; i < orbitCount; i++) {
        const a = angle + (i * Math.PI * 2) / orbitCount;
        const ox = cx + Math.cos(a) * orbitR;
        const oy = cy + Math.sin(a) * orbitR;
        ctx.fillStyle = activeSkinObj.color;
        ctx.shadowColor = activeSkinObj.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Shockwave Aura Ring (Pulsates with Impact Power)
      if (impactLvl > 1) {
        ctx.save();
        ctx.strokeStyle = activeSkinObj.color;
        ctx.shadowColor = activeSkinObj.color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 1 + (impactLvl - 1) * 0.3;
        ctx.globalAlpha = 0.35 + Math.sin(angle * 2) * 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. 3D Spherical Neon Ball
      ctx.save();
      ctx.shadowColor = activeSkinObj.glow;
      ctx.shadowBlur = 24;

      const grad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.08,
        cx,
        cy,
        radius
      );
      grad.addColorStop(0, activeSkinObj.gradient[0]);
      grad.addColorStop(0.35, activeSkinObj.gradient[1]);
      grad.addColorStop(1, activeSkinObj.gradient[2]);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Specular High-Gloss Rim
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [currentSkin, activeSkinObj, sizeLvl, speedLvl, impactLvl]);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Live 3D Ball & Core Energy Skin Visualizer */}
      <div
        style={{
          backgroundColor: 'rgba(8, 13, 38, 0.94)',
          border: '1.2px solid rgba(0, 247, 255, 0.35)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 16px rgba(0, 247, 255, 0.15)',
          borderRadius: '18px',
        }}
        className="p-4 flex flex-col gap-3 relative overflow-hidden"
      >
        <div className="w-full flex items-center justify-between text-[10px] font-tech text-cyan-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            LIVE BALL CORE ENERGY
          </span>
          <span className="text-slate-400">CYBER SPHERE</span>
        </div>

        {/* Dynamic Canvas & Active Skin Info */}
        <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-cyan-500/15">
          <div className="flex flex-col">
            <span className="text-[9px] font-tech text-slate-400 uppercase tracking-wider font-semibold">
              ACTIVE MATRIX CORE
            </span>
            <span
              style={{ color: activeSkinObj.color, textShadow: `0 0 10px ${activeSkinObj.glow}` }}
              className="font-display font-black text-base tracking-wide"
            >
              {activeSkinObj.name}
            </span>
            <span className="text-[10px] font-tech text-slate-400 uppercase">
              {activeSkinObj.theme}
            </span>
          </div>

          <div className="w-20 h-20 flex items-center justify-center shrink-0">
            <canvas ref={canvasRef} width={80} height={80} className="w-20 h-20" />
          </div>
        </div>

        {/* 5 Core Energy Skins Selector */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {SKINS.map((skin) => {
            const isSelected = skin.id === currentSkin;
            return (
              <button
                key={skin.id}
                type="button"
                onClick={() => updateSettings({ ballSkin: skin.id })}
                style={{
                  border: isSelected
                    ? `1.5px solid ${skin.color}`
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isSelected ? `0 0 12px ${skin.glow}` : 'none',
                  backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)',
                }}
                className="py-2 flex flex-col items-center gap-1.5 rounded-xl transition-all cursor-pointer hover:border-slate-500 active:scale-95"
              >
                <div
                  style={{
                    backgroundColor: skin.color,
                    boxShadow: `0 0 8px ${skin.glow}`,
                  }}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-black"
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3] text-black" />}
                </div>
                <span
                  style={{ color: isSelected ? skin.color : '#94a3b8' }}
                  className="font-tech text-[9px] font-bold uppercase tracking-wider"
                >
                  {skin.id}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Ball Kinetics Upgrades List */}
      <div className="flex items-center justify-between text-[11px] font-tech text-indigo-400 uppercase tracking-wider px-1 pt-1">
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
