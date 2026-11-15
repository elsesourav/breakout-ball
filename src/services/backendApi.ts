/**
 * Breakout Ball Dedicated Backend API Service Client
 *
 * Connects directly to the high-performance Breakout Backend microservice
 * (Local: http://localhost:4000, VM3 Production: http://98.70.48.224:4000).
 *
 * Handles:
 * - Background Trophy & Achievement Unlocks with User Auto-Upsert
 * - Level Completions & Real Player Activity Tracking
 * - Secure Server-Side Coupon Validation & Single-Use Redemption
 * - Live Global & Level Leaderboards (50 Real Pre-Players)
 * - Admin Control & Live Activity Audit Logs
 */

export interface BackendLeaderboardEntry {
  rank: number;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  time?: number;
  score?: number;
  stars?: number;
  totalScore?: number;
  trophyCount?: number;
  levelsCompleted?: number;
  coresBalance?: number;
  completedAt?: string;
  badgeTitle?: string;
}

export interface BackendCoupon {
  code: string;
  reward_cores: number;
  pack_cores: number;
  is_active: number;
  max_uses: number;
  used_count: number;
  per_user_limit?: number;
  is_unlimited?: number;
  expires_at?: string;
  created_at: string;
}

export type AdminCoupon = BackendCoupon;

export interface ActivityLogEntry {
  id: string;
  type: string;
  username: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export type BackendActivityLog = ActivityLogEntry;

export interface BackendHealthResponse {
  status: string;
  service?: string;
  version?: string;
  uptime?: number;
  database?: {
    type: string;
    usersCount: number;
    completionsCount: number;
    trophiesCount: number;
    couponsCount: number;
  };
  timestamp?: string;
}

class BackendApiService {
  private baseUrl: string;

  constructor() {
    const isCustomDomain = typeof window !== 'undefined' && window.location.hostname.includes('elsesourav.com');
    const defaultHost = isCustomDomain ? 'https://api-breakout.elsesourav.com' : 'http://localhost:4000';
    this.baseUrl = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_BACKEND_URL) || defaultHost;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  public async checkHealth(): Promise<BackendHealthResponse | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Background Trophy Sync: Upserts user & awards trophy idempotently in the database */
  public async unlockTrophy(
    username: string,
    trophy: { trophyId: string; title: string; description?: string; category?: string }
  ): Promise<{ success: boolean; alreadyUnlocked?: boolean } | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/trophies/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, ...trophy }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Background Level Completion: Records score, time, stars and increments user progress */
  public async recordLevelCompletion(
    username: string,
    data: { levelId: string | number; timeUsed: number; livesRemaining: number; score: number; stars: number }
  ): Promise<{ success: boolean; isFirstClear?: boolean } | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/levels/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, ...data }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Get Real Level Leaderboard (from database records of 50 players) */
  public async getLevelLeaderboard(levelId: string | number, limit = 20): Promise<BackendLeaderboardEntry[] | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/leaderboard/level/${levelId}?limit=${limit}`, {
        signal: AbortSignal.timeout(3500),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.entries || [];
    } catch {
      return null;
    }
  }

  /** Get Real Global Overall Leaderboard (50 Real Pre-Players) */
  public async getGlobalLeaderboard(limit = 50): Promise<BackendLeaderboardEntry[] | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/leaderboard/global?limit=${limit}`, {
        signal: AbortSignal.timeout(3500),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.entries || [];
    } catch {
      return null;
    }
  }

  /** Get Weekly Tournament Leaderboard */
  public async getWeeklyLeaderboard(limit = 50): Promise<BackendLeaderboardEntry[] | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/leaderboard/weekly?limit=${limit}`, {
        signal: AbortSignal.timeout(3500),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.entries || [];
    } catch {
      return null;
    }
  }

  /** Server-Side Coupon Validation */
  public async validateCoupon(
    code: string,
    expectedPackCores: number,
    username: string
  ): Promise<{ valid: boolean; message: string; rewardCores?: number }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, expectedPackCores, username }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return { valid: false, message: 'Server unavailable.' };
      return await res.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      return { valid: false, message: msg };
    }
  }

  /** Server-Side Single-Use Coupon Redemption */
  public async redeemCoupon(
    code: string,
    username: string,
    expectedPackCores: number
  ): Promise<{ success: boolean; coresGranted?: number; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/coupons/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, username, expectedPackCores }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return { success: false, message: 'Server error during redemption.' };
      return await res.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { success: false, message: msg };
    }
  }

  public getAdminToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('breakout_admin_token');
  }

  public setAdminToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('breakout_admin_token', token);
    } else {
      localStorage.removeItem('breakout_admin_token');
    }
  }

  public hasAdminToken(): boolean {
    return Boolean(this.getAdminToken());
  }

  /** Fetch verified user profile directly from ElseSourav ecosystem */
  public async fetchUserProfile(identifier: string): Promise<{ success: boolean; profile?: any }> {
    try {
      const cleanId = identifier.trim().replace(/^@/, '');
      const res = await fetch(`${this.baseUrl}/api/user/profile/${encodeURIComponent(cleanId)}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return { success: false };
      const data = await res.json();
      return { success: true, profile: data.profile };
    } catch {
      return { success: false };
    }
  }

  private getAdminHeaders(): Record<string, string> {
    const adminToken = this.getAdminToken();
    const token = adminToken || (typeof window !== 'undefined' ? localStorage.getItem('breakout_auth_token') : null);
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /** Admin Authentication directly verified by the backend microservice */
  public async adminLogin(identifierOrToken: string, password?: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
    try {
      const body = password
        ? { identifier: identifierOrToken, password }
        : { token: identifierOrToken };
      const res = await fetch(`${this.baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(6000),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        this.setAdminToken(data.token);
        return data;
      }
      return { success: false, message: data.message || 'Invalid admin credentials' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error contacting backend';
      return { success: false, message: msg };
    }
  }

  /** Admin: Fetch all coupons */
  public async getAdminCoupons(): Promise<BackendCoupon[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/coupons`, {
        headers: this.getAdminHeaders(),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.coupons || [];
    } catch {
      return [];
    }
  }

  /** Admin: Create new coupon */
  public async createAdminCoupon(data: {
    code: string;
    rewardCores: number;
    packCores: number;
    maxUses?: number;
    perUserLimit?: number;
    isUnlimited?: boolean;
    expiresAt?: string;
  }): Promise<{ success: boolean; coupon?: BackendCoupon; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/coupons`, {
        method: 'POST',
        headers: this.getAdminHeaders(),
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(4000),
      });
      return await res.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { success: false, error: msg };
    }
  }

  /** Admin: Delete coupon */
  public async deleteAdminCoupon(code: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/coupons/${encodeURIComponent(code)}`, {
        method: 'DELETE',
        headers: this.getAdminHeaders(),
        signal: AbortSignal.timeout(4000),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  }

  /** Admin: Toggle active state of coupon */
  public async toggleAdminCoupon(code: string, isActive: boolean): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/coupons/${encodeURIComponent(code)}/toggle`, {
        method: 'PATCH',
        headers: this.getAdminHeaders(),
        body: JSON.stringify({ isActive }),
        signal: AbortSignal.timeout(4000),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  }

  /** Admin: Fetch Live Activity Logs */
  public async getAdminLogs(limit = 50): Promise<ActivityLogEntry[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/logs?limit=${limit}`, {
        headers: this.getAdminHeaders(),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.logs || [];
    } catch {
      return [];
    }
  }

  /** Admin: Create new coupon */
  public async createCoupon(data: {
    code: string;
    rewardCores: number;
    packCores: number;
    maxUses?: number;
    perUserLimit?: number;
    isUnlimited?: boolean;
    expiresAt?: string;
  }): Promise<{ success: boolean; coupon?: BackendCoupon; message?: string }> {
    const res = await this.createAdminCoupon(data);
    return { success: res.success, coupon: res.coupon, message: res.error };
  }

  /** Admin: Toggle coupon */
  public async toggleCoupon(code: string, isActive?: boolean): Promise<{ success: boolean }> {
    return this.toggleAdminCoupon(code, isActive ?? true);
  }

  /** Admin: Delete coupon */
  public async deleteCoupon(code: string): Promise<{ success: boolean }> {
    return this.deleteAdminCoupon(code);
  }

  /** Admin: Dashboard Metrics */
  public async getAdminDashboard(): Promise<Record<string, unknown> | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/dashboard`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
}

export const backendApi = new BackendApiService();
