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
  getUpgradeDef,
  getLevelReward,
  getArenaReward,
  CURRENCY,
} from '../constants/upgrades';

// ─── Local Storage Keys ──────────────────────────────────────────
const CURRENCY_KEY = 'breakout_currency';
const UPGRADES_KEY = 'breakout_upgrades';
const CLAIMED_LEVELS_KEY = 'breakout_claimed_levels';
const ARENA_STATS_KEY = 'breakout_arena_stats';

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
      if (data.arenaStats) this.arenaStats = { ...DEFAULT_ARENA_STATS, ...data.arenaStats };
      this.saveToLocal();
    } catch { /* offline — use local */ }
  }

  private saveToLocal(): void {
    try {
      localStorage.setItem(CURRENCY_KEY, JSON.stringify(this.balance));
      localStorage.setItem(UPGRADES_KEY, JSON.stringify(this.upgrades));
      localStorage.setItem(CLAIMED_LEVELS_KEY, JSON.stringify([...this.claimedLevels]));
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
  public getArenaStats(): ArenaStats { return { ...this.arenaStats }; }

  // ─── Earn Currency ───────────────────────────────────────────

  /** Award currency for first-time level completion. Returns cores earned (0 if already claimed). */
  public earnLevelReward(levelId: string, levelNum: number, username?: string): number {
    if (this.claimedLevels.has(levelId)) return 0;
    const reward = getLevelReward(levelNum);
    this.balance += reward;
    this.claimedLevels.add(levelId);
    this.saveToLocal();
    this.syncToCloud(username).catch(() => {});
    return reward;
  }

  /** Award currency for arena match completion. Returns cores earned. */
  public earnArenaReward(levelId: string, performanceRatio: number, username?: string): number {
    let reward = getArenaReward(performanceRatio);
    this.arenaStats.totalPlays++;

    // First-time arena level clear bonus
    if (!this.arenaStats.uniqueLevelsCleared.includes(levelId)) {
      this.arenaStats.uniqueLevelsCleared.push(levelId);
      reward += CURRENCY.arenaFirstClearBonus;
    }

    // Daily bonus (first 3 matches)
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

  /** Add bonus cores (e.g., from coupon redemption). */
  public addCores(amount: number, username?: string): void {
    this.balance += amount;
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
}

export const currencyService = new CurrencyService();
