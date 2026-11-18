/**
 * Currency Service
 *
 * Manages Cores (in-game currency) — earning, spending, and syncing to
 * Cloud Firestore with offline localStorage fallback.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestoreDb } from './firebase';
import {
  UpgradeState,
  DEFAULT_UPGRADE_STATE,
  getUpgradeCost,
  getCostBetweenLevels,
  getUpgradeDef,
  getLevelReward,
  getLevelRewardForStars,
  getArenaReward,
  CURRENCY,
} from '../constants/upgrades';

// ─── Local Storage Keys ──────────────────────────────────────────
const CURRENCY_KEY = 'breakout_currency';
const UPGRADES_KEY = 'breakout_upgrades';
const CLAIMED_LEVELS_KEY = 'breakout_claimed_levels';
const ARENA_STATS_KEY = 'breakout_arena_stats';
const LEVEL_STARS_KEY = 'breakout_level_stars';
const LEVEL_CLAIMED_CORES_KEY = 'breakout_level_claimed_cores';

// ─── Types ───────────────────────────────────────────────────────
export interface StarRewardResult {
  coresEarned: number;
  starsEarned: number;
  previousStars: number;
  newBestStars: number;
  totalClaimedForLevel: number;
  maxCoresForLevel: number;
  remainingCoresForLevel: number;
  isFirstClear: boolean;
}

// ─── Arena Stats ─────────────────────────────────────────────────
interface ArenaStats {
  totalPlays: number;
  uniqueLevelsCleared: string[];
  dailyBonusDate: string;
  dailyBonusCount: number;
}

const DEFAULT_ARENA_STATS: ArenaStats = {
  totalPlays: 0,
  uniqueLevelsCleared: [],
  dailyBonusDate: '',
  dailyBonusCount: 0,
};

// ─── Currency Service ────────────────────────────────────────────
class CurrencyService {
  private balance: number = 0;
  private upgrades: UpgradeState = { ...DEFAULT_UPGRADE_STATE };
  private claimedLevels: Set<string> = new Set();
  private levelStars: Record<string, number> = {};
  private levelClaimedCores: Record<string, number> = {};
  private arenaStats: ArenaStats = { ...DEFAULT_ARENA_STATS };
  private loaded = false;

  /** Load state from localStorage (instant) then overlay from Firestore */
  public async load(username?: string): Promise<void> {
    this.loadFromLocal();
    if (username && username.toLowerCase() !== 'anonymous') {
      await this.loadFromCloud(username);
    }
    this.loaded = true;
  }

  private loadFromLocal(): void {
    try {
      const b = localStorage.getItem(CURRENCY_KEY);
      if (b !== null) this.balance = JSON.parse(b);
      const u = localStorage.getItem(UPGRADES_KEY);
      if (u) this.upgrades = { ...DEFAULT_UPGRADE_STATE, ...JSON.parse(u) };
      const c = localStorage.getItem(CLAIMED_LEVELS_KEY);
      if (c) this.claimedLevels = new Set(JSON.parse(c));
      const a = localStorage.getItem(ARENA_STATS_KEY);
      if (a) this.arenaStats = { ...DEFAULT_ARENA_STATS, ...JSON.parse(a) };
      const ls = localStorage.getItem(LEVEL_STARS_KEY);
      if (ls) this.levelStars = JSON.parse(ls);
      const lcc = localStorage.getItem(LEVEL_CLAIMED_CORES_KEY);
      if (lcc) this.levelClaimedCores = JSON.parse(lcc);

      // Backwards compatibility migration for legacy claimed levels
      this.claimedLevels.forEach((lvlId) => {
        const num = parseInt(lvlId, 10);
        if (!isNaN(num)) {
          if (!this.levelStars[lvlId]) this.levelStars[lvlId] = 3;
          if (this.levelClaimedCores[lvlId] === undefined) {
            this.levelClaimedCores[lvlId] = getLevelReward(num);
          }
        }
      });
    } catch { /* use defaults */ }
  }

  private async loadFromCloud(username: string): Promise<void> {
    try {
      const snap = await getDoc(doc(firestoreDb, 'users', username.toLowerCase()));
      if (!snap.exists()) return;
      const data = snap.data();
      if (typeof data.currency === 'number') this.balance = data.currency;
      if (data.upgradeState) this.upgrades = { ...DEFAULT_UPGRADE_STATE, ...data.upgradeState };
      if (Array.isArray(data.claimedLevels)) this.claimedLevels = new Set(data.claimedLevels);
      if (data.levelStars && typeof data.levelStars === 'object') {
        this.levelStars = { ...this.levelStars, ...data.levelStars };
      }
      if (data.levelClaimedCores && typeof data.levelClaimedCores === 'object') {
        this.levelClaimedCores = { ...this.levelClaimedCores, ...data.levelClaimedCores };
      }
      if (data.arenaStats) this.arenaStats = { ...DEFAULT_ARENA_STATS, ...data.arenaStats };
      this.saveToLocal();
    } catch { /* offline — use local */ }
  }

  private saveToLocal(): void {
    try {
      localStorage.setItem(CURRENCY_KEY, JSON.stringify(this.balance));
      localStorage.setItem(UPGRADES_KEY, JSON.stringify(this.upgrades));
      localStorage.setItem(CLAIMED_LEVELS_KEY, JSON.stringify([...this.claimedLevels]));
      localStorage.setItem(LEVEL_STARS_KEY, JSON.stringify(this.levelStars));
      localStorage.setItem(LEVEL_CLAIMED_CORES_KEY, JSON.stringify(this.levelClaimedCores));
      localStorage.setItem(ARENA_STATS_KEY, JSON.stringify(this.arenaStats));
    } catch { /* storage full */ }
  }

  /** Persist state to Cloud Firestore (fire-and-forget). */
  public async syncToCloud(username?: string): Promise<void> {
    const userKey = username?.toLowerCase();
    if (!userKey || userKey === 'anonymous') return;
    try {
      await setDoc(doc(firestoreDb, 'users', userKey), {
        currency: this.balance,
        upgradeState: this.upgrades,
        claimedLevels: [...this.claimedLevels],
        levelStars: this.levelStars,
        levelClaimedCores: this.levelClaimedCores,
        arenaStats: this.arenaStats,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch { /* offline */ }
  }

  // ─── Getters ─────────────────────────────────────────────────
  public getBalance(): number { return this.balance; }
  public getUpgrades(): UpgradeState { return { ...this.upgrades }; }
  public getUpgradeLevel(id: string): number { return this.upgrades[id] ?? 1; }
  public isLevelClaimed(levelId: string): boolean { return this.claimedLevels.has(levelId); }
  public getLevelStars(levelId: string): number { return this.levelStars[levelId] ?? 0; }
  public getLevelClaimedCores(levelId: string): number { return this.levelClaimedCores[levelId] ?? 0; }
  public getLevelMaxCores(levelNum: number): number { return getLevelReward(levelNum); }
  public getLevelRemainingCores(levelId: string, levelNum: number): number {
    const max = getLevelReward(levelNum);
    const claimed = this.getLevelClaimedCores(levelId);
    return Math.max(0, max - claimed);
  }
  public getArenaStats(): ArenaStats { return { ...this.arenaStats }; }
  public isArenaLevelClaimed(levelId: string): boolean {
    return this.arenaStats.uniqueLevelsCleared.includes(levelId);
  }

  // ─── Earn Currency ───────────────────────────────────────────

  /**
   * Award currency for arcade level completion with Star-tiered reward division.
   * - 1 Star (1 heart remaining):  ~33.3% of total core pool
   * - 2 Stars (2 hearts remaining): ~66.7% of total core pool
   * - 3 Stars (3 hearts remaining): 100% of total core pool
   *
   * Incremental Claiming:
   * Replaying a level at a higher star rating awards only the delta/remaining cores.
   * Replaying at the same or lower star rating awards 0 additional cores.
   */
  public earnLevelRewardWithStars(
    levelId: string,
    levelNum: number,
    heartsRemaining: number,
    username?: string
  ): StarRewardResult {
    const starsEarned = Math.min(3, Math.max(1, heartsRemaining));
    const maxReward = getLevelReward(levelNum);
    const targetCumulative = getLevelRewardForStars(levelNum, starsEarned);
    const currentClaimed = this.levelClaimedCores[levelId] ?? 0;
    const prevStars = this.levelStars[levelId] ?? 0;
    const isFirstClear = currentClaimed === 0 && prevStars === 0;

    // Incremental cores earned this run
    const coresAwarded = Math.max(0, targetCumulative - currentClaimed);

    if (coresAwarded > 0) {
      this.balance += coresAwarded;
      this.levelClaimedCores[levelId] = currentClaimed + coresAwarded;
    }

    // Record highest star tier achieved
    const newBestStars = Math.max(prevStars, starsEarned);
    this.levelStars[levelId] = newBestStars;

    // If 3 stars reached, mark in claimedLevels set
    if (newBestStars >= 3) {
      this.claimedLevels.add(levelId);
    }

    this.saveToLocal();
    this.syncToCloud(username).catch(() => {});

    return {
      coresEarned: coresAwarded,
      starsEarned,
      previousStars: prevStars,
      newBestStars,
      totalClaimedForLevel: this.levelClaimedCores[levelId],
      maxCoresForLevel: maxReward,
      remainingCoresForLevel: Math.max(0, maxReward - this.levelClaimedCores[levelId]),
      isFirstClear,
    };
  }

  /** Award currency for level completion (legacy wrapper). */
  public earnLevelReward(levelId: string, levelNum: number, username?: string): number {
    return this.earnLevelRewardWithStars(levelId, levelNum, 3, username).coresEarned;
  }

  /**
   * Award currency for arena match completion.
   * Arena Mode: ONE-TIME core reward only! Replaying already cleared arena levels awards 0 cores.
   */
  public earnArenaReward(levelId: string, performanceRatio: number, username?: string): number {
    this.arenaStats.totalPlays++;

    // Arena mode: ONE-TIME reward per arena stage
    if (this.arenaStats.uniqueLevelsCleared.includes(levelId)) {
      return 0;
    }

    this.arenaStats.uniqueLevelsCleared.push(levelId);
    let reward = getArenaReward(performanceRatio) + CURRENCY.arenaFirstClearBonus;

    // Daily bonus (first N arena matches)
    const today = new Date().toISOString().slice(0, 10);
    if (this.arenaStats.dailyBonusDate !== today) {
      this.arenaStats.dailyBonusDate = today;
      this.arenaStats.dailyBonusCount = 0;
    }
    if (this.arenaStats.dailyBonusCount < CURRENCY.dailyBonusMaxMatches) {
      reward += CURRENCY.dailyBonusAmount;
      this.arenaStats.dailyBonusCount++;
    }

    this.balance += reward;
    this.saveToLocal();
    this.syncToCloud(username).catch(() => {});
    return reward;
  }

  /** Add bonus cores (e.g., from coupon redemption). Clamps balance to minimum 0. */
  public addCores(amount: number, username?: string): void {
    this.balance = Math.max(0, this.balance + amount);
    this.saveToLocal();
    this.syncToCloud(username).catch(() => {});
  }

  // ─── Spend Currency ──────────────────────────────────────────

  /** Attempt to purchase an upgrade. Returns true if successful. */
  public purchaseUpgrade(upgradeId: string, username?: string): boolean {
    const def = getUpgradeDef(upgradeId);
    if (!def) return false;

    const currentLevel = this.upgrades[upgradeId] ?? 1;
    if (currentLevel >= def.maxLevel) return false;

    const cost = getUpgradeCost(def.baseCost, currentLevel);
    if (this.balance < cost) return false;

    this.balance -= cost;
    this.upgrades[upgradeId] = currentLevel + 1;
    this.saveToLocal();
    this.syncToCloud(username).catch(() => {});
    return true;
  }

  /** Attempt to purchase an upgrade directly up to targetLevel in one single operation. */
  public purchaseUpgradeToLevel(upgradeId: string, targetLevel: number, username?: string): boolean {
    const def = getUpgradeDef(upgradeId);
    if (!def) return false;

    const currentLevel = this.upgrades[upgradeId] ?? 1;
    const boundedTarget = Math.min(def.maxLevel, Math.max(currentLevel + 1, targetLevel));
    if (currentLevel >= boundedTarget) return false;

    const totalCost = getCostBetweenLevels(def.baseCost, currentLevel, boundedTarget);
    if (this.balance < totalCost) return false;

    this.balance -= totalCost;
    this.upgrades[upgradeId] = boundedTarget;
    this.saveToLocal();
    this.syncToCloud(username).catch(() => {});
    return true;
  }

  /** Set an upgrade level directly (e.g. for testing / preset verification). */
  public setUpgradeLevel(id: string, level: number): void {
    this.upgrades[id] = level;
    this.saveToLocal();
  }

  /** Check if user can afford an upgrade. */
  public canAfford(upgradeId: string): boolean {
    const def = getUpgradeDef(upgradeId);
    if (!def) return false;
    const currentLevel = this.upgrades[upgradeId] ?? 1;
    if (currentLevel >= def.maxLevel) return false;
    return this.balance >= getUpgradeCost(def.baseCost, currentLevel);
  }

  /** Get the cost of the next upgrade level. */
  public getNextCost(upgradeId: string): number {
    const def = getUpgradeDef(upgradeId);
    if (!def) return Infinity;
    const currentLevel = this.upgrades[upgradeId] ?? 1;
    return getUpgradeCost(def.baseCost, currentLevel);
  }

  // ─── Daily Free 50 Cores Reward System ────────────────────────
  public getDailyCollectStatus(): DailyCollectStatus {
    try {
      const raw = localStorage.getItem(DAILY_COLLECT_KEY);
      const lastCollected = raw ? parseInt(raw, 10) : null;
      if (!lastCollected || isNaN(lastCollected)) {
        return { canCollect: true, remainingMs: 0, lastCollected: null, amount: DAILY_COLLECT_AMOUNT };
      }
      const elapsed = Date.now() - lastCollected;
      if (elapsed >= DAILY_COLLECT_COOLDOWN_MS) {
        return { canCollect: true, remainingMs: 0, lastCollected, amount: DAILY_COLLECT_AMOUNT };
      }
      return {
        canCollect: false,
        remainingMs: Math.max(0, DAILY_COLLECT_COOLDOWN_MS - elapsed),
        lastCollected,
        amount: DAILY_COLLECT_AMOUNT,
      };
    } catch {
      return { canCollect: true, remainingMs: 0, lastCollected: null, amount: DAILY_COLLECT_AMOUNT };
    }
  }

  public claimDailyCores(username?: string): { success: boolean; amount: number; newBalance: number } {
    const status = this.getDailyCollectStatus();
    if (!status.canCollect) {
      return { success: false, amount: 0, newBalance: this.balance };
    }
    const now = Date.now();
    try {
      localStorage.setItem(DAILY_COLLECT_KEY, now.toString());
    } catch { /* storage full */ }
    this.balance += DAILY_COLLECT_AMOUNT;
    this.saveToLocal();
    this.syncToCloud(username).catch(() => {});
    return { success: true, amount: DAILY_COLLECT_AMOUNT, newBalance: this.balance };
  }

  public reset(): void {
    this.balance = 0;
    this.upgrades = { ...DEFAULT_UPGRADE_STATE };
    this.claimedLevels = new Set();
    this.levelStars = {};
    this.levelClaimedCores = {};
    this.arenaStats = { ...DEFAULT_ARENA_STATS };
    this.loaded = false;
    try {
      localStorage.removeItem(CURRENCY_KEY);
      localStorage.removeItem(UPGRADES_KEY);
      localStorage.removeItem(CLAIMED_LEVELS_KEY);
      localStorage.removeItem(LEVEL_STARS_KEY);
      localStorage.removeItem(LEVEL_CLAIMED_CORES_KEY);
      localStorage.removeItem(ARENA_STATS_KEY);
      localStorage.removeItem(DAILY_COLLECT_KEY);
    } catch { /* ignore */ }
  }
}

// ─── Daily Reward Constants & Types ─────────────────────────────
const DAILY_COLLECT_KEY = 'breakout_daily_collect_timestamp';
export const DAILY_COLLECT_AMOUNT = 50;
export const DAILY_COLLECT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface DailyCollectStatus {
  canCollect: boolean;
  remainingMs: number;
  lastCollected: number | null;
  amount: number;
}

export const currencyService = new CurrencyService();
