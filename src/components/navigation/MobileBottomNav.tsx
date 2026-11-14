import React from 'react';
import { motion } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { ActiveTab } from '../../types/game';
import { soundManager } from '../../utils/audio';
import { NavArcadeIcon, NavArenaIcon, NavStudioIcon, NavProfileIcon } from './NavIcons';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, settings, user } = useGame();

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === activeTab) return;
    soundManager.play('click');
    if (settings.vibrate && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    setActiveTab(tab);
  };

  const navItems = [
    { id: 'local' as ActiveTab, label: 'Arcade', icon: NavArcadeIcon },
    { id: 'online' as ActiveTab, label: 'Arena', icon: NavArenaIcon },
    { id: 'create' as ActiveTab, label: 'Studio', icon: NavStudioIcon },
    { id: 'profile' as ActiveTab, label: user.isLoggedIn ? `@${user.username}` : 'Profile', icon: NavProfileIcon },
  ];

  return (
    <nav
      className="relative w-full bg-[#050716]/95 backdrop-blur-2xl border-t border-cyan-500/20 rounded-t-[20px] z-40 flex-shrink-0 select-none shadow-[0_-10px_30px_rgba(0,0,0,0.85)]"
      style={{
        paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
      }}
      aria-label="Game Navigation"
    >
      {/* Top Floating Cyber Laser Horizon */}
      <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_12px_#00f7ff] pointer-events-none" />

      <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isProfile = item.id === 'profile';
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className="relative flex-1 py-1.5 px-0.5 flex flex-col items-center justify-center transition-all duration-200 outline-none rounded-xl group cursor-pointer"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Soft luminous ambient aura (NO harsh border box outline) */}
              {isActive && (
                <>
                  <motion.div
                    layoutId="mobileBottomNavActiveAura"
                    className="absolute inset-0 bg-gradient-to-b from-cyan-500/18 via-indigo-500/10 to-transparent rounded-xl pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                  {/* Top glowing laser blade indicator */}
                  <motion.div
                    layoutId="bottomNavActiveBlade"
                    className="absolute -top-2 left-4 right-4 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_10px_#00f7ff] pointer-events-none"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </>
              )}

              {/* Icon / Avatar with spring scale */}
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
                {isProfile && user.isLoggedIn ? (
                  <div className="relative">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-[11px] font-black text-black font-mono shadow-[0_0_8px_#00f7ff]">
                      {user.username.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black shadow-[0_0_4px_#34d399]" />
                  </div>
                ) : (
                  <Icon active={isActive} className="w-5 h-5" style={{ color: isActive ? '#00f7ff' : '#94a3b8' }} />
                )}
              </motion.div>

              {/* Cyber Styled Badge Shape for Footer Label */}
              <div
                className={`relative z-10 px-2 py-0.5 rounded-full mt-1 transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/15 border border-cyan-400/40 shadow-[0_0_8px_rgba(0,247,255,0.3)]'
                    : 'bg-transparent border border-transparent'
                }`}
              >
                <span
                  className="font-tech text-[10px] tracking-wider uppercase truncate max-w-[70px] block"
                  style={{
                    color: isActive ? '#00f7ff' : '#94a3b8',
                    fontWeight: isActive ? 800 : 600,
                    textShadow: isActive ? '0 0 8px rgba(0,247,255,0.8)' : 'none',
                  }}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
