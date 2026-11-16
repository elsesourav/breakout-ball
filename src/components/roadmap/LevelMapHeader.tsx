import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { CyberSectionHeader } from '../CyberSectionHeader';
import { CoreIcon } from '../CoreIcon';
import { UserProfile } from '../../types/game';
import { DailyCollectStatus } from '../../services/currency';
import { TOTAL_LEVELS } from './types';

interface LevelMapHeaderProps {
  user: UserProfile;
  displayCores: number;
  isPulsing: boolean;
  dailyStatus: DailyCollectStatus;
  totalStars: number;
  onOpenShop: () => void;
  hazeRef: React.RefObject<HTMLDivElement | null>;
}

export const LevelMapHeader: React.FC<LevelMapHeaderProps> = ({
  user,
  displayCores,
  isPulsing,
  dailyStatus,
  totalStars,
  onOpenShop,
  hazeRef,
}) => {
  const canShowFree =
    dailyStatus.canCollect ||
    (typeof window !== 'undefined' &&
      (window.location.search.includes('forceFree') ||
        window.sessionStorage?.getItem('forceFree') === '1'));

  return (
    <>
      {/* ── Top Cyber Section Header (Profile & Cores) ──────────────────── */}
      <div
        className="absolute top-0 inset-x-0 z-40 w-full flex justify-center bg-[#06081c]/95 backdrop-blur-md shadow-lg"
        style={{
          borderBottom: '1px solid rgba(0, 247, 255, 0.22)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(0, 247, 255, 0.08)',
        }}
      >
        <CyberSectionHeader
          title={user.fullName || user.username.toUpperCase() || 'CYBER PLAYER'}
          subtitle={`@${user.username || 'player'}`}
          rightSlot={
            <button
              type="button"
              id="header-cores-badge"
              onClick={onOpenShop}
              title="View Cores & Shop"
              style={{
                background: isPulsing
                  ? 'linear-gradient(135deg, rgba(0, 247, 255, 0.28) 0%, rgba(99, 102, 241, 0.32) 100%)'
                  : 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(99, 102, 241, 0.25) 100%)',
                border: isPulsing
                  ? '1.2px solid #00f7ff'
                  : '1.2px solid rgba(0, 247, 255, 0.45)',
                boxShadow: isPulsing
                  ? '0 0 14px rgba(0, 247, 255, 0.5)'
                  : '0 0 12px rgba(0, 247, 255, 0.25)',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full cursor-pointer hover:border-cyan-300 hover:shadow-[0_0_16px_rgba(0,247,255,0.4)] active:scale-95 group transition-all"
            >
              <CoreIcon
                size={15}
                glow
                variant="cyan"
                className="transition-transform duration-300 group-hover:rotate-12"
              />
              <span className={`font-tech font-bold text-xs transition-colors ${isPulsing ? 'text-white' : 'text-cyan-200'}`}>
                {displayCores.toLocaleString()}
              </span>
              <span className="font-tech text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">
                CORES
              </span>
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-400/20 border border-cyan-400/60 text-cyan-300 flex items-center justify-center text-[10px] font-bold group-hover:bg-cyan-400 group-hover:text-black transition-colors ml-0.5">
                +
              </span>
            </button>
          }
        />
      </div>

      {/* ── Floating Controls Layer: Left (FREE Rounded Button) & Right (STAR Fixed Badge) ─ */}
      <div className="absolute top-[58px] inset-x-0 z-50 pointer-events-none flex justify-center">
        <div className="w-full max-w-[440px] px-3 sm:px-4 flex items-center justify-between">
          {/* Left: Compact, stationary FREE Button with rounded-xl corners & continuous shine */}
          {canShowFree ? (
            <div className="relative pointer-events-auto">
              <motion.button
                type="button"
                id="daily-free-collect-button"
                onClick={onOpenShop}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background:
                    'linear-gradient(135deg, rgba(6, 182, 212, 0.28) 0%, rgba(14, 25, 54, 0.95) 100%)',
                  border: '1.2px solid rgba(0, 247, 255, 0.65)',
                  boxShadow:
                    '0 0 14px rgba(0, 247, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                }}
                className="h-8 sm:h-9 px-3 flex items-center gap-1.5 rounded-xl cursor-pointer select-none relative group overflow-hidden btn-shine-sweep"
                title="Claim Free Cores in Core Shop!"
              >
                <span className="text-base leading-none filter drop-shadow select-none">🎁</span>
                <span className="font-tech font-black text-xs text-cyan-100 tracking-wider leading-none">
                  FREE
                </span>
                <CoreIcon size={12} variant="cyan" glow />
              </motion.button>
            </div>
          ) : (
            <div />
          )}

          {/* Right: Fixed Star Badge */}
          <div
            style={{
              background:
                'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(24, 18, 5, 0.94) 100%)',
              border: '1.2px solid rgba(251, 191, 36, 0.45)',
              boxShadow:
                '0 0 14px rgba(251, 191, 36, 0.25), 0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-amber-300 font-tech font-bold text-xs pointer-events-auto select-none"
            title={`${totalStars} Stars Collected in Arcade`}
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span className="text-sm font-black text-amber-300 tracking-wide">{totalStars}</span>
            <span className="text-[10px] text-amber-400/70 font-normal">/ {TOTAL_LEVELS * 3}</span>
          </div>
        </div>
      </div>

      {/* Distance-haze gradient at top (vanishing-point zone) */}
      <div
        ref={hazeRef}
        className="absolute top-0 inset-x-0 h-32 pointer-events-none z-30 transition-opacity duration-150"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(0,247,255,0.10) 0%, transparent 80%),' +
            'linear-gradient(to bottom, #03040c 0%, rgba(3,4,12,0.90) 38%, rgba(3,4,12,0.4) 68%, transparent 100%)',
        }}
      />
    </>
  );
};
