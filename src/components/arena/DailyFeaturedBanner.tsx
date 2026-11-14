import React from 'react';
import { useGame } from '../../context/GameContext';
import { LevelData } from '../../types/game';
import { Sparkles, Play, Flame, Award } from 'lucide-react';

interface DailyFeaturedBannerProps {
  levels: LevelData[];
}

export const DailyFeaturedBanner: React.FC<DailyFeaturedBannerProps> = ({ levels }) => {
  const { startPlayLevel } = useGame();

  if (!levels || levels.length === 0) return null;

  // Select deterministic daily level based on current day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const featuredLevel = levels[dayOfYear % levels.length] || levels[0];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(14, 25, 65, 0.95) 0%, rgba(30, 10, 50, 0.95) 100%)',
        border: '1.5px solid rgba(255, 215, 0, 0.55)',
        boxShadow: '0 0 16px rgba(255, 215, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        flexShrink: 0,
      }}
      className="w-full max-w-sm px-3 py-2 flex flex-col gap-1.5 relative overflow-hidden select-none shrink-0"
    >
      {/* Subtle Radiant Corner Glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-amber-500/15 blur-xl pointer-events-none" />

      {/* Header Tag Row: Compact badge + 2x reputation */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-tech text-[9px] font-bold shadow-[0_0_6px_rgba(255,215,0,0.25)]">
          <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-spin-slow" />
          <span>DAILY APEX MISSION</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-tech text-amber-400 font-bold">
          <Award className="w-3 h-3" />
          <span>2X REPUTATION</span>
        </div>
      </div>

      {/* Main Info Row: Title, meta details, and Play button */}
      <div className="flex items-center justify-between gap-2.5 z-10">
        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="font-display font-black text-xs text-white truncate tracking-wide leading-tight">
            {featuredLevel.name || `Core #${featuredLevel.id}`}
          </h3>
          <p className="font-ui text-[10px] text-slate-300 flex items-center gap-1.5 truncate mt-0.5">
            <span>By @{featuredLevel.creator}</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-400 font-tech">#{featuredLevel.id}</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-tech flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 fill-amber-400" />
              {featuredLevel.playCount || 0}
            </span>
          </p>
        </div>

        {/* Quick Launch Button */}
        <button
          type="button"
          onClick={() => startPlayLevel(featuredLevel)}
          style={{
            backgroundColor: '#ffd700',
            color: '#000000',
            boxShadow: '0 0 12px rgba(255, 215, 0, 0.6)',
            borderRadius: '10px',
          }}
          className="px-3 py-1.5 flex items-center gap-1 font-display font-black text-[11px] hover:brightness-110 active:scale-95 transition-all cursor-pointer flex-shrink-0"
        >
          <Play className="w-3 h-3 fill-black" />
          <span>PLAY</span>
        </button>
      </div>
    </div>
  );
};
