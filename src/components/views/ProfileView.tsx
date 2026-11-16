import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { AchievementsList } from '../profile/AchievementsList';
import { ProfileHeroCard } from '../profile/ProfileHeroCard';
import { achievementManager } from '../../services/achievements';
import { soundManager } from '../../audio';
import { authService } from '../../services/auth';
import { PageHeaderWithBack } from '../navigation/PageHeaderWithBack';

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
    return achievementManager.getAll().filter((a) => a.unlocked).length;
  });
  const totalAchievementsCount = achievementManager.getAll().length || 15;

  useEffect(() => {
    achievementManager.loadForUser(user.username);
    setUnlockedAchievementsCount(achievementManager.getAll().filter((a) => a.unlocked).length);
  }, [user.username]);

  useEffect(() => {
    const unsub = achievementManager.onUnlock(() => {
      setUnlockedAchievementsCount(achievementManager.getAll().filter((a) => a.unlocked).length);
    });
    return unsub;
  }, []);

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

  return (
    <div
      className="w-full h-full relative overflow-y-auto overflow-x-hidden flex flex-col items-center px-3.5 pt-0 pb-12 cyber-grid-bg no-scrollbar select-none"
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        overscrollBehaviorY: 'contain',
        color: '#ffffff',
      }}
    >
      <div className="w-full max-w-sm flex flex-col pb-8">
        {/* Top Page Header with Back Button */}
        <div className="w-full -mx-0 mb-1">
          <PageHeaderWithBack
            title="PILOT PROFILE"
            subtitle="STATS & IDENTITY"
            onBack={() => setActiveTab('local')}
            showCores={true}
          />
        </div>

        {/* 1. Hero Player Profile Card */}
        <div className="w-full mt-2 mb-3">
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
          <AchievementsList />
        </div>
      </div>
    </div>
  );
};
