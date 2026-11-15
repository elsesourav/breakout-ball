import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import {
  UserCheck,
  LogIn,
  LogOut,
  Trophy,
  UserPlus,
  ShieldCheck,
  Mail,
  Cloud,
  Layers,
  User as UserIcon,
  Settings,
  ArrowLeft,
  Award,
} from 'lucide-react';
import { OverallScoreLeaderboard } from './leaderboard/OverallScoreLeaderboard';
import { AchievementsList } from './profile/AchievementsList';
import { ProfileSettingsGroup } from './profile/ProfileSettingsGroup';
import { achievementManager } from '../services/achievements';
import { soundManager } from '../utils/audio';

export const ProfileView: React.FC = () => {
  const {
    user,
    updateUser,
    setIsAuthModalOpen,
    setAuthMode,
    localProgress,
    userCreatedLevels,
  } = useGame();

  const [isSettingsOpen, setIsSettingsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).has('settings');
    }
    return false;
  });
  const [activeSection, setActiveSection] = useState<'badges' | 'leaderboard'>('badges');
  const [unlockedBadgesCount, setUnlockedBadgesCount] = useState(() => {
    return achievementManager.getAll().filter((a) => a.unlocked).length;
  });
  const totalBadgesCount = achievementManager.getAll().length || 8;

  const outerContainerRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const maxOuterRef = useRef<number>(320);

  useEffect(() => {
    const unsub = achievementManager.onUnlock(() => {
      setUnlockedBadgesCount(achievementManager.getAll().filter((a) => a.unlocked).length);
    });
    return unsub;
  }, []);

  // Listen for programmatic switch to achievements/badges section from notification
  useEffect(() => {
    const handleSwitch = (e: Event) => {
      const custom = e as CustomEvent<{ section: 'badges' | 'leaderboard' }>;
      if (custom.detail?.section) {
        setIsSettingsOpen(false);
        setActiveSection(custom.detail.section);
      }
    };
    window.addEventListener('profile-switch-section', handleSwitch);
    return () => window.removeEventListener('profile-switch-section', handleSwitch);
  }, []);

  // Accurately compute sticky lock threshold (distance needed to scroll away hero card)
  useEffect(() => {
    const updateMaxOuter = () => {
      const outer = outerContainerRef.current;
      const switcher = switcherRef.current;
      if (outer && switcher) {
        const outerRect = outer.getBoundingClientRect();
        const switcherRect = switcher.getBoundingClientRect();
        const dist = Math.round(outer.scrollTop + (switcherRect.top - outerRect.top));
        if (dist > 50) {
          maxOuterRef.current = dist;
        }
      }
    };
    updateMaxOuter();
    window.addEventListener('resize', updateMaxOuter);
    return () => window.removeEventListener('resize', updateMaxOuter);
  }, [isSettingsOpen, activeSection]);

  // Coordinated Nested Scroll: Collapses header first when scrolling down, scrolls table first when scrolling up
  useEffect(() => {
    if (isSettingsOpen) return;

    const outer = outerContainerRef.current;
    if (!outer) return;

    let touchStartY = 0;
    let touchStartX = 0;
    let isTrackingTouch = false;

    const getInner = () => outer.querySelector<HTMLElement>('[data-inner-scroll="true"]');

    // 1. WHEEL COORDINATOR (Desktop mouse wheel & trackpad)
    const handleWheel = (e: WheelEvent) => {
      const deltaY = e.deltaY;
      if (!deltaY) return;

      const inner = getInner();
      const maxOuter = maxOuterRef.current;

      if (deltaY > 0) {
        // Scrolling DOWN (page moves up)
        if (outer.scrollTop < maxOuter - 0.5) {
          // Body must scroll first until sticky header hits the top!
          e.preventDefault();
          outer.scrollTop = Math.min(maxOuter, outer.scrollTop + deltaY);
        } else if (inner) {
          // Body is locked at sticky top, now scroll table inside!
          e.preventDefault();
          inner.scrollTop += deltaY;
        }
      } else if (deltaY < 0) {
        // Scrolling UP (page moves down)
        if (inner && inner.scrollTop > 0.5) {
          // Table inside must finish scrolling first!
          e.preventDefault();
          inner.scrollTop = Math.max(0, inner.scrollTop + deltaY);
        } else if (outer.scrollTop > 0) {
          // Table is at row 1, now page scrolls up revealing hero card!
          e.preventDefault();
          outer.scrollTop = Math.max(0, outer.scrollTop + deltaY);
        }
      }
    };

    // 2. TOUCH COORDINATOR (Mobile touch gestures, even when dragging outside the table)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      isTrackingTouch = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTrackingTouch || e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = touchStartY - currentY; // positive = dragging finger UP (scrolling DOWN)
      const deltaX = touchStartX - currentX;

      // Ignore predominantly horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        return;
      }

      touchStartY = currentY;
      touchStartX = currentX;

      const inner = getInner();
      const maxOuter = maxOuterRef.current;

      if (deltaY > 0) {
        // Scrolling DOWN
        if (outer.scrollTop < maxOuter - 0.5) {
          // Body must scroll first!
          e.preventDefault();
          outer.scrollTop = Math.min(maxOuter, outer.scrollTop + deltaY);
        } else if (inner) {
          // Body has finished scrolling, now table scrolls inside!
          e.preventDefault();
          inner.scrollTop += deltaY;
        }
      } else if (deltaY < 0) {
        // Scrolling UP
        if (inner && inner.scrollTop > 0.5) {
          // Table inside must finish scrolling first!
          e.preventDefault();
          inner.scrollTop = Math.max(0, inner.scrollTop + deltaY);
        } else if (outer.scrollTop > 0) {
          // Table is at row 1, now page scrolls up!
          e.preventDefault();
          outer.scrollTop = Math.max(0, outer.scrollTop + deltaY);
        }
      }
    };

    const handleTouchEnd = () => {
      isTrackingTouch = false;
    };

    outer.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      outer.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isSettingsOpen]);

  const handleOuterScroll = () => {
    const outer = outerContainerRef.current;
    if (!outer) return;
    const max = maxOuterRef.current;
    if (outer.scrollTop > max) {
      outer.scrollTop = max;
    }
  };

  const handleSignIn = () => {
    soundManager.play('click');
    setAuthMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleCreateAccount = () => {
    soundManager.play('click');
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleSignOut = () => {
    soundManager.play('click');
    updateUser({
      fullName: 'Anonymous',
      username: 'anonymous',
      email: '',
      avatarUrl: undefined,
      provider: undefined,
      isLoggedIn: false,
    });
  };

  const handleSectionSwitch = (section: 'badges' | 'leaderboard') => {
    soundManager.play('click');
    setActiveSection(section);
  };

  // Calculate player progress stats
  const completedCount = Object.values(localProgress).filter((p) => p.completed).length;

  // Format identity details
  const displayName = user.isLoggedIn ? (user.fullName || 'Pilot') : 'Anonymous';
  const displayHandle = user.isLoggedIn ? user.username : null;

  const providerLabel =
    user.provider === 'google'
      ? 'Google OAuth'
      : user.provider === 'github'
      ? 'GitHub Developer'
      : user.provider === 'sso'
      ? 'ElseSourav SSO'
      : 'ElseSourav ID';

  return (
    <div
      ref={outerContainerRef}
      onScroll={handleOuterScroll}
      className="w-full h-full relative overflow-y-auto overflow-x-hidden flex flex-col items-center px-3.5 py-3 gap-3 pb-6 select-none cyber-grid-bg no-scrollbar"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* =========================================================================
          VIEW 1: DEDICATED SETTINGS PAGE (Opened only when Settings button clicked)
          ========================================================================= */}
      {isSettingsOpen ? (
        <div className="w-full max-w-sm flex flex-col gap-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
          {/* Header Bar with Back Button */}
          <div className="w-full flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => {
                soundManager.play('click');
                setIsSettingsOpen(false);
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
                  onClick={handleSignOut}
                  className="px-3 py-1 rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-display font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-3 h-3 text-red-400" />
                  <span>SIGN OUT</span>
                </button>
              </div>
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

          {/* Sound, Haptics, Simulation Hardware & Data Storage Settings */}
          <ProfileSettingsGroup />
        </div>
      ) : (
        /* =========================================================================
            VIEW 2: MAIN PROFILE PAGE (Profile card, Stats, Sign-In/Up & Leaderboard/Badges)
            ========================================================================= */
        <div className="w-full max-w-sm flex flex-col gap-2.5">
          {/* 1. Hero Player Profile Card */}
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
              {/* Glowing Avatar */}
              <div className="relative flex-shrink-0">
                {user.isLoggedIn && user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="w-13 h-13 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_16px_rgba(0,247,255,0.5)]"
                  />
                ) : user.isLoggedIn ? (
                  <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[2px] shadow-[0_0_16px_rgba(0,247,255,0.45)]">
                    <div className="w-full h-full rounded-full bg-[#070a1a] flex items-center justify-center text-cyan-300 font-tech font-bold text-base tracking-wider">
                      {(user.username || 'P').slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-500/50 via-slate-600 to-slate-800 p-[2px] shadow-[0_0_12px_rgba(0,247,255,0.3)]">
                    <div className="w-full h-full rounded-full bg-[#070a1a] flex items-center justify-center text-cyan-400">
                      <UserIcon className="w-6 h-6 stroke-[2]" />
                    </div>
                  </div>
                )}

                {/* Status Indicator Dot */}
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#090d24] ${
                    user.isLoggedIn
                      ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                      : 'bg-cyan-400/80 shadow-[0_0_6px_#00f7ff]'
                  }`}
                />
              </div>

              {/* User Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-bold text-white truncate font-display tracking-wide">
                    {displayName}
                  </h2>
                  {user.isLoggedIn && (
                    <UserCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  )}
                </div>
                {displayHandle ? (
                  <p className="text-xs text-cyan-400 font-tech truncate mt-0.5">
                    @{displayHandle}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 font-ui truncate mt-0.5">
                    Guest Pilot • Local Saves
                  </p>
                )}
              </div>

              {/* Header Actions: Online status (if logged in) & Enhanced Cyber Settings Button */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {user.isLoggedIn && (
                  <span className="text-[10px] font-tech font-bold px-2 py-0.5 rounded-full border border-emerald-500/50 text-emerald-300 bg-emerald-950/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                    ONLINE
                  </span>
                )}

                {/* Dedicated Cyber Settings Button Component */}
                <button
                  type="button"
                  onClick={() => {
                    soundManager.play('click');
                    setIsSettingsOpen(true);
                  }}
                  className="cyber-btn-settings"
                  title="System Settings"
                  aria-label="Open System Settings"
                >
                  <Settings className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SETTINGS</span>
                </button>
              </div>
            </div>

            {/* Account Details & Quick Stats: Cores, Badges, Created */}
            <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-cyan-500/15 text-center">
              <div
                onClick={() => handleSectionSwitch('leaderboard')}
                className="bg-black/40 rounded-xl p-2 border border-cyan-500/20 cursor-pointer hover:border-cyan-400/50 hover:bg-cyan-950/30 transition-all active:scale-95"
                title="View Overall Score Leaderboard"
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
                onClick={() => handleSectionSwitch('badges')}
                className="bg-black/40 rounded-xl p-2 border border-cyan-500/20 cursor-pointer hover:border-amber-400/50 hover:bg-amber-950/20 transition-all active:scale-95"
                title="View Badges Showcase"
              >
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 font-ui font-medium">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Badges</span>
                </div>
                <p className="text-sm font-bold text-amber-300 mt-0.5 font-tech">
                  {unlockedBadgesCount} <span className="text-slate-400 text-[10px]">/ {totalBadgesCount}</span>
                </p>
              </div>

              <div className="bg-black/40 rounded-xl p-2 border border-cyan-500/20">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 font-ui font-medium">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Created</span>
                </div>
                <p className="text-sm font-bold text-purple-300 mt-0.5 font-tech">
                  {userCreatedLevels.length}
                </p>
              </div>
            </div>

            {/* AFTER ACCOUNT DETAILS: High-Impact Sign-In & Sign-Up Buttons for Unauthenticated Users */}
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
                  {/* Cyber Sign In Button */}
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="cyber-btn-glass"
                    style={{ width: '100%' }}
                  >
                    <LogIn className="w-4 h-4 text-cyan-400" />
                    <span>SIGN IN</span>
                  </button>

                  {/* Cyber Sign Up Button */}
                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    className="cyber-btn-primary"
                    style={{ width: '100%' }}
                  >
                    <UserPlus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span>SIGN UP</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Logged-In User Details */
              <div className="mt-3 pt-2.5 border-t border-cyan-500/15 flex flex-col gap-1.5 text-[11px] font-ui">
                {user.email && (
                  <div className="flex items-center gap-2 text-slate-300 truncate">
                    <Mail className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="truncate" style={{ color: '#cbd5e1' }}>
                      {user.email}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span style={{ color: '#94a3b8' }}>{providerLabel}</span>
                  </span>
                  <span className="text-emerald-400 font-tech font-bold">
                    CLOUD SYNC ACTIVE
                  </span>
                </div>
              </div>
            )}

            {/* Subtle Ecosystem Credit inside Hero Card (scrolls away cleanly with Hero) */}
            <div className="mt-3 pt-2.5 border-t border-cyan-500/15 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <img
                src="/logo.png"
                alt="Breakout Ball"
                className="w-3.5 h-3.5 rounded-full object-cover shadow-[0_0_6px_#ff4500]"
              />
              <span>Breakout Ball V2 • Ecosystem by </span>
              <a
                href="https://elsesourav.com"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 font-bold hover:underline"
              >
                ElseSourav
              </a>
            </div>
          </div>

          {/* 2. STICKY CATEGORY SWITCHER BAR (Locks smoothly at top: 0px without clipping) */}
          <div
            ref={switcherRef}
            style={{
              position: 'sticky',
              top: '0px',
              zIndex: 30,
              backgroundColor: 'rgba(5, 7, 22, 0.98)',
            }}
            className="w-full pt-1.5 pb-1 backdrop-blur-md"
          >
            {/* Category Switcher: 1st BADGES, 2nd LEADERBOARD (Both use Yellow Button) */}
            <div
              style={{
                backgroundColor: 'rgba(8, 13, 38, 0.96)',
                border: '1.5px solid rgba(0, 247, 255, 0.28)',
                borderRadius: '14px',
                padding: '4px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 14px rgba(0, 247, 255, 0.12)',
              }}
              className="w-full flex items-center gap-1.5"
            >
              {/* 1st Tab: BADGES */}
              <button
                type="button"
                onClick={() => handleSectionSwitch('badges')}
                style={
                  activeSection === 'badges'
                    ? {
                        background: 'linear-gradient(135deg, #ffd700 0%, #d97706 100%)',
                        color: '#000000',
                        border: '1.5px solid #ffd700',
                        boxShadow:
                          '0 0 16px rgba(255, 215, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                      }
                    : {
                        background: 'transparent',
                        color: '#94a3b8',
                        border: '1.5px solid transparent',
                      }
                }
                className="flex-1 py-2 rounded-lg font-tech font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Award className="w-3.5 h-3.5" />
                <span>BADGES</span>
              </button>

              {/* 2nd Tab: LEADERBOARD */}
              <button
                type="button"
                onClick={() => handleSectionSwitch('leaderboard')}
                style={
                  activeSection === 'leaderboard'
                    ? {
                        background: 'linear-gradient(135deg, #ffd700 0%, #d97706 100%)',
                        color: '#000000',
                        border: '1.5px solid #ffd700',
                        boxShadow:
                          '0 0 16px rgba(255, 215, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                      }
                    : {
                        background: 'transparent',
                        color: '#94a3b8',
                        border: '1.5px solid transparent',
                      }
                }
                className="flex-1 py-2 rounded-lg font-tech font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>LEADERBOARD</span>
              </button>
            </div>
          </div>

          {/* 3. CONTENT CARD: Fills screen below sticky switcher with internal scrolling */}
          <div
            style={{
              height: 'calc(100dvh - 148px)',
              minHeight: '420px',
              maxHeight: '680px',
            }}
            className="w-full flex flex-col min-h-0 mt-2.5 mb-2.5"
          >
            <AnimatePresence mode="wait">
              {activeSection === 'badges' ? (
                <motion.div
                  key="badges"
                  initial={{ opacity: 0, y: 8, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.99 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full h-full"
                >
                  <AchievementsList />
                </motion.div>
              ) : (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, y: 8, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.99 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full h-full"
                >
                  <OverallScoreLeaderboard />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
