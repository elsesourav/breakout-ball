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
    this.baseUrl = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_BACKEND_URL) || 'http://localhost:4000';
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

  /** Admin: Fetch all coupons */
  public async getAdminCoupons(): Promise<BackendCoupon[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/coupons`, { signal: AbortSignal.timeout(4000) });
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
    expiresAt?: string;
  }): Promise<{ success: boolean; coupon?: BackendCoupon; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${this.baseUrl}/api/admin/logs?limit=${limit}`, { signal: AbortSignal.timeout(4000) });
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
