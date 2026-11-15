import React, { useState } from 'react';
import { ArrowLeft, Settings, UserCheck, Mail, ShieldCheck, LogOut, Cloud, LogIn, UserPlus, Database, ExternalLink } from 'lucide-react';
import { ProfileSettingsGroup } from './ProfileSettingsGroup';
import { BackendAdminModal } from '../admin/BackendAdminModal';
import { isUserAdmin } from '../../services/auth';
import { soundManager } from '../../utils/audio';

interface ProfileSettingsViewProps {
  onBack: () => void;
  user: {
    isLoggedIn: boolean;
    email?: string;
  };
  displayName: string;
  displayHandle: string | null;
  providerLabel: string;
  onSignOut: () => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  onBack,
  user,
  displayName,
  displayHandle,
  providerLabel,
  onSignOut,
  onSignIn,
  onCreateAccount,
}) => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const isAdmin = user.isLoggedIn && isUserAdmin({ username: displayHandle || displayName, email: user.email, isAdmin: (user as any).isAdmin });

  return (
    <div className="w-full max-w-sm flex flex-col gap-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header Bar with Back Button */}
      <div className="w-full flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={() => {
            soundManager.play('click');
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-tech font-bold text-xs hover:bg-cyan-500/20 active:scale-95 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,247,255,0.2)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK</span>
        </button>

        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-400" />
          <span className="font-display font-black text-sm text-white tracking-wider">
            SYSTEM SETTINGS
          </span>
        </div>
      </div>

      {/* Account Status Card in Settings */}
      {user.isLoggedIn ? (
        <div className="w-full rounded-xl bg-[#080c24]/95 border border-cyan-500/25 p-3.5 flex flex-col gap-2.5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-display font-bold text-xs text-white">
                {displayName}
              </span>
              {displayHandle && (
                <span className="text-[11px] font-tech text-cyan-400">
                  @{displayHandle}
                </span>
              )}
            </div>
            <span className="text-[10px] font-tech font-bold px-2 py-0.5 rounded-full border border-emerald-500/50 text-emerald-300 bg-emerald-950/60">
              ONLINE
            </span>
          </div>

          {user.email && (
            <div className="flex items-center gap-2 text-slate-300 text-xs truncate">
              <Mail className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          )}

          <div className="pt-2 border-t border-cyan-500/15 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-ui flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{providerLabel}</span>
            </span>

            <button
              type="button"
              onClick={onSignOut}
              className="px-3 py-1 rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-display font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3 h-3 text-red-400" />
              <span>SIGN OUT</span>
            </button>
          </div>

          {/* Edit Profile & Avatar on ElseSourav */}
          <button
            type="button"
            onClick={() => {
              soundManager.play('click');
              window.open('https://elsesourav.com/settings', '_blank');
            }}
            className="w-full mt-1.5 py-2 px-3 rounded-lg border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-tech font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(0,247,255,0.2)]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>EDIT PROFILE ICON ON ELSESOURAV</span>
          </button>
        </div>
      ) : (
        <div className="w-full rounded-xl bg-[#080c24]/95 border border-cyan-500/25 p-3.5 flex flex-col gap-2.5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-display font-bold uppercase tracking-wider">
              <Cloud className="w-3.5 h-3.5" />
              <span>ElseSourav Cloud Sync</span>
            </div>
            <span className="text-[9px] font-tech font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              LOCAL SAVE
            </span>
          </div>

          <p className="text-xs font-ui leading-snug text-slate-300">
            Connect your account to sync saves across devices and compete on global leaderboards.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-0.5">
            <button
              type="button"
              onClick={onSignIn}
              className="cyber-btn-glass"
              style={{ width: '100%' }}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>SIGN IN</span>
            </button>

            <button
              type="button"
              onClick={onCreateAccount}
              className="cyber-btn-primary"
              style={{ width: '100%' }}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>SIGN UP</span>
            </button>
          </div>
        </div>
      )}

      {/* Backend Control & Coupon Management Card (Strictly for verified ElseSourav Administrator only) */}
      {isAdmin && (
        <div className="w-full rounded-xl bg-[#080c24]/95 border border-cyan-500/25 p-3.5 flex flex-col gap-2 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-display font-bold uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" />
              <span>Backend Ops Terminal</span>
            </div>
            <span className="text-[9px] font-tech font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ADMIN ONLY
            </span>
          </div>

          <p className="text-xs font-ui leading-snug text-slate-300">
            Manage cyber promo coupons (create, toggle, delete), inspect live player activity logs, and monitor database metrics.
          </p>

          <button
            type="button"
            onClick={() => {
              soundManager.play('click');
              setIsAdminOpen(true);
            }}
            className="w-full py-2 px-3 rounded-lg bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300 font-tech font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_10px_rgba(0,247,255,0.2)] mt-1"
          >
            <Database className="w-3.5 h-3.5" />
            <span>OPEN OPS TERMINAL</span>
          </button>
        </div>
      )}

      {/* Sound, Haptics, Simulation Hardware & Data Storage Settings */}
      <ProfileSettingsGroup />

      {/* Backend Control / Coupon Management Modal */}
      <BackendAdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
};
