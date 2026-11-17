/**
 * Master Authentication & Single Sign-On (SSO) Ecosystem Service
 */

import { supabase } from './supabase';
import { firebaseAuth, firestoreDb } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { handleRequestPasswordOtp, handleVerifyOtpAndResetPassword } from './authRecoveryHelper';
import { backendApi } from './backendApi';
import {
  AuthUser,
  isUserAdmin,
  getAnonymousUserId,
  getOAuthRedirectUrl,
  isMobileOrPwa,
  openOAuthPopup,
  cleanOAuthUrl,
  resolveIdentifierToEmail,
  startOAuthFlow,
} from './authHelper';
import { accountMigrationService } from './accountMigration';

export type { AuthUser };
export { isUserAdmin, getAnonymousUserId };

export interface AuthState {
  user: AuthUser;
  isLoading: boolean;
  error: string | null;
}

class AuthService {
  private userKey = 'breakout_auth_user';
  private tokenKey = 'breakout_auth_token';
  private anonUserKey = 'breakout_anon_user_id';
  private subscribers: Set<(user: AuthUser) => void> = new Set();

  public onAuthStateChange(cb: (user: AuthUser) => void): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  private lastNotifiedUserKey: string | null = null;

  private notifySubscribers(user: AuthUser) {
    const key = `${user.id}_${user.isLoggedIn}_${user.token || ''}`;
    if (this.lastNotifiedUserKey === key) return;
    this.lastNotifiedUserKey = key;
    this.subscribers.forEach((cb) => {
      try { cb(user); } catch {}
    });
  }

  public getAnonymousUserId(): string {
    return getAnonymousUserId();
  }

  public getEffectiveUserId(): string {
    const user = this.getCurrentUser();
    if (user.isLoggedIn && user.id && user.id !== 'anonymous') {
      return user.id;
    }
    return this.getAnonymousUserId();
  }

  constructor() {
    this.setupSsoPostMessageListener();
    this.listenToAuthStateChanges();
  }

  // ==========================================
  // SSO POSTMESSAGE ARCHITECTURE
  // ==========================================
  private setupSsoPostMessageListener() {
    if (typeof window === 'undefined') return;

    // 1. Cross-tab BroadcastChannel sync for multi-tab/mobile OAuth
    if ('BroadcastChannel' in window) {
      try {
        const ch = new BroadcastChannel('breakout_oauth_channel');
        ch.onmessage = (e) => {
          if (e.data?.type === 'BREAKOUT_AUTH_SUCCESS' && e.data?.user) {
            this.setCurrentUser(e.data.user);
            this.notifySubscribers(e.data.user);
            accountMigrationService.migrateAnonymousDataToUser(e.data.user).catch(() => {});
          }
        };
      } catch {}
    }

    // 2. Storage event listener fallback across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'breakout_oauth_sync' && e.newValue) {
        try {
          const { user } = JSON.parse(e.newValue);
          if (user?.isLoggedIn) {
            this.setCurrentUser(user);
            this.notifySubscribers(user);
            accountMigrationService.migrateAnonymousDataToUser(user).catch(() => {});
          }
        } catch {}
      }
    });

    // 3. PostMessage for iframe & popup communication
    window.addEventListener('message', async (event) => {
      if (
        event.origin.includes('elsesourav.com') ||
        event.origin.includes('localhost') ||
        event.origin.includes('127.0.0.1')
      ) {
        if (event.data?.type === 'BREAKOUT_AUTH_SUCCESS' && event.data?.user) {
          const authUser = event.data.user;
          this.setCurrentUser(authUser);
          this.notifySubscribers(authUser);
          accountMigrationService.migrateAnonymousDataToUser(authUser).catch(() => {});
          return;
        }
        if (event.data?.type === 'ELSESOURAV_AUTH_SUCCESS' && event.data?.payload) {
          const payload = event.data.payload;
          const ssoUser: AuthUser = {
            id: payload.id || `sso_${Date.now()}`,
            fullName: payload.fullName || payload.name || 'ElseSourav Player',
            username: payload.username || 'sso_player',
            email: payload.email || 'player@elsesourav.com',
            avatarUrl: payload.avatarUrl,
            provider: 'sso',
            isLoggedIn: true,
            isAdmin: isUserAdmin({ username: payload.username, email: payload.email }),
            token: payload.token,
          };
          this.setCurrentUser(ssoUser);
          this.notifySubscribers(ssoUser);
          accountMigrationService.migrateAnonymousDataToUser(ssoUser).catch(() => {});
        }
      }
    });

    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({ type: 'ELSESOURAV_AUTH_REQUEST' }, '*');
      } catch {}
    }
  }

  private listenToAuthStateChanges() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const username = meta.username || meta.user_name || u.email?.split('@')[0] || 'player';
        const fullName = meta.full_name || meta.name || username;
        const isAdmin = isUserAdmin({ username, email: u.email || '' });
        const prov = (session.user.app_metadata?.provider || 'credentials') as any;
        const user: AuthUser = {
          id: u.id,
          fullName,
          username,
          email: u.email || '',
          avatarUrl: meta.avatar_url || meta.picture || meta.photoUrl,
          provider: prov === 'google' || prov === 'github' ? prov : 'credentials',
          isLoggedIn: true,
          isAdmin,
          token: session.access_token,
        };
        this.setCurrentUser(user);
        this.notifySubscribers(user);
        accountMigrationService.migrateAnonymousDataToUser(user).catch(() => {});

        // Broadcast to other open tabs/windows
        if (typeof window !== 'undefined') {
          try {
            if ('BroadcastChannel' in window) {
              const ch = new BroadcastChannel('breakout_oauth_channel');
              ch.postMessage({ type: 'BREAKOUT_AUTH_SUCCESS', user });
              ch.close();
            }
            localStorage.setItem('breakout_oauth_sync', JSON.stringify({ user, ts: Date.now() }));
          } catch {}

          if (window.opener && window.opener !== window) {
            try {
              window.opener.postMessage({ type: 'BREAKOUT_AUTH_SUCCESS', user }, window.location.origin);
            } catch {}
            window.close();
            return;
          }
          cleanOAuthUrl();
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenKey);
      }
    });
  }

  // ==========================================
  // USER STATE
  // ==========================================
  public getCurrentUser(): AuthUser {
    const raw = localStorage.getItem(this.userKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (isUserAdmin(parsed)) {
          parsed.isAdmin = true;
        }
        return parsed;
      } catch {}
    }
    const anonId = this.getAnonymousUserId();
    return {
      id: anonId,
      fullName: 'Anonymous',
      username: 'anonymous',
      email: '',
      provider: 'credentials',
      isLoggedIn: false,
      isAdmin: false,
    };
  }

  public setCurrentUser(user: AuthUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    if (user.token) {
      localStorage.setItem(this.tokenKey, user.token);
    }
  }

  // ==========================================
  // ELSESOURAV SIGNIN METHOD
  // Supports @username, username, or email
  // ==========================================
  public async loginWithIdentifier(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    const cleanIdentifier = identifier.trim().replace(/^@/, '');
    if (!cleanIdentifier || !password) {
      return { success: false, message: 'Please enter both identifier and password' };
    }

    try {
      // 1. Resolve @username to email
      const targetEmail = await resolveIdentifierToEmail(cleanIdentifier);

      // 2. Attempt authentication via ElseSourav Supabase
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (!sbError && sbData?.user) {
        const meta = sbData.user.user_metadata || {};
        let username = meta.username || meta.user_name || cleanIdentifier.toLowerCase();
        let fullName = meta.full_name || meta.name || cleanIdentifier;
        const email = sbData.user.email || targetEmail;
        let avatarUrl = meta.avatar_url || meta.picture || meta.photoUrl;

        // Fetch verified ElseSourav profile to guarantee accurate photoUrl & displayName
        try {
          const pRes = await backendApi.fetchUserProfile(cleanIdentifier);
          if (pRes.profile) {
            if (pRes.profile.photoUrl) avatarUrl = pRes.profile.photoUrl;
            if (pRes.profile.displayName) fullName = pRes.profile.displayName;
            if (pRes.profile.username) username = pRes.profile.username;
          }
        } catch {}

        const isAdmin = isUserAdmin({ username, email });

        const user: AuthUser = {
          id: sbData.user.id,
          fullName,
          username,
          email,
          avatarUrl,
          provider: 'credentials',
          isLoggedIn: true,
          isAdmin,
          token: sbData.session?.access_token,
        };

        this.setCurrentUser(user);
        this.notifySubscribers(user);
        accountMigrationService.migrateAnonymousDataToUser(user).catch(() => {});

        // Sync Firestore profile document in background
        setDoc(doc(firestoreDb, 'users', username), {
          uid: sbData.user.id, fullName, username, email: user.email, lastLoginAt: new Date().toISOString(),
        }, { merge: true }).catch(() => {});

        return { success: true, user };
      }

      // 3. Fallback: Authenticate via Firebase Auth using legacy credentials (${username}@sb.com)
      try {
        const fallbackEmail = cleanIdentifier.includes('@')
          ? cleanIdentifier
          : `${cleanIdentifier.toLowerCase()}@sb.com`;

        const fbCred = await signInWithEmailAndPassword(firebaseAuth, fallbackEmail, password);
        if (fbCred.user) {
          const username = cleanIdentifier.toLowerCase();
          const user: AuthUser = {
            id: fbCred.user.uid,
            fullName: fbCred.user.displayName || username,
            username,
            email: fbCred.user.email || fallbackEmail,
            provider: 'credentials',
            isLoggedIn: true,
            token: await fbCred.user.getIdToken(),
          };
          this.setCurrentUser(user);
        this.notifySubscribers(user);
        accountMigrationService.migrateAnonymousDataToUser(user).catch(() => {});
          return { success: true, user };
        }
      } catch {}

      // If both return invalid credentials, format a clean error message
      const errMessage = sbError?.message || 'Invalid username or password. Please verify your credentials.';
      return { success: false, message: errMessage };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Authentication error. Please try again.' };
    }
  }

  // ==========================================
  // ELSESOURAV SIGNUP METHOD
  // Registers new account with ElseSourav network & syncs to Cloud Firestore
  // ==========================================
  public async registerUser(
    fullName: string,
    username: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    const cleanUsername = username.trim().replace(/^@/, '').toLowerCase();
    const cleanFullName = fullName.trim() || cleanUsername;
    const cleanEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    try {
      // 1. Check if username is already taken in ElseSourav User directory
      const { data: existingUser } = await supabase
        .from('User')
        .select('id, username')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (existingUser) {
        return { success: false, message: `The username "@${cleanUsername}" is already taken. Please choose another.` };
      }

      // 2. Sign up on ElseSourav Platform Identity (Supabase)
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanFullName,
            username: cleanUsername,
            user_name: cleanUsername,
          },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      const userId = data.user?.id || `usr_${Date.now().toString(36)}`;

      // 3. Register user profile in ElseSourav User directory table
      try {
        await supabase.from('User').insert([{
          id: userId, supabaseAuthId: userId, email: cleanEmail, displayName: cleanFullName, username: cleanUsername, createdAt: new Date().toISOString(),
        }]);
      } catch {}

      // 4. Also register and mirror in Cloud Firestore database
      try {
        await setDoc(doc(firestoreDb, 'users', cleanUsername), {
          uid: userId, fullName: cleanFullName, username: cleanUsername, email: cleanEmail, createdAt: new Date().toISOString(), levelsRecord: {},
        }, { merge: true });
      } catch {}

      // 5. Also create Firebase Auth account in background for dual-compatibility
      try {
        await createUserWithEmailAndPassword(firebaseAuth, `${cleanUsername}@sb.com`, password);
      } catch {}

      const user: AuthUser = {
        id: userId,
        fullName: cleanFullName,
        username: cleanUsername,
        email: cleanEmail,
        provider: 'credentials',
        isLoggedIn: true,
        token: data.session?.access_token || `jwt_${Date.now()}`,
      };

      this.setCurrentUser(user);
      return { success: true, user };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to complete registration' };
    }
  }

  // ==========================================
  // OAUTH SOCIAL LOGINS (GOOGLE & GITHUB)
  // ==========================================
  public async loginWithOAuth(
    provider: 'google' | 'github'
  ): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    return startOAuthFlow(
      provider,
      (user) => {
        this.setCurrentUser(user);
        this.notifySubscribers(user);
        accountMigrationService.migrateAnonymousDataToUser(user).catch(() => {});
      },
      () => this.getCurrentUser(),
      (cb) => this.onAuthStateChange(cb)
    );
  }

  // ==========================================
  // 6-DIGIT OTP PASSWORD RECOVERY
  // ==========================================
  public async requestPasswordOtp(identifier: string) {
    return handleRequestPasswordOtp(identifier);
  }

  public async verifyOtpAndResetPassword(identifier: string, otp: string, newPass: string) {
    return handleVerifyOtpAndResetPassword(identifier, otp, newPass);
  }

  public async refreshUserProfile(): Promise<AuthUser | null> {
    const current = this.getCurrentUser();
    if (!current.isLoggedIn) return null;
    try {
      const lookupId = current.username || current.email;
      const pRes = await backendApi.fetchUserProfile(lookupId);
      const newAvatar = pRes.profile?.photoUrl;
      const newName = pRes.profile?.displayName;
      if (newAvatar || newName) {
        const updated: AuthUser = {
          ...current,
          avatarUrl: newAvatar || current.avatarUrl,
          fullName: newName || current.fullName,
        };
        this.setCurrentUser(updated);
        return updated;
      }
    } catch {}
    return current;
  }

  public async logout(): Promise<void> {
    this.lastNotifiedUserKey = null;
    try {
      await Promise.allSettled([supabase.auth.signOut(), fbSignOut(firebaseAuth)]);
    } catch {}
    ['breakout_auth_user', 'breakout_auth_token', 'breakout_admin_token'].forEach((k) => localStorage.removeItem(k));
  }
}

export const authService = new AuthService();
