import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { ActiveTab } from '../../types/game';
import { soundManager } from '../../audio';
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
    {/* Cyber Storefront Canopy */}
    <path
      d="M3 9l2-5h14l2 5v2a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"
      fill={active ? 'currentColor' : '#475569'}
      fillOpacity={active ? 0.35 : 0.2}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Entrance Door & Store Base */}
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

interface NavButtonConfig {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ active?: boolean; className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  glowColor: string;
  badge?: string | number | null;
}

export const SideNavDock: React.FC = () => {
  const { activeTab, setActiveTab, settings } = useGame();

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
      glowColor: 'rgba(168, 85, 247, 0.6)',
      badge: 'APEX',
    },
    {
      id: 'armory',
      label: 'ARMORY',
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
    },
  ];

  return (
    <aside
      aria-label="Navigation Dock"
      style={{
        top: 'calc(50% + 20px)',
      }}
      className="absolute left-3 sm:left-4 -translate-y-1/2 z-40 flex flex-col items-center gap-2.5 pointer-events-none select-none"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.id)}
            whileHover={{ scale: 1.08, x: 2 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              background: isActive
                ? `linear-gradient(135deg, rgba(8, 14, 44, 0.96) 0%, rgba(18, 28, 68, 0.98) 100%)`
                : `linear-gradient(135deg, rgba(8, 14, 38, 0.88) 0%, rgba(15, 23, 52, 0.92) 100%)`,
              border: isActive
                ? `1.5px solid ${item.accentColor}`
                : `1.5px solid rgba(0, 247, 255, 0.28)`,
              boxShadow: isActive
                ? `0 0 16px ${item.glowColor}, inset 0 0 8px ${item.glowColor}`
                : `0 4px 14px rgba(0, 0, 0, 0.6), 0 0 8px rgba(0, 247, 255, 0.15)`,
            }}
            className="pointer-events-auto relative w-12 h-12 rounded-2xl flex flex-col items-center justify-center p-1.5 cursor-pointer backdrop-blur-xl group transition-colors duration-200"
            title={item.label}
            aria-label={item.label}
          >
            {/* Active Left Indicator Pip */}
            {isActive && (
              <span
                className="absolute -left-1 top-2.5 bottom-2.5 w-1 rounded-r-full shadow-sm"
                style={{ backgroundColor: item.accentColor }}
              />
            )}

            {/* Optional Notification / Feature Badge */}
            {item.badge && (
              <span className="absolute -top-1.5 -right-1 px-1 py-0.2 rounded-full text-[8px] font-tech font-black tracking-wider bg-purple-600 text-white border border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)] leading-tight">
                {item.badge}
              </span>
            )}

            {/* Icon */}
            <div
              className="flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
              style={{
                color: isActive ? item.accentColor : '#94a3b8',
                filter: isActive ? `drop-shadow(0 0 8px ${item.glowColor})` : 'none',
              }}
            >
              <Icon active={isActive} className="w-5 h-5" />
            </div>

            {/* Micro Tech Label */}
            <span
              className="font-tech text-[8px] tracking-wider uppercase font-bold mt-0.5 leading-none transition-colors"
              style={{
                color: isActive ? item.accentColor : '#64748b',
                textShadow: isActive ? `0 0 6px ${item.glowColor}` : 'none',
              }}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </aside>
  );
};
