import React from 'react';
import { motion } from 'motion/react';
import { Map, Globe, Layers, User } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ActiveTab } from '../../types/game';
import { soundManager } from '../../utils/audio';

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
    { id: 'local' as ActiveTab, label: 'Campaign', icon: Map },
    { id: 'online' as ActiveTab, label: 'Online', icon: Globe },
    { id: 'create' as ActiveTab, label: 'Create', icon: Layers },
    { id: 'profile' as ActiveTab, label: user.isLoggedIn ? `@${user.username}` : 'Profile', icon: User },
  ];

  return (
    <nav
      className="w-full bg-[#080a18]/95 backdrop-blur-xl border-t border-white/10 z-40 flex-shrink-0 select-none shadow-[0_-8px_25px_rgba(0,0,0,0.7)]"
      style={{
        paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
      }}
      aria-label="Game Navigation"
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto">
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
              {/* Spring sliding active background pill */}
              {isActive && (
                <motion.div
                  layoutId="mobileBottomNavActivePill"
                  className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-purple-500/15 to-pink-500/15 border border-cyan-400/50 rounded-xl shadow-[0_0_15px_rgba(0,247,255,0.35)] pointer-events-none"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              {/* Icon / Avatar with spring scale */}
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="relative z-10 transition-colors duration-200"
                style={{
                  color: isActive ? '#00f7ff' : '#cbd5e1',
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(0,247,255,0.8))' : 'none',
                }}
              >
                {isProfile && user.isLoggedIn ? (
                  <div className="relative">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-[11px] font-black text-black font-mono shadow-[0_0_6px_#00f7ff]">
                      {user.username.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black shadow-[0_0_4px_#34d399]" />
                  </div>
                ) : (
                  <Icon className="w-5 h-5 stroke-[2.2]" style={{ color: isActive ? '#00f7ff' : '#cbd5e1' }} />
                )}
              </motion.div>

              {/* Text Label */}
              <span
                className="relative z-10 text-[11px] tracking-tight mt-1 truncate max-w-[74px] transition-all duration-200"
                style={{
                  color: isActive ? '#00f7ff' : '#cbd5e1',
                  fontWeight: isActive ? 900 : 700,
                  textShadow: isActive ? '0 0 8px rgba(0,247,255,0.7)' : 'none',
                }}
              >
                {item.label}
              </span>

              {/* Glowing active indicator dot */}
              {isActive && (
                <motion.span
                  layoutId="bottomNavDot"
                  className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f7ff] mt-0.5"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
