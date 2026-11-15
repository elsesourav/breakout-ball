import React from 'react';
import { motion } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { ActiveTab } from '../../types/game';
import { NavArcadeIcon, NavArenaIcon, NavArmoryIcon, NavProfileIcon } from './NavIcons';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, settings, user } = useGame();

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === activeTab) return;
    if (settings.vibrate && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    setActiveTab(tab);
  };

  const navItems = [
    { id: 'local' as ActiveTab, label: 'Arcade', icon: NavArcadeIcon },
    { id: 'online' as ActiveTab, label: 'Arena', icon: NavArenaIcon },
    { id: 'armory' as ActiveTab, label: 'Armory', icon: NavArmoryIcon },
    { id: 'profile' as ActiveTab, label: 'Profile', icon: NavProfileIcon },
  ];

  return (
    <nav
      className="relative w-full bg-[#050716]/95 backdrop-blur-2xl border-t border-cyan-500/20 rounded-t-[20px] z-40 flex-shrink-0 select-none shadow-lg"
      style={{
        paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
      }}
      aria-label="Game Navigation"
    >
      {/* Top Floating Cyber Laser Horizon */}
      <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_12px_#00f7ff] pointer-events-none" />

      <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.id === 'online'
              ? activeTab === 'online' || activeTab === 'create'
              : activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className="relative flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center transition-all duration-200 outline-none group cursor-pointer"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Top glowing laser blade indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavActiveBlade"
                  className="absolute -top-2 left-4 right-4 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_#00f7ff] pointer-events-none"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon with spring scale */}
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="relative z-10 transition-colors duration-200"
                style={{
                  color: isActive ? '#00f7ff' : '#94a3b8',
                  filter: isActive ? 'drop-shadow(0 0 10px rgba(0,247,255,0.85))' : 'none',
                }}
              >
                <Icon active={isActive} className="w-5 h-5" style={{ color: isActive ? '#00f7ff' : '#94a3b8' }} />
              </motion.div>

              {/* Clean Footer Label */}
              <span
                className="relative z-10 font-tech text-[10.5px] tracking-wider uppercase truncate max-w-[76px] block mt-1 transition-colors duration-200"
                style={{
                  color: isActive ? '#00f7ff' : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  textShadow: isActive ? '0 0 6px rgba(0,247,255,0.5)' : 'none',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
