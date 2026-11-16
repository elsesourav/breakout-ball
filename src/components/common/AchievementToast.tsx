import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { Achievement } from '../../types/game';
import { achievementManager } from '../../services/achievements';
import { synthAudio, soundManager } from '../../audio';
import {
  Trophy,
  X,
  ChevronRight,
} from 'lucide-react';
import { ACHIEVEMENT_CUSTOM_ICONS, IconFirstImpact } from '../profile/AchievementIcons';

export const AchievementToast: React.FC = () => {
  const { screen, setActiveTab } = useGame();
  const [activeToast, setActiveToast] = useState<Achievement | null>(null);

  const isInGame = screen === 'playing';

  // Listen for real-time achievement unlocks
  useEffect(() => {
    const unsub = achievementManager.onUnlock((ach) => {
      setActiveToast(ach);
      synthAudio.playAchievementChime();
    });
    return unsub;
  }, []);

  // When returning home / exiting game to Level Map or Arena, show any pending unviewed achievement
  useEffect(() => {
    if (screen === 'menu') {
      const pending = achievementManager.getPendingUnviewed();
      if (pending) {
        const timer = setTimeout(() => {
          setActiveToast(pending);
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, [screen]);

  // Auto-dismiss: inside the game it is shown for less time (2000ms); on level map / menu it stays for 6000ms
  useEffect(() => {
    if (activeToast) {
      const duration = isInGame ? 2000 : 6000;
      const timer = setTimeout(() => {
        // If dismissed automatically in-game, do NOT mark as viewed yet so it appears on home/level map
        if (!isInGame) {
          achievementManager.markAsViewed(activeToast.id);
        }
        setActiveToast(null);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [activeToast, isInGame]);

  if (!activeToast) return null;

  const IconComp = ACHIEVEMENT_CUSTOM_ICONS[activeToast.id] || IconFirstImpact;

  // Handle clicking the notification body -> redirect to profile achievements section
  const handleCardClick = () => {
    achievementManager.markAsViewed(activeToast.id);
    setActiveToast(null);
    soundManager.playClick('tab');
    setActiveTab('profile');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('profile-switch-section', { detail: { section: 'achievements' } })
      );
    }
  };

  // Handle clicking the cross (X) -> dismiss only, nothing else should happen
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick('close');
    achievementManager.markAsViewed(activeToast.id);
    setActiveToast(null);
  };

  return (
    <AnimatePresence>
      <div
        style={{
          zIndex: 99999,
          position: 'fixed',
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 24px)',
          maxWidth: '290px',
          pointerEvents: 'none',
        }}
      >
        <motion.div
          key={activeToast.id}
          initial={{ opacity: 0, y: -20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 450 }}
          onClick={handleCardClick}
          style={{
            backgroundColor: 'rgba(6, 10, 30, 0.98)',
            border: '1.2px solid #ffd700',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.85), 0 0 12px rgba(255, 215, 0, 0.4)',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
          }}
          className="pointer-events-auto cursor-pointer select-none flex items-center justify-between gap-2 shadow-2xl active:scale-95 transition-all px-2.5 py-1.5"
          title="Achievement Unlocked! Tap to collect in Profile"
        >
          {/* Left: Small Icon Box */}
          <div
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.15)',
              border: '1px solid #ffd700',
              boxShadow: '0 0 8px rgba(255, 215, 0, 0.4)',
            }}
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-amber-300"
          >
            <IconComp className="w-3.5 h-3.5 fill-amber-300/40 text-amber-300" />
          </div>

          {/* Middle: Compact Title & Core Reward */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1 text-[8px] font-tech font-bold text-amber-400 tracking-wider uppercase leading-none">
              <Trophy className="w-2.5 h-2.5 fill-amber-400 text-amber-400 flex-shrink-0" />
              <span className="truncate">ACHIEVEMENT UNLOCKED</span>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <h4 className="font-tech font-black text-white text-[11px] truncate leading-tight">
                {activeToast.title}
              </h4>
              <span className="text-[9px] font-tech font-bold text-cyan-300 flex-shrink-0">
                +{activeToast.coreReward || 25}
              </span>
            </div>
          </div>

          {/* Right Action: Small Cross Dismiss Button */}
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer flex-shrink-0 ml-0.5"
            title="Dismiss notification"
          >
            <X className="w-3 h-3 stroke-[2.5]" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
