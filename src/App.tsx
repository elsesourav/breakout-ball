import React, { useEffect } from 'react';
import { useGame } from './context/GameContext';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { LevelRoadmap } from './components/LevelRoadmap';
import { OnlineMode } from './components/OnlineMode';
import { CreateMode } from './components/CreateMode';
import { ProfileView } from './components/ProfileView';
import { LevelPreviewModal } from './components/LevelPreviewModal';
import { LevelDesigner } from './components/LevelDesigner';
import { LevelModifierModal } from './components/LevelModifierModal';
import { GameCanvas } from './components/GameCanvas';
import { AlertModal } from './components/AlertModal';
import { AuthModal } from './components/AuthModal';
import { AchievementToast } from './components/AchievementToast';

export const AppContent: React.FC = () => {
  const { screen, activeTab, editingLevel } = useGame();

  // Dynamic mobile-first responsive layout scaling (strictly using 100svh for height)
  useEffect(() => {
    const handleResize = () => {
      const oW = window.innerWidth;
      const oH = window.innerHeight;

      if (oW <= 540) {
        // Fullscreen mobile viewport
        const width = oW;
        const deltaSize = Math.max(28, Math.floor(width / 9));
        document.documentElement.style.setProperty('--window-width', `${width}px`);
        document.documentElement.style.setProperty('--window-height', `100svh`);
        document.documentElement.style.setProperty('--s', `${deltaSize}px`);
      } else {
        // Desktop / Tablet 9x16 centered arcade display
        const deltaSize = Math.floor(oW * (16 / 9) < oH ? oW / 9 : oH / 16);
        const width = deltaSize * 9;
        const height = deltaSize * 16;
        document.documentElement.style.setProperty('--window-width', `${width}px`);
        document.documentElement.style.setProperty('--window-height', `${height}px`);
        document.documentElement.style.setProperty('--s', `${deltaSize}px`);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <main id="main">
      {screen === 'playing' ? (
        <GameCanvas />
      ) : screen === 'designer' ? (
        <LevelDesigner />
      ) : (
        <div id="gameMode">
          <div id="modeType">
            {activeTab === 'local' && <LevelRoadmap />}
            {activeTab === 'online' && <OnlineMode />}
            {activeTab === 'create' && <CreateMode />}
            {activeTab === 'profile' && <ProfileView />}
          </div>
          <MobileBottomNav />
        </div>
      )}

      {/* Screen Modals & Overlays */}
      {screen === 'preview' && <LevelPreviewModal />}
      {editingLevel && <LevelModifierModal />}
      <AlertModal />
      <AuthModal />
      <AchievementToast />
    </main>
  );
};

export default function App() {
  return <AppContent />;
}
