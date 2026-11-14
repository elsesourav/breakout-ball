import React, { useRef, useEffect, useState, useMemo } from 'react';
import { LevelData } from '../../types/game';
import { drawLevelPreviewOnCanvas, calculateLevelHp } from '../../utils/helpers';
import { User, Flame } from 'lucide-react';

interface ArenaLevelCardProps {
  level: LevelData;
  onClick: () => void;
}

export const ArenaLevelCard: React.FC<ArenaLevelCardProps> = ({ level, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayW = canvas.clientWidth || 150;
      const displayH = canvas.clientHeight || 105;
      canvas.width = Math.round(displayW * dpr);
      canvas.height = Math.round(displayH * dpr);
      drawLevelPreviewOnCanvas(canvas, level.blocks, canvas.width, canvas.height);
    }
  }, [level]);

  const stats = useMemo(() => calculateLevelHp(level.blocks), [level]);

  // Clean compact format for play count: e.g. 2314 -> 2.3k, 940 -> 940
  const formattedPlays = useMemo(() => {
    const p = level.playCount || 0;
    if (p >= 1000) {
      return `${(p / 1000).toFixed(1)}k`;
    }
    return String(p);
  }, [level.playCount]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'rgba(8, 13, 36, 0.94)',
        border: isHovered
          ? '1.5px solid #00f7ff'
          : '1.5px solid rgba(0, 247, 255, 0.22)',
        boxShadow: isHovered
          ? '0 0 18px rgba(0, 247, 255, 0.35), inset 0 0 10px rgba(0, 247, 255, 0.08)'
          : '0 4px 12px rgba(0, 0, 0, 0.4)',
        borderRadius: '14px',
      }}
      className="relative flex flex-col overflow-hidden active:scale-[0.98] transition-all duration-200 cursor-pointer group"
    >
      {/* HiDPI Canvas Preview Section */}
      <div className="w-full h-26 bg-[#040614] relative overflow-hidden border-b border-cyan-500/20">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: '100%', height: '104px' }}
        />

        {/* Subtle Cyber Grid Lines inside preview */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 247, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 247, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Top-Left: Stage ID Badge */}
        <div
          style={{
            backgroundColor: 'rgba(3, 6, 20, 0.85)',
            border: '1px solid rgba(0, 247, 255, 0.45)',
            color: '#00f7ff',
            backdropFilter: 'blur(6px)',
          }}
          className="absolute top-2 left-2 px-1.5 py-0.5 rounded font-tech text-[9px] font-bold shadow-[0_0_8px_rgba(0,247,255,0.25)] flex items-center"
        >
          #{level.id}
        </div>

        {/* Top-Right: Brick Count Badge */}
        <div
          style={{
            backgroundColor: 'rgba(3, 6, 20, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            backdropFilter: 'blur(6px)',
          }}
          className="absolute top-2 right-2 px-1.5 py-0.5 rounded font-tech text-[9px] font-bold flex items-center"
        >
          {stats.breakableCount} BRICKS
        </div>
      </div>

      {/* Details Bar (Sleek 2-row layout with zero overflow) */}
      <div className="p-2.5 flex flex-col gap-1">
        {/* Row 1: Full Level Title (Truncated smoothly without colliding) */}
        <div className="w-full min-w-0">
          <h4 className="font-tech font-black text-xs text-white truncate group-hover:text-cyan-300 transition-colors leading-tight">
            {level.name || `Core #${level.id}`}
          </h4>
        </div>

        {/* Row 2: Creator Handle & Plays */}
        <div className="flex items-center justify-between text-[10px] font-ui pt-1 border-t border-white/10 gap-1.5">
          <span className="flex items-center gap-1 min-w-0 flex-1 text-slate-300 truncate">
            <User className="w-2.5 h-2.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">@{level.creator}</span>
          </span>

          <span className="flex items-center gap-1 text-amber-300 font-tech font-bold flex-shrink-0">
            <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span>{formattedPlays}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
