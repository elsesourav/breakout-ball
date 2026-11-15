import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { authService } from '../../services/auth';
import { CustomCyberBadge } from '../common/CustomCyberBadge';

export const UserAvatarMenu: React.FC = () => {
  const { user, updateUser, setActiveTab, setIsAuthModalOpen, setAuthMode } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    updateUser({
      fullName: 'Anonymous',
      username: 'anonymous',
      email: '',
      isLoggedIn: false,
    });
    setIsOpen(false);
  };

  const handleOpenAuth = () => {
    setAuthMode('signin');
    setIsAuthModalOpen(true);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-cyan-300 hover:border-primary transition-all cursor-pointer overflow-hidden shadow-sm"
        title="User Profile Menu"
      >
        {user.isLoggedIn ? (
          <span className="font-bold text-xs uppercase">{user.username.slice(0, 2)}</span>
        ) : (
          <i className="sbi-user1 text-sm" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 w-48 bg-surface-elevated/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-2.5 z-50 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs">
              {user.username.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-foreground truncate">
                {user.fullName}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono truncate">
                @{user.username}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] text-slate-400">Account:</span>
            <CustomCyberBadge variant={user.isLoggedIn ? 'primary' : 'secondary'} size="sm">
              {user.isLoggedIn ? 'Verified' : 'Guest'}
            </CustomCyberBadge>
          </div>

          <button
            onClick={() => {
              setActiveTab('profile');
              setIsOpen(false);
            }}
            className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-white/5 text-slate-300 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <i className="sbi-settings" />
            <span>Settings & Sound</span>
          </button>

          {user.isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <i className="sbi-sign-out" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAuth}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-cyan-400 hover:bg-cyan-500/10 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <i className="sbi-user1" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
