import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import {
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
import { ProfileSettingsView } from './profile/ProfileSettingsView';
import { ProfileHeroCard } from './profile/ProfileHeroCard';
import { achievementManager } from '../services/achievements';
import { soundManager } from '../utils/audio';
import { authService } from '../services/auth';

export const ProfileView: React.FC = () => {
  const {
    user,
    updateUser,
    setIsAuthModalOpen,
    setAuthMode,
    localProgress,
    userCreatedLevels,
    logoutUser,
  } = useGame();

  const [isSettingsOpen, setIsSettingsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).has('settings');
    }
    return false;
  });
  const [activeSection, setActiveSection] = useState<'badges' | 'leaderboard'>(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('section') === 'leaderboard' || sp.get('tab') === 'leaderboard') {
        return 'leaderboard';
      }
    }
    return 'badges';
  });

  // Auto-refresh profile avatar when user returns to game tab from ElseSourav.com
  useEffect(() => {
    const handleFocus = async () => {
      const refreshed = await authService.refreshUserProfile();
      if (refreshed?.avatarUrl && refreshed.avatarUrl !== user.avatarUrl) {
        updateUser({ avatarUrl: refreshed.avatarUrl, fullName: refreshed.fullName });
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user.avatarUrl, updateUser]);
  const [unlockedBadgesCount, setUnlockedBadgesCount] = useState(() => {
    return achievementManager.getAll().filter((a) => a.unlocked).length;
  });
  const totalBadgesCount = achievementManager.getAll().length || 8;

  const outerContainerRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const maxOuterRef = useRef<number>(320);
  const [contentCardHeight, setContentCardHeight] = useState<number | null>(null);

  useEffect(() => {
    achievementManager.loadForUser(user.username);
    setUnlockedBadgesCount(achievementManager.getAll().filter((a) => a.unlocked).length);
  }, [user.username]);

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

  // Dynamically compute exact card height and scroll threshold so top and bottom gaps are pixel-perfect symmetrical
  useEffect(() => {
    const updateLayout = () => {
      if (!outerContainerRef.current || !switcherRef.current) return;
      if (switcherRef.current) {
        maxOuterRef.current = switcherRef.current.offsetTop;
      } else if (heroCardRef.current) {
        maxOuterRef.current = heroCardRef.current.offsetHeight + 18;
      }
      const viewportHeight = outerContainerRef.current.clientHeight;
      const switcherHeight = switcherRef.current.offsetHeight;
      const CARD_GAP = 14; // Symmetrical 14px gap on both top and bottom
      const computedHeight = viewportHeight - switcherHeight - (CARD_GAP * 2);
      if (computedHeight > 220) {
        setContentCardHeight(computedHeight);
      }
    };

    updateLayout();
    const raf1 = requestAnimationFrame(() => {
      updateLayout();
      requestAnimationFrame(updateLayout);
    });
    window.addEventListener('resize', updateLayout);
    return () => {
      cancelAnimationFrame(raf1);
      window.removeEventListener('resize', updateLayout);
    };
  }, [isSettingsOpen, activeSection]);

  // Universal Wheel & Touch Coordinator: Body scrolls first, then table scrolls starting at docking point
  useEffect(() => {
    if (isSettingsOpen) return;

    const outer = outerContainerRef.current;
    if (!outer) return;

    const getInner = () => outer.querySelector<HTMLElement>('[data-inner-scroll="true"]');

    // 1. Wheel Coordinator (Mouse Wheel & Trackpad): Body first, then table
    const handleWheel = (e: WheelEvent) => {
      const deltaY = e.deltaY;
      if (!deltaY) return;

      const inner = getInner();
      const maxOuter = maxOuterRef.current;

      if (deltaY > 0) {
        // Scrolling DOWN
        if (outer.scrollTop < maxOuter - 0.5) {
          // Phase 1: Scroll body first until switcher is docked at top
          outer.scrollTop = Math.min(maxOuter, outer.scrollTop + deltaY);
        } else if (inner) {
          // Phase 2: Switcher is docked, now scroll table down
          const maxInner = inner.scrollHeight - inner.clientHeight;
          inner.scrollTop = Math.min(maxInner, inner.scrollTop + deltaY);
        }
        e.preventDefault();
      } else if (deltaY < 0) {
        // Scrolling UP
        if (inner && inner.scrollTop > 0.5) {
          // Phase 1: Scroll table back up to player #1 first
          inner.scrollTop = Math.max(0, inner.scrollTop + deltaY);
        } else if (outer.scrollTop > 0) {
          // Phase 2: Table is at top, now scroll body back down to reveal Hero card
          outer.scrollTop = Math.max(0, outer.scrollTop + deltaY);
        }
        e.preventDefault();
      }
    };

    // 2. Touch Coordinator (Mobile Phone & Tablet Touch Swiping with Momentum): Body first, then table
    let touchStartY = 0;
    let lastTouchY = 0;
    let lastTouchTime = 0;
    let touchVelocity = 0;
    let momentumRaf: number | null = null;

    const stopMomentum = () => {
      if (momentumRaf !== null) {
        cancelAnimationFrame(momentumRaf);
        momentumRaf = null;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      stopMomentum();
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        lastTouchY = touchStartY;
        lastTouchTime = performance.now();
        touchVelocity = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      const now = performance.now();
      const deltaY = touchStartY - currentY;
      touchStartY = currentY;

      // Track touch velocity for momentum
      const dt = Math.max(1, now - lastTouchTime);
      const dy = lastTouchY - currentY;
      touchVelocity = (dy / dt) * 16;
      lastTouchY = currentY;
      lastTouchTime = now;

      if (Math.abs(deltaY) < 0.5) return;

      const inner = getInner();
      const maxOuter = maxOuterRef.current;

      if (deltaY > 0) {
        // Dragging content UP / scrolling DOWN: Body first, then table
        if (outer.scrollTop < maxOuter - 0.5) {
          outer.scrollTop = Math.min(maxOuter, outer.scrollTop + deltaY);
        } else if (inner) {
          const maxInner = inner.scrollHeight - inner.clientHeight;
          inner.scrollTop = Math.min(maxInner, inner.scrollTop + deltaY);
        }
        if (e.cancelable) e.preventDefault();
      } else if (deltaY < 0) {
        // Dragging content DOWN / scrolling UP: Table first, then body
        if (inner && inner.scrollTop > 0.5) {
          inner.scrollTop = Math.max(0, inner.scrollTop + deltaY);
        } else if (outer.scrollTop > 0) {
          outer.scrollTop = Math.max(0, outer.scrollTop + deltaY);
        }
        if (e.cancelable) e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (Math.abs(touchVelocity) < 1.2) return;

      let v = touchVelocity;
      const step = () => {
        v *= 0.94; // Decay friction
        if (Math.abs(v) < 0.5) {
          momentumRaf = null;
          return;
        }

        const inner = getInner();
        const maxOuter = maxOuterRef.current;

        if (v > 0) {
          if (outer.scrollTop < maxOuter - 0.5) {
            outer.scrollTop = Math.min(maxOuter, outer.scrollTop + v);
          } else if (inner) {
            const maxInner = inner.scrollHeight - inner.clientHeight;
            inner.scrollTop = Math.min(maxInner, inner.scrollTop + v);
          }
        } else if (v < 0) {
          if (inner && inner.scrollTop > 0.5) {
            inner.scrollTop = Math.max(0, inner.scrollTop + v);
          } else if (outer.scrollTop > 0) {
            outer.scrollTop = Math.max(0, outer.scrollTop + v);
          }
        }

        momentumRaf = requestAnimationFrame(step);
      };

      momentumRaf = requestAnimationFrame(step);
    };

    outer.addEventListener('wheel', handleWheel, { passive: false });
    outer.addEventListener('touchstart', handleTouchStart, { passive: true });
    outer.addEventListener('touchmove', handleTouchMove, { passive: false });
    outer.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      stopMomentum();
      outer.removeEventListener('wheel', handleWheel);
      outer.removeEventListener('touchstart', handleTouchStart);
      outer.removeEventListener('touchmove', handleTouchMove);
      outer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSettingsOpen]);

  const handleOuterScroll = () => {
    // Outer scroll handler; hard snapping removed to prevent glitching at boundaries
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

  const handleSignOut = async () => {
    await logoutUser();
    setIsSettingsOpen(false);
    setUnlockedBadgesCount(0);
  };

  const handleSectionSwitch = (section: 'badges' | 'leaderboard') => {
    soundManager.play('click');
    setActiveSection(section);
  };

  // Calculate player progress stats
  const completedCount = Object.values(localProgress).filter((p) => p.completed).length;

  // Format identity details
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

  return (
    <div
      ref={outerContainerRef}
      onScroll={handleOuterScroll}
      className="w-full h-full relative overflow-y-auto overflow-x-hidden flex flex-col items-center px-3.5 pt-0 pb-0 cyber-grid-bg no-scrollbar"
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        overscrollBehaviorY: 'contain',
        color: '#ffffff',
      }}
    >
      {/* =========================================================================
          VIEW 1: DEDICATED SETTINGS PAGE (Opened only when Settings button clicked)
          ========================================================================= */}
      {isSettingsOpen ? (
        <ProfileSettingsView
          onBack={() => setIsSettingsOpen(false)}
          user={user}
          displayName={displayName}
          displayHandle={displayHandle}
          providerLabel={providerLabel}
          onSignOut={handleSignOut}
          onSignIn={handleSignIn}
          onCreateAccount={handleCreateAccount}
        />
      ) : (
        /* =========================================================================
            VIEW 2: MAIN PROFILE PAGE (Profile card, Stats, Sign-In/Up & Leaderboard/Badges)
            ========================================================================= */
        <div className="w-full max-w-sm flex flex-col">
          {/* 1. Hero Player Profile Card */}
          <div ref={heroCardRef} className="w-full mt-2 mb-2.5">
            <ProfileHeroCard
              user={user}
              displayName={displayName}
              displayHandle={displayHandle}
              providerLabel={providerLabel}
              completedCount={completedCount}
              unlockedBadgesCount={unlockedBadgesCount}
              totalBadgesCount={totalBadgesCount}
              userCreatedLevelsCount={userCreatedLevels.length}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onSectionSwitch={handleSectionSwitch}
              onSignIn={handleSignIn}
              onCreateAccount={handleCreateAccount}
            />
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
            className="w-full pt-1 pb-1 backdrop-blur-md"
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

          {/* 3. CONTENT CARD: Sits below sticky switcher with SYMMETRICAL even top and bottom gaps */}
          <div
            style={{
              height: contentCardHeight ? `${contentCardHeight}px` : 'calc(100dvh - 176px)',
              maxHeight: contentCardHeight ? `${contentCardHeight}px` : 'calc(100dvh - 176px)',
              minHeight: '340px',
              marginTop: '14px',
              marginBottom: '14px',
            }}
            className="w-full flex flex-col min-h-0"
          >
            <AnimatePresence mode="wait">
              {activeSection === 'badges' ? (
                <motion.div
                  key="badges"
                  initial={{ opacity: 0, y: 8, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.99 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full h-full flex flex-col min-h-0"
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
                  className="w-full h-full flex flex-col min-h-0"
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
