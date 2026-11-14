import { ActiveTab, GameScreen } from '../types/game';

export interface RouteState {
  type: 'tab' | 'level' | 'play';
  tab: ActiveTab;
  levelId?: string;
}

/**
 * Remove unwanted ?theme= query parameter injected by external libraries or history
 */
export const scrubUrlParams = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('theme')) {
      url.searchParams.delete('theme');
      const cleanSearch = url.searchParams.toString();
      const newUrl = url.pathname + (cleanSearch ? `?${cleanSearch}` : '') + url.hash;
      window.history.replaceState(window.history.state, '', newUrl);
    }
  } catch {
    // Ignore URL parse errors
  }
};

/**
 * Parse current browser URL pathname into game route state
 */
export const parseCurrentRoute = (): RouteState => {
  if (typeof window === 'undefined') {
    return { type: 'tab', tab: 'local' };
  }

  scrubUrlParams();

  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  // /level/:id -> preview modal for specified level
  if (path.startsWith('/level/')) {
    const levelId = decodeURIComponent(path.replace('/level/', '').trim());
    return { type: 'level', tab: 'local', levelId };
  }

  // /play/:id -> active gameplay for specified level
  if (path.startsWith('/play/')) {
    const levelId = decodeURIComponent(path.replace('/play/', '').trim());
    return { type: 'play', tab: 'local', levelId };
  }

  // Primary tabs
  if (path === '/arena') {
    return { type: 'tab', tab: 'online' };
  }
  if (path === '/studio') {
    return { type: 'tab', tab: 'create' };
  }
  if (path === '/profile') {
    return { type: 'tab', tab: 'profile' };
  }

  // Default to Arcade roadmap
  return { type: 'tab', tab: 'local' };
};

/**
 * Get canonical URL pathname for a given game state
 */
export const getRoutePath = (
  tab: ActiveTab,
  screen: GameScreen,
  levelId?: string | null
): string => {
  if (screen === 'preview' && levelId) {
    return `/level/${encodeURIComponent(levelId)}`;
  }
  if (screen === 'playing' && levelId) {
    return `/play/${encodeURIComponent(levelId)}`;
  }

  switch (tab) {
    case 'online':
      return '/arena';
    case 'create':
      return '/studio';
    case 'profile':
      return '/profile';
    case 'local':
    default:
      return '/arcade';
  }
};

/**
 * Push new URL state without reloading
 */
export const pushAppRoute = (path: string): void => {
  if (typeof window === 'undefined') return;
  scrubUrlParams();
  if (window.location.pathname !== path) {
    window.history.pushState({ path }, '', path);
  }
};

/**
 * Replace URL state without creating history entry
 */
export const replaceAppRoute = (path: string): void => {
  if (typeof window === 'undefined') return;
  scrubUrlParams();
  window.history.replaceState({ path }, '', path);
};
