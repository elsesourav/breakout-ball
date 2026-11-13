import React from 'react';
import { motion } from 'motion/react';
import { Gamepad2, Globe, Layers, User } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ActiveTab } from '../../types/game';
import { soundManager } from '../../utils/audio';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'local', label: 'Local', icon: Gamepad2 },
  { id: 'online', label: 'Online', icon: Globe },
  { id: 'create', label: 'Create', icon: Layers },
  { id: 'profile', label: 'Profile', icon: User },
];

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, settings } = useGame();

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === activeTab) return;
    soundManager.play('click');
    if (settings.vibrate && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    setActiveTab(tab);
  };

  return (
    <nav
      className="w-full bg-[#0a0c1a]/95 backdrop-blur-xl border-t border-white/10 z-30 flex-shrink-0 select-none shadow-[0_-8px_25px_rgba(0,0,0,0.6)]"
      style={{
        paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
      }}
      aria-label="Bottom Navigation"
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className="relative flex-1 py-1.5 px-1 flex flex-col items-center justify-center transition-all duration-200 outline-none rounded-xl group"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Smooth spring sliding active background pill */}
              {isActive && (
                <motion.div
                  layoutId="mobileBottomNavActivePill"
                  className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-purple-500/15 to-pink-500/15 border border-cyan-400/50 rounded-xl shadow-[0_0_15px_rgba(0,247,255,0.3)] pointer-events-none"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              {/* Icon with spring scale bounce */}
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className={`relative z-10 transition-colors duration-200 ${
                  isActive
                    ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,247,255,0.85)]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </motion.div>

              {/* Text Label */}
              <span
                className={`relative z-10 text-[10px] font-medium tracking-wide mt-1 transition-all duration-200 ${
                  isActive
                    ? 'font-bold text-cyan-200 drop-shadow-[0_0_6px_rgba(0,247,255,0.5)]'
                    : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {item.label}
              </span>

              {/* Tiny glowing dot indicator beneath active tab */}
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
