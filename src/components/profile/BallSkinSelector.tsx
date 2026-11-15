import React, { useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { BallSkin } from '../../types/game';
import { Palette, Check } from 'lucide-react';

interface SkinOption {
  id: BallSkin;
  name: string;
  theme: string;
  color: string;
  glow: string;
  gradient: [string, string, string];
}

const SKINS: SkinOption[] = [
  {
    id: 'cyan',
    name: 'Cyber Pulse',
    theme: 'Neo Tokyo',
    color: '#00f7ff',
    glow: 'rgba(0, 247, 255, 0.7)',
    gradient: ['#ffffff', '#7df9ff', '#00f7ff'],
  },
  {
    id: 'fire',
    name: 'Solar Flare',
    theme: 'Inferno',
    color: '#ff4500',
    glow: 'rgba(255, 69, 0, 0.7)',
    gradient: ['#ffffff', '#ff9900', '#ff0055'],
  },
  {
    id: 'void',
    name: 'Hyper Void',
    theme: 'Nebula',
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.7)',
    gradient: ['#ffffff', '#e879f9', '#7c3aed'],
  },
  {
    id: 'matrix',
    name: 'Matrix Glitch',
    theme: 'Cybernetic',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.7)',
    gradient: ['#ffffff', '#6ee7b7', '#059669'],
  },
  {
    id: 'gold',
    name: 'Golden Apex',
    theme: 'Champion',
    color: '#ffd700',
    glow: 'rgba(255, 215, 0, 0.7)',
    gradient: ['#ffffff', '#fef08a', '#eab308'],
  },
];

export const BallSkinSelector: React.FC = () => {
  const { settings, updateSettings } = useGame();
  const currentSkin: BallSkin = settings.ballSkin || 'cyan';
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated live orb preview on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;
    const skinData = SKINS.find((s) => s.id === currentSkin) || SKINS[0];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = 16;

      angle += 0.04;
      const pulse = Math.sin(angle) * 2;

      // Orbiting particles
      for (let i = 0; i < 4; i++) {
        const pAngle = angle + (i * Math.PI) / 2;
        const px = cx + Math.cos(pAngle) * (r + 10 + pulse);
        const py = cy + Math.sin(pAngle) * (r + 10 + pulse);
        ctx.fillStyle = skinData.color;
        ctx.shadowColor = skinData.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ball glow & sphere
      ctx.shadowColor = skinData.color;
      ctx.shadowBlur = 18 + pulse * 2;

      const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
      grad.addColorStop(0, skinData.gradient[0]);
      grad.addColorStop(0.3, skinData.gradient[1]);
      grad.addColorStop(1, skinData.gradient[2]);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Specular rim
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [currentSkin]);

  return (
    <div className="w-full max-w-sm rounded-xl bg-[#080d26]/90 border border-cyan-500/25 p-3.5 flex flex-col gap-3 shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-2 text-cyan-400 font-display font-black text-xs tracking-wider uppercase">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span>Ball Core Energy</span>
        </div>
        <span className="font-tech text-[10px] font-bold text-slate-400">
          CYBER HANGAR
        </span>
      </div>

      {/* Live Preview Display */}
      <div className="flex items-center justify-between bg-black/40 border border-cyan-500/15 rounded-xl p-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-tech text-slate-400 uppercase tracking-widest">
            ACTIVE CORE
          </span>
          <h4
            style={{ color: (SKINS.find((s) => s.id === currentSkin) || SKINS[0]).color }}
            className="font-display font-black text-sm tracking-wide"
          >
            {(SKINS.find((s) => s.id === currentSkin) || SKINS[0]).name}
          </h4>
          <span className="text-[10px] font-ui text-slate-400">
            {(SKINS.find((s) => s.id === currentSkin) || SKINS[0]).theme} Edition
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={70}
          height={70}
          className="w-[70px] h-[70px] block"
        />
      </div>

      {/* Skin Selection Chips (5 horizontal slots) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: '6px',
        }}
        className="w-full mt-1"
      >
        {SKINS.map((skin) => {
          const isSelected = currentSkin === skin.id;
          return (
            <button
              key={skin.id}
              type="button"
              onClick={() => updateSettings({ ballSkin: skin.id })}
              style={{
                borderColor: isSelected ? skin.color : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: isSelected ? `${skin.color}25` : 'rgba(255, 255, 255, 0.03)',
                boxShadow: isSelected ? `0 0 12px ${skin.glow}` : 'none',
              }}
              className="flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 group"
            >
              <div
                style={{
                  backgroundColor: skin.color,
                  boxShadow: `0 0 8px ${skin.color}`,
                }}
                className="w-5 h-5 rounded-full flex items-center justify-center"
              >
                {isSelected && <Check className="w-3 h-3 text-black stroke-[3.5]" />}
              </div>
              <span className="text-[9px] font-tech font-bold text-slate-300 group-hover:text-white truncate max-w-[50px]">
                {skin.id.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
