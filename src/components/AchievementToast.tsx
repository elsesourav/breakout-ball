import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import { Achievement } from '../types/game';
import { achievementManager } from '../services/achievements';
import { synthAudio } from '../utils/synthAudio';
import { soundManager } from '../utils/audio';
import {
  Trophy,
  Zap,
  Flame,
  Crown,
  Shield,
  Target,
  Compass,
  Timer,
  Palette,
  Globe,
  X,
  ChevronRight,
} from 'lucide-react';

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

  const IconComp = ICON_MAP[activeToast.icon] || Trophy;

  // Handle clicking the notification body -> redirect to profile achievements section
  const handleCardClick = () => {
    achievementManager.markAsViewed(activeToast.id);
    setActiveToast(null);
    soundManager.playClick('tab');
    setActiveTab('profile');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('profile-switch-section', { detail: { section: 'badges' } })
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
          zIndex: 9999,
          position: 'fixed',
          top: isInGame ? '8px' : '64px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 24px)',
          maxWidth: isInGame ? '290px' : '360px',
          pointerEvents: 'none',
          transition: 'top 0.3s ease, max-width 0.3s ease',
        }}
      >
        <motion.div
          key={activeToast.id}
          initial={{ opacity: 0, y: -16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ type: 'spring', damping: 24, stiffness: 420 }}
          onClick={handleCardClick}
          style={{
            backgroundColor: 'rgba(7, 10, 32, 0.97)',
            border: '1.5px solid #ffd700',
            boxShadow: '0 0 22px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            borderRadius: isInGame ? '12px' : '14px',
            backdropFilter: 'blur(16px)',
          }}
          className={`pointer-events-auto cursor-pointer select-none flex items-center justify-between gap-2.5 shadow-2xl active:scale-98 transition-all ${
            isInGame ? 'px-2.5 py-1.5' : 'px-3 py-2'
          }`}
          title={isInGame ? 'Achievement Unlocked' : 'Tap to view achievement in Profile'}
        >
          {/* Left: Icon Box */}
          <div
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.15)',
              border: '1.2px solid #ffd700',
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.45)',
            }}
            className={`rounded-lg flex items-center justify-center flex-shrink-0 text-amber-300 ${
              isInGame ? 'w-6 h-6' : 'w-8 h-8'
            }`}
          >
            <IconComp
              className={`fill-amber-300/40 text-amber-300 ${isInGame ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}
            />
          </div>

          {/* Middle: Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1 text-[9px] font-tech font-bold text-amber-400 tracking-wider uppercase leading-none mb-0.5">
              <Trophy className="w-2.5 h-2.5 fill-amber-400 text-amber-400 flex-shrink-0" />
              <span className="truncate">
                {isInGame ? 'ACHIEVEMENT UNLOCKED' : 'ACHIEVEMENT COMPLETED'}
              </span>
            </div>

            <h4
              className={`font-display font-black text-white truncate leading-tight ${
                isInGame ? 'text-[11.5px]' : 'text-xs'
              }`}
            >
              {activeToast.title}
            </h4>

            {!isInGame && (
              <p className="font-ui text-[10.5px] text-slate-300 truncate mt-0.5 leading-none">
                {activeToast.description}
              </p>
            )}
          </div>

          {/* Right Action: Chevron arrow indicator + Cross Dismiss Button */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isInGame && (
              <ChevronRight className="w-3.5 h-3.5 text-amber-400/80 stroke-[2.5]" />
            )}

            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer flex-shrink-0"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
