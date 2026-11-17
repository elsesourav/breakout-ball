/**
 * Dedicated persistence and state management for Arcade Campaign Map scrolling
 * Guarantees map opens directly centered on the active/current play level across
 * page reloads, browser back/popstate navigation, and modal dismissals.
 */

let savedArcadeScrollTop: number | null = null;

export const arcadeScrollService = {
  getSavedScroll: (): number | null => savedArcadeScrollTop,

  setSavedScroll: (top: number | null): void => {
    savedArcadeScrollTop = top;
  },

  reset: (): void => {
    savedArcadeScrollTop = null;
  },

  getLastPlayedLevel: (): number => {
    if (typeof localStorage === 'undefined') return 1;
    const val = parseInt(localStorage.getItem('breakout_last_played_level') || '0', 10);
    return !isNaN(val) && val >= 1 && val <= 100 ? val : 1;
  },

  setLastPlayedLevel: (levelId: number | string): void => {
    if (typeof localStorage === 'undefined') return;
    const num = typeof levelId === 'number' ? levelId : parseInt(levelId, 10);
    if (!isNaN(num) && num >= 1 && num <= 100) {
      localStorage.setItem('breakout_last_played_level', String(num));
    }
  },
};
