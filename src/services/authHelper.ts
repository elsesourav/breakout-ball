import { backendApi } from './backendApi';
import { supabase } from './supabase';

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
 * Detects standalone PWA mode.
 */
export function isMobileOrPwa(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (navigator as any).standalone
  );
}

export function openOAuthPopup(url: string, provider: string): Window | null {
  if (typeof window === 'undefined') return null;
  const w = 520, h = 660;
  const left = window.screenX + (window.outerWidth - w) / 2;
  const top = window.screenY + (window.outerHeight - h) / 2;
  try {
    return window.open(
      url || 'about:blank',
      `ElseSourav_${provider}`,
      `width=${w},height=${h},left=${left},top=${top},status=no,resizable=yes`
    );
  } catch {
    return null;
  }
}

export function cleanOAuthUrl(): void {
  if (typeof window === 'undefined') return;
  if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

/**
 * Handles cross-platform OAuth popup and multi-tab synchronization.
 * Opens popup synchronously during click event to satisfy popup blockers.
 */
export async function startOAuthFlow(
  provider: 'google' | 'github',
  onUserResolved: (user: AuthUser) => void,
  getCurrentUser: () => AuthUser,
  onAuthStateChange: (cb: (user: AuthUser) => void) => () => void
): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  try {
    const redirectTo = getOAuthRedirectUrl();
    const isPwa = isMobileOrPwa();

    if (isPwa) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: false },
      });
      if (error) return { success: false, message: error.message };
      if (data?.url) {
        window.location.href = data.url;
        return { success: true };
      }
    }

    // Synchronously open popup window on click before any async await
    const popup = openOAuthPopup('', provider);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });

    if (error || !data?.url) {
      try { if (popup && !popup.closed) popup.close(); } catch {}
      return { success: false, message: error?.message || `Failed to start ${provider} login` };
    }

    if (popup && !popup.closed) {
      popup.location.href = data.url;
      return new Promise((resolve) => {
        let resolved = false;

        const unsubscribe = onAuthStateChange((u) => {
          if (u.isLoggedIn && !resolved) {
            resolved = true;
            unsubscribe();
            try { if (popup && !popup.closed) popup.close(); } catch {}
            onUserResolved(u);
            resolve({ success: true, user: u });
          }
        });

        const timer = setInterval(async () => {
          if (popup.closed) {
            clearInterval(timer);
            unsubscribe();
            if (resolved) return;
            await new Promise((r) => setTimeout(r, 400));
            const cur = getCurrentUser();
            if (cur.isLoggedIn && cur.username !== 'anonymous') {
              onUserResolved(cur);
              resolve({ success: true, user: cur });
            } else {
              resolve({ success: false, message: 'OAuth sign-in cancelled or window closed' });
            }
          }
        }, 500);
      });
    }

    window.location.href = data.url;
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err?.message || `OAuth with ${provider} failed` };
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
