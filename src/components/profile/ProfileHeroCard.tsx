import React, { useState, useEffect } from 'react';
import { User as UserIcon, Trophy, Award, Layers, Cloud, LogIn, UserPlus, Mail, ShieldCheck, Pencil } from 'lucide-react';
import { soundManager } from '../../audio';
import { achievementManager } from '../../services/achievements';

interface ProfileHeroCardProps {
  user: {
    isLoggedIn: boolean;
    avatarUrl?: string;
    username?: string;
    email?: string;
  };
  displayName: string;
  displayHandle: string | null;
  providerLabel: string;
  completedCount: number;
  unlockedAchievementsCount: number;
  totalAchievementsCount: number;
  userCreatedLevelsCount: number;
  onOpenSettings?: () => void;
  onOpenLeaderboard?: () => void;
  onSectionSwitch?: (section: 'achievements' | 'leaderboard') => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  user,
  displayName,
  displayHandle,
  providerLabel,
  completedCount,
  unlockedAchievementsCount,
  totalAchievementsCount,
  userCreatedLevelsCount,
  onOpenLeaderboard,
  onSectionSwitch,
  onSignIn,
  onCreateAccount,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user.avatarUrl]);

  return (
    <div
      style={{
        backgroundColor: 'rgba(9, 13, 36, 0.92)',
        border: '1.5px solid rgba(0, 247, 255, 0.28)',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6), 0 0 20px rgba(0,247,255,0.1)',
      }}
      className="w-full p-4 backdrop-blur-xl flex flex-col"
    >
      {/* Header: Avatar, Pilot Name, and Settings Component Button */}
      <div className="flex items-center gap-3.5">
        <div className="relative flex-shrink-0 group">
          {user.isLoggedIn && user.avatarUrl && !imgError ? (
            <img
              src={user.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              style={{ width: '40px', height: '40px' }}
              className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_14px_rgba(0,247,255,0.45)]"
            />
          ) : user.isLoggedIn ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[2px] shadow-[0_0_14px_rgba(0,247,255,0.4)]">
              <div className="w-full h-full rounded-full bg-[#070a1a] flex items-center justify-center text-cyan-300 font-tech font-bold text-sm tracking-wider">
                {(displayName || user.username || 'P').slice(0, 2).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500/50 via-slate-600 to-slate-800 p-[2px] shadow-[0_0_10px_rgba(0,247,255,0.25)]">
              <div className="w-full h-full rounded-full bg-[#070a1a] flex items-center justify-center text-cyan-400">
                <UserIcon className="w-5 h-5 stroke-[2]" />
              </div>
            </div>
          )}

          {/* Quick Edit Profile Icon link to elsesourav.com */}
          {user.isLoggedIn && (
            <button
              type="button"
              onClick={() => {
                soundManager.play('click');
                window.open('https://elsesourav.com/settings', '_blank');
              }}
              title="Edit Profile Icon on ElseSourav.com"
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 hover:bg-cyan-500 hover:text-black transition-all cursor-pointer shadow-[0_0_8px_rgba(0,247,255,0.4)]"
            >
              <Pencil className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold text-white truncate font-display tracking-wide">
              {displayName}
            </h2>
          </div>
          {displayHandle ? (
            <p className="text-xs text-cyan-400 font-tech truncate mt-0.5">@{displayHandle}</p>
          ) : (
            <p className="text-[11px] text-slate-400 font-ui truncate mt-0.5">Guest Player • Local Saves</p>
          )}
        </div>
      </div>

      {/* Account Details & Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-cyan-500/15 text-center">
        <div
          onClick={() => {
            soundManager.play('click');
            if (onOpenLeaderboard) {
              onOpenLeaderboard();
            } else if (onSectionSwitch) {
              onSectionSwitch('leaderboard');
            }
          }}
          className="bg-black/40 rounded-xl p-2 border border-cyan-500/20 cursor-pointer hover:border-cyan-400/50 hover:bg-cyan-950/30 transition-all active:scale-95"
          title="View Global Leaderboard"
        >
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 font-ui font-medium">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Cores</span>
          </div>
          <p className="text-sm font-bold text-white mt-0.5 font-tech">
            {completedCount} <span className="text-slate-400 text-[10px]">/ 50</span>
          </p>
        </div>

        <div
          onClick={() => {
            soundManager.play('click');
            onSectionSwitch?.('achievements');
          }}
          className="rounded-xl p-2 cursor-pointer transition-all active:scale-95 bg-black/40 border border-cyan-500/20 hover:border-amber-400/50 hover:bg-amber-950/20"
        >
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 font-ui font-medium">
            <Award className="w-3.5 h-3.5 text-yellow-300" />
            <span>Achievements</span>
          </div>
          <p className="text-sm font-bold text-amber-300 mt-0.5 font-tech">
            {unlockedAchievementsCount} <span className="text-slate-400 text-[10px]">/ {totalAchievementsCount}</span>
          </p>
        </div>

        <div className="bg-black/40 rounded-xl p-2 border border-cyan-500/20">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 font-ui font-medium">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Created</span>
          </div>
          <p className="text-sm font-bold text-purple-300 mt-0.5 font-tech">{userCreatedLevelsCount}</p>
        </div>
      </div>

      {!user.isLoggedIn ? (
        <div className="mt-3.5 pt-3 border-t border-cyan-500/15 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] font-ui">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-100 font-medium">Save progress to cloud & compete</span>
            </span>
            <span className="text-[9px] font-tech font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
              LOCAL SAVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={onSignIn} className="cyber-btn-glass" style={{ width: '100%' }}>
              <LogIn className="w-4 h-4 text-cyan-400" />
              <span>SIGN IN</span>
            </button>
            <button type="button" onClick={onCreateAccount} className="cyber-btn-primary" style={{ width: '100%' }}>
              <UserPlus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>SIGN UP</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 pt-2.5 border-t border-cyan-500/15 flex flex-col gap-1.5 text-[11px] font-ui">
          {user.email && (
            <div className="flex items-center gap-2 text-slate-300 truncate">
              <Mail className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="truncate" style={{ color: '#cbd5e1' }}>{user.email}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span style={{ color: '#94a3b8' }}>{providerLabel}</span>
            </span>
            <span className="text-emerald-400 font-tech font-bold">CLOUD SYNC ACTIVE</span>
          </div>
        </div>
      )}

      {/* Subtle Ecosystem Credit */}
      <div className="mt-3 pt-2.5 border-t border-cyan-500/15 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-mono">
        <img src="/favicon.svg" alt="Breakout Ball" className="w-3.5 h-3.5 object-contain" />
        <span>Breakout Ball V2 • Ecosystem by </span>
        <a href="https://elsesourav.com" target="_blank" rel="noreferrer" className="text-cyan-400 font-bold hover:underline">
          ElseSourav
        </a>
      </div>
    </div>
  );
};
