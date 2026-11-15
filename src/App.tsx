import React, { useEffect } from 'react';
import { useGame } from './context/GameContext';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { LevelMap } from './components/LevelMap';
import { OnlineMode } from './components/OnlineMode';
import { ArmoryView } from './components/ArmoryView';
import { CreateMode } from './components/CreateMode';
import { ProfileView } from './components/ProfileView';
import { LevelPreviewModal } from './components/LevelPreviewModal';
import { LevelDesigner } from './components/LevelDesigner';
import { VisualDesignLab } from './components/VisualDesignLab';
import { LevelModifierModal } from './components/LevelModifierModal';
import { GameCanvas } from './components/GameCanvas';
import { AlertModal } from './components/AlertModal';
import { AuthModal } from './components/AuthModal';
import { AchievementToast } from './components/AchievementToast';

export const AppContent: React.FC = () => {
  const { screen, setScreen, activeTab, editingLevel } = useGame();

  // Dynamic mobile-first responsive layout scaling (strictly using 100svh for height)
  useEffect(() => {
    const handleResize = () => {
      const oW = window.innerWidth;
      const oH = window.innerHeight;

      if (oW <= 768) {
        // Fullscreen mobile / tablet viewport
        const width = oW;
        const deltaSize = Math.max(28, Math.floor(width / 9));
        document.documentElement.style.setProperty('--window-width', `${width}px`);
        document.documentElement.style.setProperty('--window-height', `100svh`);
        document.documentElement.style.setProperty('--s', `${deltaSize}px`);
      } else {
        // Desktop full-height centered mobile arcade chassis
        const height = oH;
        const width = Math.min(460, Math.floor(height * (9 / 19.5)));
        const deltaSize = Math.max(32, Math.floor(width / 9));
        document.documentElement.style.setProperty('--window-width', `${width}px`);
        document.documentElement.style.setProperty('--window-height', `100svh`);
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
      ) : screen === 'design-lab' ? (
        <VisualDesignLab onBack={() => setScreen('menu')} />
      ) : (
        <div id="gameMode">
          <div id="modeType" className="w-full h-full relative overflow-hidden">
            <div key={activeTab} className="cyber-page-transition w-full h-full">
              {activeTab === 'local' && <LevelMap />}
              {activeTab === 'online' && <OnlineMode />}
              {activeTab === 'armory' && <ArmoryView />}
              {activeTab === 'create' && <CreateMode />}
              {activeTab === 'profile' && <ProfileView />}
            </div>
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
