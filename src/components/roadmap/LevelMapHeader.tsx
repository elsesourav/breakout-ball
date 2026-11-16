import React from 'react';
import { motion } from 'framer-motion';
import { Star, Settings, User as UserIcon } from 'lucide-react';
import { CoreIcon } from '../common/CoreIcon';
import { TopCoresBadge } from '../common/TopCoresBadge';
import { DailyCollectStatus } from '../../services/currency';
import { TOTAL_LEVELS } from './types';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../audio';

interface LevelMapHeaderProps {
  displayCores: number;
  isPulsing: boolean;
  dailyStatus: DailyCollectStatus;
  totalStars: number;
  onOpenShop: () => void;
  hazeRef: React.RefObject<HTMLDivElement | null>;
}

export const LevelMapHeader: React.FC<LevelMapHeaderProps> = ({
  displayCores,
  isPulsing,
  dailyStatus,
  totalStars,
  onOpenShop,
  hazeRef,
}) => {
  const { user, setActiveTab, setIsSettingsOpen } = useGame();
  const [avatarErr, setAvatarErr] = React.useState(false);

  const canShowFree =
    dailyStatus.canCollect ||
    (typeof window !== 'undefined' &&
      (window.location.search.includes('forceFree') ||
        window.sessionStorage?.getItem('forceFree') === '1'));

  const handleOpenProfile = () => {
    soundManager.playClick();
    setActiveTab('profile');
  };

  return (
    <>
      {/* ── Top Bar: Profile & Free (Left) ── Stars (Center) ── Cores & Settings (Right) ── */}
      <div className="absolute top-0 inset-x-0 z-40 w-full flex justify-center bg-gradient-to-b from-[#050716]/95 via-[#06081c]/70 to-transparent pt-2.5 pb-4 px-3 sm:px-4 pointer-events-none">
        <div className="w-full max-w-sm flex items-start justify-between gap-1.5">
          {/* Top Left: Profile Button (with Free Collect button underneath if available) */}
          <div className="flex pointer-events-auto">
            {/* 1. Profile / Pilot Avatar Button (Square / Squircle type) */}
            <motion.button
              type="button"
              onClick={handleOpenProfile}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              style={{
                background:
                  'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(12, 30, 60, 0.95) 100%)',
                border: '1px solid rgba(0, 247, 255, 0.45)',
                boxShadow: '0 0 10px rgba(0, 247, 255, 0.22)',
              }}
              className="size-10 rounded-lg flex items-center justify-center cursor-pointer transition-all flex-shrink-0 overflow-hidden"
              title="Pilot Profile"
            >
              {user.isLoggedIn && user.avatarUrl && !avatarErr ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || 'Pilot'}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarErr(true)}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : user.isLoggedIn ? (
                <span className="text-xs font-tech font-bold text-cyan-300">
                  {(user.fullName || user.username || 'P').slice(0, 2).toUpperCase()}
                </span>
              ) : (
                <UserIcon className="size-7 text-cyan-400 stroke-[2]" />
              )}
            </motion.button>
          </div>

          {/* Top Center: Total Stars Badge */}
          <div className="flex items-center justify-center pointer-events-auto">
            <div
              style={{
                background:
                  'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(24, 18, 5, 0.94) 100%)',
                border: '1.2px solid rgba(251, 191, 36, 0.45)',
                boxShadow: '0 0 12px rgba(251, 191, 36, 0.25)',
              }}
              className="h-8 flex items-center gap-1.5 my-1 px-3 rounded-full text-amber-300 font-tech font-bold text-xs select-none shadow-md"
              title={`${totalStars} Stars Collected in Arcade`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
              <span className="text-xs font-black text-amber-300 tracking-wide">{totalStars}</span>
              <span className="text-[9px] text-amber-400/70 font-normal">/{TOTAL_LEVELS * 3}</span>
            </div>
          </div>

          {/* Top Right: Cores Section with Settings Button at Bottom */}
          <div className="flex flex-col items-end gap-3.5 sm:gap-4 pointer-events-auto">
            <TopCoresBadge
              cores={displayCores}
              isPulsing={isPulsing}
              onOpenShop={onOpenShop}
              className="my-1"
            />
            
            <motion.button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setIsSettingsOpen(true);
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              style={{
                background:
                  'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(26, 18, 54, 0.95) 100%)',
                border: '1.2px solid rgba(168, 85, 247, 0.45)',
                boxShadow:
                  '0 0 12px rgba(168, 85, 247, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              }}
              className="size-10 rounded-md flex items-center justify-center text-purple-300 hover:text-white cursor-pointer active:scale-95 transition-all flex-shrink-0 mt-1"
              title="System Settings"
            >
              <Settings className="w-6 h-6 text-purple-300 stroke-[2.2]" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Distance-haze gradient at top (vanishing-point zone) */}
      <div
        ref={hazeRef}
        className="absolute top-0 inset-x-0 h-28 pointer-events-none z-30 transition-opacity duration-150"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(0,247,255,0.10) 0%, transparent 80%),' +
            'linear-gradient(to bottom, #03040c 0%, rgba(3,4,12,0.90) 38%, rgba(3,4,12,0.4) 68%, transparent 100%)',
        }}
      />
    </>
  );
};
