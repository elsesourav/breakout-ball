import React, { useState, useEffect } from 'react';
import { Achievement } from '../../types/game';
import { achievementManager } from '../../services/achievements';
import { Trophy, Award, Zap, Flame, Crown, Shield, Target, Compass, Timer, Palette, Globe, Lock, Check } from 'lucide-react';

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
    <div
      style={{
        backgroundColor: 'rgba(8, 12, 36, 0.94)',
        border: '1.5px solid rgba(0, 247, 255, 0.28)',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.55), 0 0 20px rgba(0, 247, 255, 0.12)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      className="w-full h-full backdrop-blur-xl"
    >
      {/* 1. Fixed Header with Progress Bar & Filters */}
      <div className="flex flex-col gap-2.5 p-3.5 border-b border-cyan-500/15 bg-cyan-950/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-display font-black text-xs text-white tracking-wider leading-tight">
                BADGES SHOWCASE
              </h3>
              <span className="font-tech text-[10px] text-amber-400 tracking-widest mt-0.5">
                PILOT ACCOMPLISHMENTS
              </span>
            </div>
          </div>

          <span className="font-tech text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 shadow-[0_0_8px_rgba(255,215,0,0.2)]">
            {unlockedCount} / {achievements.length} UNLOCKED
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden p-0.5 border border-cyan-500/25">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-500 shadow-[0_0_10px_#f59e0b]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            style={
              filter === 'all'
                ? {
                    background: 'linear-gradient(135deg, #ffd700 0%, #d97706 100%)',
                    color: '#000000',
                    border: '1px solid #ffd700',
                    boxShadow: '0 0 10px rgba(255, 215, 0, 0.35)',
                  }
                : {
                    background: 'rgba(5, 8, 22, 0.6)',
                    color: '#94a3b8',
                    border: '1px solid rgba(0, 247, 255, 0.2)',
                  }
            }
            className="px-3 py-1 rounded-lg text-[10px] font-tech font-bold transition-all cursor-pointer"
          >
            ALL ({achievements.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unlocked')}
            style={
              filter === 'unlocked'
                ? {
                    background: 'linear-gradient(135deg, #ffd700 0%, #d97706 100%)',
                    color: '#000000',
                    border: '1px solid #ffd700',
                    boxShadow: '0 0 10px rgba(255, 215, 0, 0.35)',
                  }
                : {
                    background: 'rgba(5, 8, 22, 0.6)',
                    color: '#94a3b8',
                    border: '1px solid rgba(0, 247, 255, 0.2)',
                  }
            }
            className="px-3 py-1 rounded-lg text-[10px] font-tech font-bold transition-all cursor-pointer"
          >
            UNLOCKED ({unlockedCount})
          </button>
        </div>
      </div>

      {/* 2. Independently Scrollable Achievements Cards List */}
      <div
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 no-scrollbar"
        data-inner-scroll="true"
      >
        {displayedList.map((ach) => {
          const IconComp = ICON_MAP[ach.icon] || Trophy;
          return (
            <div
              key={ach.id}
              style={{
                backgroundColor: ach.unlocked
                  ? 'rgba(255, 215, 0, 0.08)'
                  : 'rgba(5, 8, 24, 0.6)',
                border: ach.unlocked
                  ? '1.5px solid rgba(255, 215, 0, 0.45)'
                  : '1.2px solid rgba(0, 247, 255, 0.16)',
                borderRadius: '16px',
                boxShadow: ach.unlocked
                  ? '0 0 14px rgba(255, 215, 0, 0.12)'
                  : 'none',
              }}
              className="p-3 flex items-center gap-3 transition-all hover:border-cyan-400/40"
            >
              <div
                style={{
                  backgroundColor: ach.unlocked
                    ? 'rgba(255, 215, 0, 0.2)'
                    : 'rgba(0, 247, 255, 0.05)',
                  border: ach.unlocked ? '1.5px solid #ffd700' : '1.2px solid rgba(0, 247, 255, 0.2)',
                  color: ach.unlocked ? '#ffd700' : '#64748b',
                  boxShadow: ach.unlocked ? '0 0 10px rgba(255, 215, 0, 0.35)' : 'none',
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <IconComp className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h5
                    className={`font-tech font-bold text-xs truncate ${
                      ach.unlocked ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {ach.title}
                  </h5>
                  {ach.unlocked ? (
                    <Check className="w-3.5 h-3.5 text-amber-300 stroke-[2.5] flex-shrink-0" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  )}
                </div>
                <p className="font-ui text-[11px] text-slate-300 leading-snug line-clamp-2 mt-0.5">
                  {ach.description}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                <span
                  className={`font-tech font-bold text-[9px] px-2 py-0.5 rounded-full tracking-wider ${
                    ach.unlocked
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_6px_rgba(255,215,0,0.25)]'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                  }`}
                >
                  {ach.unlocked ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
