import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { ActiveTab } from '../../types/game';
import { soundManager } from '../../audio';
import { currencyService } from '../../services/currency';
import {
  NavArenaIcon,
  NavArmoryIcon,
  StudioMatrixForgeIcon,
} from './NavIcons';

/** Cyber Storefront / Core Vault Shop Icon */
const NavShopIcon: React.FC<{ active?: boolean; className?: string; style?: React.CSSProperties }> = ({
  active,
  className = 'w-5 h-5',
  style,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 9l2-5h14l2 5v2a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"
      fill={active ? 'currentColor' : '#475569'}
      fillOpacity={active ? 0.35 : 0.2}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M4 13v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M10 21v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

/** Cyber Global Trophy / Ranks Icon */
const NavRanksIcon: React.FC<{ active?: boolean; className?: string; style?: React.CSSProperties }> = ({
  active,
  className = 'w-5 h-5',
  style,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9H4a2 2 0 0 1-2-2V5h4v4zm12 0h2a2 2 0 0 0 2-2V5h-4v4z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M4 5h16v4a8 8 0 0 1-8 8 8 8 0 0 1-8-8V5z"
      fill={active ? 'currentColor' : '#475569'}
      fillOpacity={active ? 0.35 : 0.2}
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M12 17v4m-4 0h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface NavButtonConfig {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ active?: boolean; className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  glowColor: string;
  badge?: string | number | null;
  isFreeBadge?: boolean;
  isHero?: boolean;
}

export const SideNavDock: React.FC = () => {
  const { activeTab, setActiveTab, settings } = useGame();
  const [canShowFree, setCanShowFree] = useState<boolean>(() => {
    const status = currencyService.getDailyCollectStatus();
    return (
      status.canCollect ||
      (typeof window !== 'undefined' &&
        (window.location.search.includes('forceFree') ||
          window.sessionStorage?.getItem('forceFree') === '1'))
    );
  });

  useEffect(() => {
    const check = () => {
      const status = currencyService.getDailyCollectStatus();
      setCanShowFree(
        status.canCollect ||
          (typeof window !== 'undefined' &&
            (window.location.search.includes('forceFree') ||
              window.sessionStorage?.getItem('forceFree') === '1'))
      );
    };
    const timer = setInterval(check, 2500);
    window.addEventListener('currency_balance_changed', check);
    return () => {
      clearInterval(timer);
      window.removeEventListener('currency_balance_changed', check);
    };
  }, []);

  const handleNavClick = (tab: ActiveTab) => {
    if (tab === activeTab) return;
    soundManager.playClick();
    if (settings.vibrate && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    setActiveTab(tab);
  };

  const navItems: NavButtonConfig[] = [
    {
      id: 'online',
      label: 'ARENA',
      icon: NavArenaIcon,
      accentColor: '#a855f7',
      glowColor: 'rgba(168, 85, 247, 0.7)',
      badge: 'APEX',
      isHero: true,
    },
    {
      id: 'armory',
      label: 'UPGRADE',
      icon: NavArmoryIcon,
      accentColor: '#00f7ff',
      glowColor: 'rgba(0, 247, 255, 0.6)',
    },
    {
      id: 'create',
      label: 'STUDIO',
      icon: StudioMatrixForgeIcon,
      accentColor: '#38bdf8',
      glowColor: 'rgba(56, 189, 248, 0.6)',
    },
    {
      id: 'shop',
      label: 'SHOP',
      icon: NavShopIcon,
      accentColor: '#fbbf24',
      glowColor: 'rgba(251, 191, 36, 0.6)',
      badge: canShowFree ? 'FREE' : null,
      isFreeBadge: canShowFree,
    },
    {
      id: 'leaderboard',
      label: 'RANKS',
      icon: NavRanksIcon,
      accentColor: '#ffd700',
      glowColor: 'rgba(255, 215, 0, 0.6)',
    },
  ];

  return (
    <aside
      aria-label="Navigation Dock"
      style={{
        top: 'calc(50% + 18px)',
      }}
      className="absolute left-2 sm:left-3.5 -translate-y-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none select-none"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        const isHero = !!item.isHero;

        return (
          <div key={item.id} className="relative flex items-center justify-center">
            {/* Radiant Breathing Sine Aura for Hero Arena button */}
            {isHero && (
              <motion.div
                className="absolute -inset-2 rounded-2xl pointer-events-none"
                animate={{
                  opacity: [0.35, 0.85, 0.35],
                  scale: [0.94, 1.15, 0.94],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  background:
                    'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(168, 85, 247, 0) 72%)',
                  filter: 'blur(6px)',
                }}
              />
            )}

            <motion.button
              type="button"
              onClick={() => handleNavClick(item.id)}
              whileHover={{ scale: isHero ? 1.05 : 1.08, x: 2 }}
              whileTap={{ scale: 0.93 }}
              animate={
                isHero
                  ? {
                      scale: [1, 1.06, 1],
                      boxShadow: [
                        '0 0 14px rgba(168, 85, 247, 0.5), inset 0 0 8px rgba(168, 85, 247, 0.3)',
                        '0 0 32px rgba(168, 85, 247, 0.95), 0 0 48px rgba(216, 180, 254, 0.5), inset 0 0 16px rgba(168, 85, 247, 0.6)',
                        '0 0 14px rgba(168, 85, 247, 0.5), inset 0 0 8px rgba(168, 85, 247, 0.3)',
                      ],
                      borderColor: [
                        'rgba(168, 85, 247, 0.6)',
                        'rgba(232, 121, 249, 1)',
                        'rgba(168, 85, 247, 0.6)',
                      ],
                    }
                  : undefined
              }
              transition={
                isHero
                  ? {
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
                  : { type: 'spring', stiffness: 400, damping: 25 }
              }
              style={{
                background: isActive
                  ? `linear-gradient(135deg, rgba(8, 14, 44, 0.96) 0%, rgba(18, 28, 68, 0.98) 100%)`
                  : `linear-gradient(135deg, rgba(8, 14, 38, 0.88) 0%, rgba(15, 23, 52, 0.92) 100%)`,
                border: isHero
                  ? undefined
                  : isActive
                  ? `1.5px solid ${item.accentColor}`
                  : `1.5px solid rgba(0, 247, 255, 0.28)`,
                borderWidth: isHero ? '2px' : undefined,
                borderStyle: isHero ? 'solid' : undefined,
                boxShadow: isHero
                  ? undefined
                  : isActive
                  ? `0 0 16px ${item.glowColor}, inset 0 0 8px ${item.glowColor}`
                  : `0 4px 14px rgba(0, 0, 0, 0.6), 0 0 8px rgba(0, 247, 255, 0.15)`,
              }}
              className={`pointer-events-auto relative ${
                isHero
                  ? 'w-[56px] h-[56px] sm:w-[62px] sm:h-[62px] rounded-2xl p-1.5'
                  : 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl p-1'
              } flex flex-col items-center justify-center cursor-pointer backdrop-blur-xl group transition-colors duration-200`}
              title={item.label}
              aria-label={item.label}
            >
              {/* Active Left Indicator Pip */}
              {isActive && (
                <span
                  className="absolute -left-1 top-2 bottom-2 w-1 rounded-r-full shadow-sm"
                  style={{ backgroundColor: item.accentColor }}
                />
              )}

              {/* Sweeping Light Shimmer for Hero button */}
              {isHero && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <motion.div
                    className="w-[200%] h-full bg-gradient-to-r from-transparent via-purple-300/25 to-transparent skew-x-[-25deg]"
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

              {/* Optional Notification / Feature Badge */}
              {item.badge && (
                <motion.span
                  animate={
                    isHero
                      ? {
                          scale: [1, 1.15, 1],
                          boxShadow: [
                            '0 0 6px rgba(168, 85, 247, 0.7)',
                            '0 0 16px rgba(216, 180, 254, 1)',
                            '0 0 6px rgba(168, 85, 247, 0.7)',
                          ],
                        }
                      : item.isFreeBadge
                      ? {
                          scale: [1, 1.15, 1],
                          boxShadow: [
                            '0 0 6px rgba(0, 247, 255, 0.6)',
                            '0 0 16px rgba(0, 247, 255, 1)',
                            '0 0 6px rgba(0, 247, 255, 0.6)',
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: isHero ? 1.8 : 1.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    background: isHero
                      ? 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)'
                      : item.isFreeBadge
                      ? 'linear-gradient(135deg, #00f7ff 0%, #0284c7 100%)'
                      : undefined,
                    color: item.isFreeBadge ? '#030712' : '#ffffff',
                  }}
                  className={`absolute ${
                    isHero
                      ? '-top-2 -right-2 px-1.5 py-0.5 text-[8px] sm:text-[9px]'
                      : '-top-1.5 -right-1.5 px-1 py-0.2 text-[8px]'
                  } rounded-full font-tech font-black tracking-wider border leading-tight ${
                    isHero
                      ? 'border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.9)]'
                      : item.isFreeBadge
                      ? 'border-cyan-300'
                      : 'bg-purple-600 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                  }`}
                >
                  {item.badge}
                </motion.span>
              )}

              {/* Icon */}
              <div
                className="flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{
                  color: isActive ? item.accentColor : isHero ? '#e9d5ff' : '#94a3b8',
                  filter: isActive
                    ? `drop-shadow(0 0 8px ${item.glowColor})`
                    : isHero
                    ? 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.6))'
                    : 'none',
                }}
              >
                <Icon
                  active={isActive}
                  className={isHero ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-4 h-4 sm:w-5 sm:h-5'}
                />
              </div>

              {/* Micro Tech Label */}
              <span
                className={`${
                  isHero
                    ? 'font-tech text-[8px] sm:text-[9px] tracking-widest uppercase font-black mt-0.5'
                    : 'font-tech text-[7px] sm:text-[8px] tracking-wider uppercase font-bold mt-0.5'
                } leading-none transition-colors`}
                style={{
                  color: isActive ? item.accentColor : isHero ? '#e9d5ff' : '#64748b',
                  textShadow: isActive
                    ? `0 0 6px ${item.glowColor}`
                    : isHero
                    ? '0 0 6px rgba(168, 85, 247, 0.8)'
                    : 'none',
                }}
              >
                {item.label}
              </span>
            </motion.button>
          </div>
        );
      })}
    </aside>
  );
};
