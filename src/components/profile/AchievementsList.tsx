import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '../../types/game';
import { achievementManager } from '../../services/achievements';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../audio';
import { CoreIcon } from '../common/CoreIcon';
import { Award, Lock, Check } from 'lucide-react';
import { ACHIEVEMENT_CUSTOM_ICONS, IconFirstImpact } from './AchievementIcons';

export const AchievementsList: React.FC = () => {
  const { user } = useGame();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    setAchievements(achievementManager.getAll());
    const unsub = achievementManager.onUnlock(() => {
      setAchievements(achievementManager.getAll());
    });
    return unsub;
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progressPercent = Math.round((unlockedCount / Math.max(1, achievements.length)) * 100);

  const handleClaim = (id: string) => {
    soundManager.playClick();
    const res = achievementManager.claimReward(id, user.username);
    if (res.success) {
      setAchievements(achievementManager.getAll());
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(8, 12, 36, 0.94)',
        border: '1.5px solid rgba(0, 247, 255, 0.28)',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.55), 0 0 20px rgba(0, 247, 255, 0.12)',
      }}
      className="w-full flex flex-col backdrop-blur-xl"
    >
      {/* 1. Header with Progress Bar */}
      <div className="flex flex-col gap-2.5 p-3.5 border-b border-cyan-500/15 bg-cyan-950/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)] flex-shrink-0">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-display font-black text-xs text-white tracking-wider leading-tight truncate">
                ACHIEVEMENTS
              </h3>
              <span className="font-tech text-[10px] text-amber-400 tracking-widest mt-0.5 truncate">
                PILOT ACCOMPLISHMENTS
              </span>
            </div>
          </div>

          <span className="font-tech text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 shadow-[0_0_8px_rgba(255,215,0,0.2)] tracking-wider flex-shrink-0 whitespace-nowrap">
            {unlockedCount} / {achievements.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden p-0.5 border border-cyan-500/25">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-500 shadow-[0_0_10px_#f59e0b]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Full Natural Height Achievements Cards List (Outer Page Scrolls) */}
      <div className="p-3 flex flex-col gap-2.5">
        {achievements.map((ach) => {
          const IconComp = ACHIEVEMENT_CUSTOM_ICONS[ach.id] || IconFirstImpact;
          const rewardAmount = ach.coreReward || 25;

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
              className="p-3 flex items-center justify-between gap-3 transition-all hover:border-cyan-400/40"
            >
              {/* Left: Icon & Description */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
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
                  </div>
                  <p className="font-ui text-[11px] text-slate-300 leading-snug line-clamp-2 mt-0.5">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Right: Core Reward / Collect Button */}
              <div className="flex-shrink-0 flex items-center">
                {ach.unlocked && !ach.claimed ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleClaim(ach.id)}
                    animate={{
                      boxShadow: [
                        '0 0 8px rgba(0, 247, 255, 0.4)',
                        '0 0 18px rgba(0, 247, 255, 0.9)',
                        '0 0 8px rgba(0, 247, 255, 0.4)',
                      ],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      background: 'linear-gradient(135deg, #00f7ff 0%, #0284c7 100%)',
                      border: '1.2px solid #7dd3fc',
                    }}
                    className="h-7 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer select-none text-slate-950 font-tech font-black text-xs shadow-md"
                    title={`Collect ${rewardAmount} Cores!`}
                  >
                    <span>+{rewardAmount}</span>
                    <CoreIcon size={12} variant="cyan" />
                    <span className="text-[10px] ml-0.5 tracking-wider">CLAIM</span>
                  </motion.button>
                ) : ach.claimed ? (
                  <div className="h-7 px-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-1 text-emerald-400 font-tech font-bold text-[11px] select-none">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>+{rewardAmount}</span>
                    <CoreIcon size={11} variant="cyan" />
                  </div>
                ) : (
                  <div className="h-7 px-2 rounded-lg bg-black/40 border border-slate-700/40 flex items-center gap-1 text-slate-500 font-tech text-[10px] select-none">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>+{rewardAmount}</span>
                    <CoreIcon size={10} variant="cyan" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
