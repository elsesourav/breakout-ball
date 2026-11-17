import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { AchievementsList } from '../profile/AchievementsList';
import { ProfileHeroCard } from '../profile/ProfileHeroCard';
import { achievementManager } from '../../services/achievements';
import { soundManager } from '../../audio';
import { authService } from '../../services/auth';
import { PageHeaderWithBack } from '../navigation/PageHeaderWithBack';
import { TopCoresBadge } from '../common/TopCoresBadge';
import { FlyingCoresAnimation } from '../armory/FlyingCoresAnimation';
import { currencyService } from '../../services/currency';

// Calculate adaptive count-up duration based on the increment value
const getCountUpDuration = (diff: number): number => {
  if (diff <= 50) return 800;
  if (diff <= 250) return 950;
  if (diff <= 1000) return 1200;
  if (diff <= 5000) return 1500;
  return 1850; // for 10,000+ cores
};

export const ProfileView: React.FC = () => {
  const {
    user,
    updateUser,
    setIsAuthModalOpen,
    setAuthMode,
    localProgress,
    userCreatedLevels,
    setActiveTab,
  } = useGame();

  // Cores balance & bump-up count-up animation state
  const [cores, setCores] = useState<number>(() => currencyService.getBalance());
  const [displayCores, setDisplayCores] = useState<number>(cores);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const countUpRef = useRef<number | null>(null);
  const landingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const displayCoresRef = useRef(displayCores);
  displayCoresRef.current = displayCores;

  // Flying cores particle state for achievement claiming
  const [isFlyingCores, setIsFlyingCores] = useState<boolean>(false);
  const [flyOrigin, setFlyOrigin] = useState<{ x: number; y: number } | undefined>(undefined);
  const [flyTriggerKey, setFlyTriggerKey] = useState<number>(0);
  const [claimAmount, setClaimAmount] = useState<number>(25);

  useEffect(() => {
    currencyService.load(user.username).then(() => {
      const b = currencyService.getBalance();
      setCores(b);
      setDisplayCores(b);
    });
  }, [user.username]);

  // Track active collecting state in ref so currency listeners never cancel animations
  const isCollectingRef = useRef(false);
  isCollectingRef.current = isPulsing || isFlyingCores;

  // Cancel count-up, timers, and stop audio on component unmount
  useEffect(() => {
    return () => {
      soundManager.stopCollectSequence();
      if (countUpRef.current) cancelAnimationFrame(countUpRef.current);
      if (landingTimerRef.current) clearTimeout(landingTimerRef.current);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, []);

  // Synchronize currency balance when not actively collecting / counting up
  useEffect(() => {
    const sync = () => {
      if (!isCollectingRef.current) {
        const b = currencyService.getBalance();
        setCores(b);
        setDisplayCores(b);
      }
    };
    window.addEventListener('currency-changed', sync);
    window.addEventListener('currency_balance_changed', sync);
    return () => {
      window.removeEventListener('currency-changed', sync);
      window.removeEventListener('currency_balance_changed', sync);
    };
  }, []);

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

  const [unlockedAchievementsCount, setUnlockedAchievementsCount] = useState(() => {
    achievementManager.loadForUser(user.username);
    return achievementManager.getAll().filter((a) => a.unlocked).length;
  });
  const totalAchievementsCount = achievementManager.getAll().length || 15;

  useEffect(() => {
    const refresh = () => {
      setUnlockedAchievementsCount(achievementManager.getAll().filter((a) => a.unlocked).length);
    };
    achievementManager.loadForUser(user.username);
    refresh();
    const unsub = achievementManager.onUnlock(refresh);
    window.addEventListener('achievement_unlocked', refresh);
    window.addEventListener('achievement_updated', refresh);
    window.addEventListener('achievement_claimed', refresh);
    return () => {
      unsub();
      window.removeEventListener('achievement_unlocked', refresh);
      window.removeEventListener('achievement_updated', refresh);
      window.removeEventListener('achievement_claimed', refresh);
    };
  }, [user.username]);

  const startCountUp = useCallback(
    (target: number, fromVal?: number, customDuration?: number) => {
      if (countUpRef.current) cancelAnimationFrame(countUpRef.current);
      const startVal = fromVal !== undefined ? fromVal : displayCoresRef.current;
      const diff = target - startVal;
      if (diff <= 0) {
        setDisplayCores(target);
        soundManager.stopCollectSequence();
        return;
      }
      const duration = customDuration ?? getCountUpDuration(diff);
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // For large increments (> 500), easeInOutCubic gives a smooth start, rolling middle, and gentle settle
        const ease =
          diff > 500
            ? progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2
            : 1 - Math.pow(1 - progress, 2);

        const current = Math.round(startVal + diff * ease);
        setDisplayCores(current);

        if (progress < 1) {
          countUpRef.current = requestAnimationFrame(tick);
        } else {
          setDisplayCores(target);
          countUpRef.current = null;
          soundManager.stopCollectSequence();
          if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
          pulseTimerRef.current = setTimeout(() => {
            setIsPulsing(false);
          }, 200);
        }
      };

      countUpRef.current = requestAnimationFrame(tick);
    },
    []
  );

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

  const handleClaimSuccess = (reward: number, origin?: { x: number; y: number }) => {
    // Clear any previous scheduled landing or pulse stop timers
    if (landingTimerRef.current) clearTimeout(landingTimerRef.current);
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);

    const newBalance = currencyService.getBalance();
    const prevBalance = Math.max(0, newBalance - reward);
    const fromVal = Math.min(displayCoresRef.current, prevBalance);

    setDisplayCores(fromVal);
    setCores(newBalance);
    setClaimAmount(reward);
    if (origin) {
      setFlyOrigin(origin);
    } else {
      setFlyOrigin({ x: window.innerWidth / 2, y: window.innerHeight * 0.55 });
    }
    setIsFlyingCores(true);
    setFlyTriggerKey(Date.now());

    const diff = newBalance - fromVal;
    const duration = getCountUpDuration(diff);

    // Landing time: trigger bump-up, slowly increase counter, and play collect sound
    landingTimerRef.current = setTimeout(() => {
      setIsPulsing(true);
      soundManager.startCollectSequence(duration);
      startCountUp(newBalance, fromVal, duration);
    }, 650);
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden flex flex-col items-center bg-[#03040c] select-none"
      style={{ color: '#ffffff' }}
    >
      {/* ── Sticky Fixed Top Header Bar (Back, Centered Title, and Fixed Cores Counter) ── */}
      <div className="w-full sticky top-0 z-40 flex-shrink-0">
        <PageHeaderWithBack
          title="PILOT PROFILE"
          subtitle="STATS & IDENTITY"
          onBack={() => setActiveTab('local')}
          rightSlot={
            <TopCoresBadge
              cores={displayCores}
              isPulsing={isPulsing}
              onOpenShop={() => setActiveTab('shop')}
            />
          }
        />
      </div>

      {/* ── Scrollable Body Content ── */}
      <div
        className="w-full flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center px-3.5 pt-2 pb-16 cyber-grid-bg no-scrollbar"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          overscrollBehaviorY: 'contain',
        }}
      >
        <div className="w-full max-w-sm flex flex-col pb-8">
          {/* 1. Hero Player Profile Card */}
          <div className="w-full mt-1 mb-3">
            <ProfileHeroCard
              user={user}
              displayName={displayName}
              displayHandle={displayHandle}
              providerLabel={providerLabel}
              completedCount={completedCount}
              unlockedAchievementsCount={unlockedAchievementsCount}
              totalAchievementsCount={totalAchievementsCount}
              userCreatedLevelsCount={userCreatedLevels.length}
              onOpenLeaderboard={() => setActiveTab('leaderboard')}
              onSignIn={handleSignIn}
              onCreateAccount={handleCreateAccount}
            />
          </div>

          {/* 2. Achievements Showcase */}
          <div className="w-full flex flex-col min-h-0">
            <AchievementsList onClaimSuccess={handleClaimSuccess} />
          </div>
        </div>
      </div>

      {/* Flying Cores Animation from Achievement Claim to Top Core Counter */}
      <FlyingCoresAnimation
        active={isFlyingCores}
        amount={claimAmount}
        origin={flyOrigin}
        triggerKey={flyTriggerKey}
        onComplete={() => setIsFlyingCores(false)}
      />
    </div>
  );
};
