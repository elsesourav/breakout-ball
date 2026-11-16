import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { ActiveTab } from '../../types/game';
import { soundManager } from '../../audio';
import { currencyService } from '../../services/currency';
import {
  NavArenaIcon,
  NavArmoryIcon,
  NavStudioIcon,
  NavShopIcon,
  NavRanksIcon,
} from './NavIcons';

interface NavButtonConfig {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ active?: boolean; className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  glowColor: string;
  baseBg: string;
  baseBorder: string;
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
      accentColor: '#c084fc',
      glowColor: 'rgba(192, 132, 252, 0.65)',
      baseBg: 'linear-gradient(180deg, #9333ea 0%, #4c1d95 100%)',
      baseBorder: '#6b21a8',
      badge: null,
      isHero: true,
    },
    {
      id: 'armory',
      label: 'UPGRADE',
      icon: NavArmoryIcon,
      accentColor: '#00f7ff',
      glowColor: 'rgba(0, 247, 255, 0.6)',
      baseBg: 'linear-gradient(180deg, #06b6d4 0%, #0891b2 100%)',
      baseBorder: '#0e7490',
    },
    {
      id: 'create',
      label: 'STUDIO',
      icon: NavStudioIcon,
      accentColor: '#38bdf8',
      glowColor: 'rgba(56, 189, 248, 0.6)',
      baseBg: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
      baseBorder: '#0369a1',
    },
    {
      id: 'shop',
      label: 'SHOP',
      icon: NavShopIcon,
      accentColor: '#fbbf24',
      glowColor: 'rgba(251, 191, 36, 0.6)',
      baseBg: 'linear-gradient(180deg, #f59e0b 0%, #b45309 100%)',
      baseBorder: '#78350f',
      badge: canShowFree ? 'FREE' : null,
      isFreeBadge: canShowFree,
    },
    {
      id: 'leaderboard',
      label: 'RANKS',
      icon: NavRanksIcon,
      accentColor: '#ffd700',
      glowColor: 'rgba(255, 215, 0, 0.6)',
      baseBg: 'linear-gradient(180deg, #eab308 0%, #a16207 100%)',
      baseBorder: '#713f12',
    },
  ];

  return (
    <aside
      aria-label="Navigation Dock"
      style={{
        top: 'calc(50% + 18px)',
      }}
      className="absolute left-2 sm:left-3.5 -translate-y-1/2 z-40 flex flex-col items-center gap-3 sm:gap-3.5 pointer-events-none select-none"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        const isHero = !!item.isHero;

        return (
          <div
            key={item.id}
            className={`relative flex items-center justify-center ${
              isHero
                ? 'w-[74px] h-[74px] sm:w-[80px] sm:h-[80px]'
                : 'w-[58px] h-[58px] sm:w-[64px] sm:h-[64px]'
            }`}
          >
            {/* 3D Extruded Base Shelf */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                transform: `translateY(${isHero ? 5.5 : 5}px)`,
                background: item.baseBg,
                border: `2px solid ${item.baseBorder}`,
                boxShadow: isHero
                  ? '0 9px 20px rgba(0, 0, 0, 0.85), 0 0 16px rgba(168, 85, 247, 0.3)'
                  : isActive
                  ? `0 7px 16px rgba(0, 0, 0, 0.85), 0 0 12px ${item.glowColor}`
                  : '0 7px 16px rgba(0, 0, 0, 0.85)',
              }}
            />

            {/* 3D Raised Top Face Button */}
            <motion.button
              type="button"
              onClick={() => handleNavClick(item.id)}
              whileHover={{ y: -1.5, scale: 1.02 }}
              whileTap={{ y: isHero ? 5 : 4.5, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              style={{
                background: isActive
                  ? `linear-gradient(180deg, rgba(20, 36, 80, 0.98) 0%, rgba(10, 18, 48, 0.98) 100%)`
                  : isHero
                  ? `linear-gradient(180deg, rgba(42, 22, 78, 0.98) 0%, rgba(20, 10, 42, 0.98) 100%)`
                  : `linear-gradient(180deg, rgba(18, 30, 60, 0.96) 0%, rgba(10, 15, 34, 0.98) 100%)`,
                border: isHero
                  ? '2px solid rgba(192, 132, 252, 0.85)'
                  : isActive
                  ? `2px solid ${item.accentColor}`
                  : item.id === 'shop' && canShowFree
                  ? '2px solid rgba(0, 247, 255, 0.8)'
                  : `1.8px solid ${item.accentColor}cc`,
                boxShadow: [
                  'inset 0 1.5px 0.5px rgba(255, 255, 255, 0.35)',
                  'inset 0 -2px 0 rgba(0, 0, 0, 0.5)',
                  isActive ? `0 0 12px ${item.glowColor}` : '',
                ]
                  .filter(Boolean)
                  .join(', '),
              }}
              className="pointer-events-auto relative w-full h-full rounded-2xl p-1.5 flex flex-col items-center justify-center cursor-pointer backdrop-blur-xl group transition-colors duration-200"
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

              {/* Sweeping Light Shimmer for Hero Arena button or Shop button when FREE cores available */}
              {(isHero || (item.id === 'shop' && canShowFree)) && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <motion.div
                    className={`w-[200%] h-full bg-gradient-to-r from-transparent ${
                      item.id === 'shop' ? 'via-cyan-200/40' : 'via-purple-300/35'
                    } to-transparent skew-x-[-25deg]`}
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
                <span
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
                      ? '-top-2 -right-2 px-1.5 py-0.5 text-[8.5px] sm:text-[9.5px]'
                      : '-top-1.5 -right-1.5 px-1.5 py-0.5 text-[8px]'
                  } rounded-full font-tech font-black tracking-wider border leading-tight ${
                    isHero
                      ? 'border-purple-300 shadow-[0_2px_8px_rgba(168,85,247,0.5)]'
                      : item.isFreeBadge
                      ? 'border-cyan-300'
                      : 'bg-purple-600 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Icon */}
              <div
                className="flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{
                  color: isActive ? item.accentColor : isHero ? '#e9d5ff' : '#cbd5e1',
                  filter: isActive
                    ? `drop-shadow(0 0 8px ${item.glowColor})`
                    : isHero
                    ? 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.6))'
                    : 'none',
                }}
              >
                <Icon
                  active={isActive}
                  className={isHero ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-6 h-6 sm:w-7 sm:h-7'}
                />
              </div>

              {/* Micro Tech Label */}
              <span
                className={`${
                  isHero
                    ? 'font-tech text-[10px] sm:text-[11px] tracking-widest uppercase font-black mt-1'
                    : 'font-tech text-[8.5px] sm:text-[9.5px] tracking-wider uppercase font-bold mt-1'
                } leading-none transition-colors`}
                style={{
                  color: isActive ? item.accentColor : isHero ? '#e9d5ff' : '#94a3b8',
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
