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
