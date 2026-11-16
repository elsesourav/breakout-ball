import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { updatePageMetadata, buildLevelMetadata, buildTabMetadata } from '../services/seo';

/**
 * Automatically updates document metadata, Open Graph, Twitter Cards,
 * canonical URLs, and JSON-LD schema based on the current active view or level.
 */
export const usePageMeta = (): void => {
  const { activeTab, screen, selectedLevel } = useGame();

  useEffect(() => {
    try {
      if ((screen === 'preview' || screen === 'playing') && selectedLevel) {
        // Level Preview or Active Gameplay
        const meta = buildLevelMetadata(selectedLevel, screen === 'playing' ? 'playing' : 'preview');
        updatePageMetadata(meta);
      } else {
        // Main Tab Views (/arcade, /arena, /armory, /studio, /profile)
        const meta = buildTabMetadata(activeTab);
        updatePageMetadata(meta);
      }
    } catch {
      // Ignore metadata update errors in constrained environments
    }
  }, [activeTab, screen, selectedLevel]);
};
