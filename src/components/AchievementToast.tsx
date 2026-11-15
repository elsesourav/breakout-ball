import React, { useState, useEffect } from 'react';
import { Achievement } from '../types/game';
import { achievementManager } from '../services/achievements';
import { synthAudio } from '../utils/synthAudio';
import { Trophy, Zap, Flame, Crown, Shield, Target, Compass, Timer, Palette, Globe, X } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  flame: Flame,
  sparkles: Zap,
  compass: Compass,
  target: Target,
  timer: Timer,
  shield: Shield,
  crown: Crown,
  palette: Palette,
  globe: Globe,
};

export const AchievementToast: React.FC = () => {
  const [activeToast, setActiveToast] = useState<Achievement | null>(null);

  useEffect(() => {
    const unsub = achievementManager.onUnlock((ach) => {
      setActiveToast(ach);
      synthAudio.playAchievementChime();
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  if (!activeToast) return null;

  const IconComp = ICON_MAP[activeToast.icon] || Trophy;

  return (
    <div
      style={{
        zIndex: 9999,
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '380px',
        backgroundColor: 'rgba(5, 10, 30, 0.96)',
        border: '1.5px solid #ffd700',
        boxShadow: '0 0 25px rgba(255, 215, 0, 0.45), inset 0 0 12px rgba(255, 215, 0, 0.15)',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
      }}
      className="p-3 flex items-center gap-3 animate-bounce-short select-none"
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 215, 0, 0.15)',
          border: '1.5px solid #ffd700',
          boxShadow: '0 0 12px rgba(255, 215, 0, 0.5)',
        }}
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-300"
      >
        <IconComp className="w-5 h-5 fill-amber-300/40 text-amber-300" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 text-[10px] font-tech font-bold text-amber-400 tracking-widest uppercase">
          <Trophy className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>ACHIEVEMENT UNLOCKED</span>
        </div>
        <h4 className="font-display font-black text-sm text-white truncate tracking-wide">
          {activeToast.title}
        </h4>
        <p className="font-ui text-xs text-slate-300 truncate">
          {activeToast.description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setActiveToast(null)}
        className="p-1 rounded-md text-slate-400 hover:text-white transition-all cursor-pointer flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
