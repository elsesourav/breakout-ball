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
import { ProfileSettingsView } from './profile/ProfileSettingsView';
import { ProfileHeroCard } from './profile/ProfileHeroCard';
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
  const [activeSection, setActiveSection] = useState<'badges' | 'leaderboard'>(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('section') === 'leaderboard' || sp.get('tab') === 'leaderboard') {
        return 'leaderboard';
      }
    }
    return 'badges';
  });
  const [unlockedBadgesCount, setUnlockedBadgesCount] = useState(() => {
    return achievementManager.getAll().filter((a) => a.unlocked).length;
  });
  const totalBadgesCount = achievementManager.getAll().length || 8;

  const outerContainerRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const maxOuterRef = useRef<number>(320);

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

  // Accurately compute sticky lock threshold (distance needed to scroll away hero card)
  useEffect(() => {
    const updateMaxOuter = () => {
      const switcher = switcherRef.current;
      if (switcher && switcher.offsetTop > 50) {
        maxOuterRef.current = switcher.offsetTop;
      } else if (heroCardRef.current) {
        maxOuterRef.current = heroCardRef.current.offsetHeight + 10;
      }
    };
    updateMaxOuter();
    const raf = requestAnimationFrame(updateMaxOuter);
    if (activeSection === 'leaderboard' && outerContainerRef.current) {
      const target = switcherRef.current && switcherRef.current.offsetTop > 50
        ? switcherRef.current.offsetTop
        : maxOuterRef.current;
      outerContainerRef.current.scrollTop = target;
    }
    window.addEventListener('resize', updateMaxOuter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateMaxOuter);
    };
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
    const getMaxOuter = () => (switcherRef.current && switcherRef.current.offsetTop > 50 ? switcherRef.current.offsetTop : maxOuterRef.current);

    // 1. WHEEL COORDINATOR (Desktop mouse wheel & trackpad)
    const handleWheel = (e: WheelEvent) => {
      const deltaY = e.deltaY;
      if (!deltaY) return;

      const inner = getInner();
      const maxOuter = getMaxOuter();

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
      const maxOuter = getMaxOuter();

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
    const max = switcherRef.current && switcherRef.current.offsetTop > 50
      ? switcherRef.current.offsetTop
      : maxOuterRef.current;
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
        <div className="w-full max-w-sm flex flex-col gap-2.5">
          {/* 1. Hero Player Profile Card */}
          <div ref={heroCardRef} className="w-full">
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
