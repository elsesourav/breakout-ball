import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { ActiveTab } from '../../types/game';
import { soundManager } from '../../audio';
import {
  NavArenaIcon,
  NavArmoryIcon,
  NavProfileIcon,
  StudioMatrixForgeIcon,
} from './NavIcons';

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
      id: 'profile',
      label: 'PILOT',
      icon: NavProfileIcon,
      accentColor: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.6)',
    },
  ];

  return (
    <aside
      className="fixed left-2.5 sm:left-3.5 z-40 flex flex-col gap-2.5 select-none pointer-events-none"
      style={{
        top: 'calc(50% + 20px)',
        transform: 'translateY(-50%)',
      }}
      aria-label="Quick Navigation"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.id}
            type="button"
            id={`side-nav-${item.id}`}
            onClick={() => handleNavClick(item.id)}
            whileHover={{ scale: 1.08, x: 2 }}
            whileTap={{ scale: 0.92 }}
            style={{
              background: isActive
                ? `linear-gradient(135deg, rgba(14, 25, 58, 0.95) 0%, rgba(30, 41, 89, 0.98) 100%)`
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
