import React, { useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useGame } from './context/GameContext';
import { SideNavDock } from './components/navigation/SideNavDock';
import { ArcadeView, ArenaView, ArmoryView, ProfileView, ShopView, StudioView } from './components/views';
import { LevelDesigner } from './components/designer';
import { GameCanvas } from './components/gameplay';
import { AlertModal, AuthModal, LevelModifierModal, LevelPreviewModal, SettingsModal } from './components/modals';
import { AchievementToast, CyberToastContainer, GameLoadingScreen } from './components/common';
import { usePageMeta } from './hooks/usePageMeta';

export const AppContent: React.FC = () => {
  const { screen, setScreen, activeTab, editingLevel, isInitialLoading } = useGame();

  // Dynamic SEO, Open Graph & Twitter Card synchronization
  usePageMeta();

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
    <>
      <AnimatePresence mode="wait">
        {isInitialLoading && (
          <GameLoadingScreen key="app-initial-loader" isLoaded={!isInitialLoading} />
        )}
      </AnimatePresence>

      <main
        id="main"
        style={{
          opacity: isInitialLoading ? 0 : 1,
          transition: 'opacity 0.45s ease-out',
        }}
      >
        {screen === 'playing' ? (
          <GameCanvas />
        ) : screen === 'designer' ? (
          <LevelDesigner />
        ) : (
          <div id="gameMode" className="w-full h-full relative">
            <div id="modeType" className="w-full h-full relative overflow-hidden">
              <div key={activeTab} className="cyber-page-transition w-full h-full">
                {activeTab === 'local' && (
                  <>
                    <ArcadeView />
                    <SideNavDock />
                  </>
                )}
                {activeTab === 'online' && <ArenaView />}
                {activeTab === 'armory' && <ArmoryView />}
                {activeTab === 'create' && <StudioView />}
                {activeTab === 'profile' && <ProfileView />}
                {activeTab === 'shop' && <ShopView />}
              </div>
            </div>
          </div>
        )}

        {/* Screen Modals & Overlays */}
        {screen === 'preview' && <LevelPreviewModal />}
        {editingLevel && <LevelModifierModal />}
        <AlertModal />
        <AuthModal />
        <SettingsModal />
        <AchievementToast />
        <CyberToastContainer />
      </main>
    </>
  );
};

export default function App() {
  return <AppContent />;
}
