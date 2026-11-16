import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings,
  Mail,
  ShieldCheck,
  LogOut,
  Cloud,
  LogIn,
  UserPlus,
  Database,
  ExternalLink,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../audio';
import { isUserAdmin } from '../../services/auth';
import { ProfileSettingsGroup } from '../profile/ProfileSettingsGroup';
import { BackendAdminModal } from '../admin/BackendAdminModal';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    user,
    setAuthMode,
    setIsAuthModalOpen,
    logoutUser,
  } = useGame();

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen && !isAdminOpen) {
        soundManager.play('click');
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, isAdminOpen, setIsSettingsOpen]);

  if (!isSettingsOpen) return null;

  const handleClose = () => {
    soundManager.play('click');
    setIsSettingsOpen(false);
  };

  const handleSignIn = () => {
    soundManager.play('click');
    setIsSettingsOpen(false);
    setAuthMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleCreateAccount = () => {
    soundManager.play('click');
    setIsSettingsOpen(false);
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    soundManager.play('click');
    await logoutUser();
  };

  const displayName = user.isLoggedIn ? (user.fullName || 'Player') : 'Anonymous';
  const displayHandle = user.isLoggedIn ? user.username : null;
  const providerLabel =
    user.provider === 'google'
      ? 'Google OAuth'
      : user.provider === 'github'
      ? 'GitHub Developer'
      : user.provider === 'sso'
      ? 'ElseSourav SSO'
      : 'ElseSourav ID';

  const isAdmin =
    user.isLoggedIn &&
    isUserAdmin({
      username: displayHandle || displayName,
      email: user.email,
      isAdmin: (user as any).isAdmin,
    });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={handleClose} />

        {/* Modal Window Chassis */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-sm max-h-[88vh] flex flex-col rounded-2xl bg-[#070a1e]/98 border border-purple-500/35 shadow-[0_0_35px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.2)] overflow-hidden text-white z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-[#0a0f2c] to-[#070a1e] flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                <Settings className="w-4 h-4 text-purple-300" />
              </div>
              <span className="font-display font-black text-sm text-white tracking-wider">
                SYSTEM SETTINGS
              </span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Close Settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Settings Content */}
          <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3.5 no-scrollbar">
            {/* Account Status Card */}
            {user.isLoggedIn ? (
              <div className="w-full rounded-xl bg-[#090d24]/90 border border-cyan-500/25 p-3 flex flex-col gap-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs text-white">
                      {displayName}
                    </span>
                    {displayHandle && (
                      <span className="text-[11px] font-tech text-cyan-400">
                        @{displayHandle}
                      </span>
                    )}
                  </div>

                  <span className="text-[9px] font-tech font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    ONLINE PILOT
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
                    onClick={handleSignOut}
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
                  className="w-full mt-1 py-1.5 px-3 rounded-lg border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-tech font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(0,247,255,0.2)]"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>EDIT PROFILE ICON ON ELSESOURAV</span>
                </button>
              </div>
            ) : (
              <div className="w-full rounded-xl bg-[#090d24]/90 border border-cyan-500/25 p-3 flex flex-col gap-2.5 shadow-md">
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
                  Connect your account to sync progress across devices and compete on leaderboards.
                </p>

                <div className="grid grid-cols-2 gap-2 mt-0.5">
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="cyber-btn-glass"
                    style={{ width: '100%' }}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>SIGN IN</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    className="cyber-btn-primary"
                    style={{ width: '100%' }}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>SIGN UP</span>
                  </button>
                </div>
              </div>
            )}

            {/* Admin Ops Terminal Trigger */}
            {isAdmin && (
              <div className="w-full rounded-xl bg-[#090d24]/90 border border-emerald-500/30 p-3 flex flex-col gap-2 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-display font-bold uppercase tracking-wider">
                    <Database className="w-3.5 h-3.5" />
                    <span>Ops Terminal</span>
                  </div>
                  <span className="text-[9px] font-tech font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ADMIN
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.play('click');
                    setIsAdminOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 hover:bg-emerald-900/50 text-emerald-300 font-tech font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>MANAGE COUPONS & BACKEND OPS</span>
                </button>
              </div>
            )}

            {/* Sound, Haptics, Simulation & Storage Settings */}
            <ProfileSettingsGroup />
          </div>
        </motion.div>

        {/* Backend Admin Ops Modal */}
        <BackendAdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      </div>
    </AnimatePresence>
  );
};
