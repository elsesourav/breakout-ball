import React from 'react';
import { useGame } from '../context/GameContext';
import { ActiveTab } from '../types/game';
import { UserAvatarMenu } from './auth/UserAvatarMenu';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab } = useGame();

  const options: { value: ActiveTab; label: string }[] = [
    { value: 'local', label: 'Arcade' },
    { value: 'online', label: 'Arena' },
    { value: 'armory', label: 'Armory' },
    { value: 'profile', label: 'Profile' },
  ];

  return (
    <header className="mobile-nav-header flex items-center justify-between px-2.5 py-1.5 gap-2">
      <div className="flex-1 flex items-center bg-[#070b20] p-1 rounded-xl border border-cyan-500/20 shadow-md">
        {options.map((opt) => {
          const isActive = activeTab === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setActiveTab(opt.value)}
              className={`flex-1 py-1.5 text-center text-xs font-tech font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <UserAvatarMenu />
    </header>
  );
};
