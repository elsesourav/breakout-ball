import React, { useEffect } from 'react';
import { useGame } from './context/GameContext';
import { Navigation } from './components/Navigation';
import { LocalMode } from './components/LocalMode';
import { OnlineMode } from './components/OnlineMode';
import { CreateMode } from './components/CreateMode';
import { ProfileView } from './components/ProfileView';
import { LevelPreviewModal } from './components/LevelPreviewModal';
import { LevelDesigner } from './components/LevelDesigner';
import { LevelModifierModal } from './components/LevelModifierModal';
import { GameCanvas } from './components/GameCanvas';
import { AlertModal } from './components/AlertModal';
import { AuthModal } from './components/AuthModal';

export const AppContent: React.FC = () => {
  const { screen, activeTab, editingLevel } = useGame();

  // Dynamic 9x16 responsive layout scaling
  useEffect(() => {
    const handleResize = () => {
      const oW = window.innerWidth;
      const oH = window.innerHeight;
      const deltaSize = Math.floor(oW * (16 / 9) < oH ? oW / 9 : oH / 16);
      const width = deltaSize * 9;
      const height = deltaSize * 16;
      document.documentElement.style.setProperty('--window-width', `${width}px`);
      document.documentElement.style.setProperty('--window-height', `${height}px`);
      document.documentElement.style.setProperty('--s', `${deltaSize}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main id="main">
      {screen === 'playing' ? (
        <GameCanvas />
      ) : screen === 'designer' ? (
        <LevelDesigner />
      ) : (
        <div id="gameMode">
          <Navigation />
          <div id="modeType">
            {activeTab === 'local' && <LocalMode />}
            {activeTab === 'online' && <OnlineMode />}
            {activeTab === 'create' && <CreateMode />}
            {activeTab === 'profile' && <ProfileView />}
          </div>
        </div>
      )}

      {/* Screen Modals & Overlays */}
      {screen === 'preview' && <LevelPreviewModal />}
      {editingLevel && <LevelModifierModal />}
      <AlertModal />
      <AuthModal />
    </main>
  );
};

export default function App() {
  return <AppContent />;
}
