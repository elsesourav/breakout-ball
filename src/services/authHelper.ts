import { backendApi } from './backendApi';

export interface AuthUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  provider: 'credentials' | 'google' | 'github' | 'sso';
  isLoggedIn: boolean;
  isAdmin?: boolean;
  token?: string;
}

export function isUserAdmin(user?: { username?: string; email?: string; isAdmin?: boolean } | null): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  const uname = (user.username || '').toLowerCase();
  const email = (user.email || '').toLowerCase();
  return uname === 'elsesourav' || email === 'elsesourav@gmail.com';
}

export function getAnonymousUserId(): string {
  const anonUserKey = 'breakout_anon_user_id';
  let anonId = typeof localStorage !== 'undefined' ? localStorage.getItem(anonUserKey) : null;
  if (!anonId) {
    const rand = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    anonId = `anon_${rand}`;
    if (typeof localStorage !== 'undefined') localStorage.setItem(anonUserKey, anonId);
  }
  return anonId;
}

/**
 * Returns the exact current application URL for OAuth redirects.
 * Retains subpaths like /apps/breakout-ball so mobile & desktop OAuth
 * return directly to the game instead of the elsesourav.com dashboard.
 */
export function getOAuthRedirectUrl(): string {
  if (typeof window === 'undefined') return 'https://elsesourav.com/apps/breakout-ball';
  const cleanPath = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '');
  return `${window.location.origin}${cleanPath || '/'}`;
}

/**
 * Detects mobile browsers or standalone PWA mode.
 * On mobile/PWA, popup windows fail, get blocked, or open external unlinked browser tabs.
 */
export function isMobileOrPwa(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isSmallScreen = window.innerWidth <= 768;
  const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    Boolean((navigator as any).standalone);
  return isMobileUA || isSmallScreen || isStandalone;
}

export function openOAuthPopup(url: string, provider: string): Window | null {
  if (typeof window === 'undefined') return null;
  const w = 520, h = 660;
  const left = window.screenX + (window.outerWidth - w) / 2;
  const top = window.screenY + (window.outerHeight - h) / 2;
  return window.open(
    url,
    `ElseSourav_${provider}`,
    `width=${w},height=${h},left=${left},top=${top},status=no,resizable=yes`
  );
}

export function cleanOAuthUrl(): void {
  if (typeof window === 'undefined') return;
  if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

export async function resolveIdentifierToEmail(cleanIdentifier: string): Promise<string> {
  if (cleanIdentifier.includes('@')) return cleanIdentifier;
  try {
    const res = await fetch('https://elsesourav.com/api/auth/resolve-identifier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: cleanIdentifier }),
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const resData = await res.json();
      if (resData.email) return resData.email;
    }
  } catch {}

  try {
    const pRes = await backendApi.fetchUserProfile(cleanIdentifier);
    if (pRes.profile?.email) return pRes.profile.email;
  } catch {}

  return cleanIdentifier;
}
