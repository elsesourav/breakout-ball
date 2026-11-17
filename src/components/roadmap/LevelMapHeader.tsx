import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { CyberPilotIcon, CyberGearIcon } from '../navigation/NavIcons';
import { TopCoresBadge } from '../common/TopCoresBadge';
import { DailyCollectStatus } from '../../services/currency';
import { TOTAL_LEVELS } from './types';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../audio';
import { achievementManager } from '../../services/achievements';

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
  const [hasUnclaimedAch, setHasUnclaimedAch] = React.useState<boolean>(() => achievementManager.hasUncollected());
  const [unclaimedCount, setUnclaimedCount] = React.useState<number>(() => achievementManager.getUncollectedCount());

  React.useEffect(() => {
    const checkAch = () => {
      setHasUnclaimedAch(achievementManager.hasUncollected());
      setUnclaimedCount(achievementManager.getUncollectedCount());
    };
    checkAch();
    const unsub = achievementManager.onUnlock(checkAch);
    window.addEventListener('achievement_claimed', checkAch);
    window.addEventListener('achievement_unlocked', checkAch);
    window.addEventListener('achievement_updated', checkAch);
    return () => {
      unsub();
      window.removeEventListener('achievement_claimed', checkAch);
      window.removeEventListener('achievement_unlocked', checkAch);
      window.removeEventListener('achievement_updated', checkAch);
    };
  }, []);

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
            {/* 1. Profile / Pilot Avatar Button (Square / Squircle 3D keycap) */}
            <div className="relative size-10 flex-shrink-0">
              {/* 3D Base */}
              <div
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{
                  transform: 'translateY(3.5px)',
                  background: 'linear-gradient(180deg, #0891b2 0%, #083344 100%)',
                  border: '1.5px solid #0e7490',
                  boxShadow: '0 5px 12px rgba(0, 0, 0, 0.85)',
                }}
              />
              <motion.button
                type="button"
                onClick={handleOpenProfile}
                whileHover={{ y: -0.5, scale: 1.04 }}
                whileTap={{ y: 3, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                style={{
                  background:
                    'linear-gradient(180deg, rgba(20, 35, 70, 0.96) 0%, rgba(10, 18, 42, 0.98) 100%)',
                  border: '1.8px solid rgba(0, 247, 255, 0.8)',
                  boxShadow:
                    'inset 0 1.5px 0.5px rgba(255, 255, 255, 0.35), inset 0 -1.5px 0 rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 247, 255, 0.25)',
                }}
                className="relative w-full h-full rounded-lg flex items-center justify-center cursor-pointer pointer-events-auto"
                title={hasUnclaimedAch ? `Pilot Profile • ${unclaimedCount} Achievements to Claim!` : 'Pilot Profile'}
              >
                {/* Avatar Content clipped to rounded shape */}
                <div className="w-full h-full rounded-md overflow-hidden flex items-center justify-center pointer-events-none">
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
                    <CyberPilotIcon className="w-6 h-6" />
                  )}
                </div>

                {/* Sweeping Radiant Light Shine when completed achievements are uncollected */}
                {hasUnclaimedAch && (
                  <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none z-10">
                    <motion.div
                      className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg]"
                      animate={{ x: ['-100%', '150%'] }}
                      transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        repeatDelay: 0.8,
                      }}
                    />
                  </div>
                )}

                {/* Uncollected Achievements Indicator Badge */}
                {hasUnclaimedAch && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full font-tech font-black text-[9px] flex items-center justify-center bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 border border-yellow-100 shadow-[0_2px_5px_rgba(0,0,0,0.6)] leading-none z-20 pointer-events-none"
                  >
                    {unclaimedCount > 0 ? unclaimedCount : '!'}
                  </span>
                )}
              </motion.button>
            </div>
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
            
            <div className="relative size-10 flex-shrink-0 mt-1">
              {/* 3D Base */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  transform: 'translateY(3.5px)',
                  background: 'linear-gradient(180deg, #475569 0%, #1e293b 100%)',
                  border: '1.5px solid #334155',
                  boxShadow: '0 5px 12px rgba(0, 0, 0, 0.85)',
                }}
              />
              <motion.button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setIsSettingsOpen(true);
                }}
                whileHover={{ y: -0.5, scale: 1.04 }}
                whileTap={{ y: 3, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                style={{
                  background:
                    'linear-gradient(180deg, rgba(24, 34, 52, 0.96) 0%, rgba(12, 18, 30, 0.98) 100%)',
                  border: '1.8px solid rgba(226, 232, 240, 0.85)',
                  boxShadow:
                    'inset 0 1.5px 0.5px rgba(255, 255, 255, 0.35), inset 0 -1.5px 0 rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 255, 0.25)',
                }}
                className="relative w-full h-full rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all flex-shrink-0 pointer-events-auto"
                title="System Settings"
              >
                <CyberGearIcon className="w-6 h-6" whiteIcon={true} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle ambient top lighting (clean full-screen visibility) */}
      <div
        ref={hazeRef}
        className="absolute top-0 inset-x-0 h-16 pointer-events-none z-30 transition-opacity duration-150"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 0%, rgba(0,247,255,0.06) 0%, transparent 80%)',
        }}
      />
    </>
  );
};
