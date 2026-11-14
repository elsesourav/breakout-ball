import React, { useState, useEffect } from 'react';
import { Achievement } from '../../types/game';
import { achievementManager } from '../../services/achievements';
import { Trophy, Zap, Sparkles, Flame, Crown, Shield, Target, Compass, Timer, Palette, Globe, Lock, Check } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  flame: Flame,
  sparkles: Sparkles,
  compass: Compass,
  target: Target,
  timer: Timer,
  shield: Shield,
  crown: Crown,
  palette: Palette,
  globe: Globe,
};

export const AchievementsList: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked'>('all');

  useEffect(() => {
    setAchievements(achievementManager.getAll());
    const unsub = achievementManager.onUnlock(() => {
      setAchievements(achievementManager.getAll());
    });
    return unsub;
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progressPercent = Math.round((unlockedCount / Math.max(1, achievements.length)) * 100);

  const displayedList = filter === 'unlocked' ? achievements.filter((a) => a.unlocked) : achievements;

  return (
    <div className="w-full max-w-sm rounded-xl bg-[#080d26]/90 border border-white/10 p-3.5 flex flex-col gap-3 shadow-lg backdrop-blur-xl">
      {/* Header with Progress Bar */}
      <div className="flex flex-col gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-display font-black text-xs tracking-wider uppercase">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Trophy Hall</span>
          </div>
          <span className="font-tech text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300">
            {unlockedCount} / {achievements.length} UNLOCKED
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 shadow-[0_0_10px_#f59e0b]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1.5 mt-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            ALL ({achievements.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unlocked')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold transition-all cursor-pointer ${
              filter === 'unlocked'
                ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            UNLOCKED ({unlockedCount})
          </button>
        </div>
      </div>

      {/* Achievements Cards List */}
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
        {displayedList.map((ach) => {
          const IconComp = ICON_MAP[ach.icon] || Trophy;
          return (
            <div
              key={ach.id}
              style={{
                backgroundColor: ach.unlocked ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 0, 0, 0.3)',
                border: ach.unlocked ? '1.5px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '12px',
              }}
              className="p-2.5 flex items-center gap-3 transition-all"
            >
              <div
                style={{
                  backgroundColor: ach.unlocked ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: ach.unlocked ? '1px solid #ffd700' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: ach.unlocked ? '#ffd700' : '#64748b',
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <IconComp className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h5 className={`font-tech font-bold text-xs truncate ${ach.unlocked ? 'text-white' : 'text-slate-400'}`}>
                    {ach.title}
                  </h5>
                  {ach.unlocked ? (
                    <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Lock className="w-2.5 h-2.5 text-slate-500 flex-shrink-0" />
                  )}
                </div>
                <p className="font-ui text-[10px] text-slate-400 leading-tight truncate mt-0.5">
                  {ach.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
