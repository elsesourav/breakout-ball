import React from 'react';
import { useGame } from '../../context/GameContext';
import { UserAvatarMenu } from '../auth/UserAvatarMenu';

export const TopHeader: React.FC = () => {
  const { activeTab } = useGame();

  const getTabBadge = () => {
    switch (activeTab) {
      case 'local':
        return { label: 'CAMPAIGN', color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40' };
      case 'online':
        return { label: 'COMMUNITY', color: 'border-purple-500/40 text-purple-300 bg-purple-950/40' };
      case 'create':
        return { label: 'STUDIO', color: 'border-pink-500/40 text-pink-300 bg-pink-950/40' };
      case 'profile':
        return { label: 'SETTINGS', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40' };
      default:
        return { label: 'ARCADE', color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40' };
    }
  };

  const badge = getTabBadge();

  return (
    <header className="w-full h-13 px-3 py-2 flex items-center justify-between border-b border-white/10 bg-[#090b16]/90 backdrop-blur-md z-20 flex-shrink-0 select-none shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Brand & Animated Arcade Title */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-2 h-2 rounded-full inline-block bg-cyan-400 shadow-[0_0_8px_#00f7ff] animate-pulse" />
          <span className="w-2 h-2 rounded-full inline-block bg-pink-500 shadow-[0_0_8px_#ff0844]" />
          <span className="w-2 h-2 rounded-full inline-block bg-yellow-400 shadow-[0_0_8px_#eeff01]" />
        </div>

        <div className="flex items-baseline gap-1">
          <span
            style={{
              background: 'linear-gradient(90deg, #00f7ff 0%, #b773ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: '#00f7ff',
            }}
            className="text-sm font-black tracking-wider font-sans select-none"
          >
            BREAKOUT
          </span>
          <span className="text-xs font-black tracking-wider text-yellow-300 drop-shadow-[0_0_8px_rgba(238,255,1,0.7)] font-sans select-none">
            BALL
          </span>
        </div>

        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${badge.color} tracking-wider`}>
          {badge.label}
        </span>
      </div>

      {/* User Avatar & Menu */}
      <div className="flex items-center gap-2">
        <UserAvatarMenu />
      </div>
    </header>
  );
};
