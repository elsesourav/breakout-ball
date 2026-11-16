import { Achievement } from '../types/game';
import { backendApi } from './backendApi';
import { currencyService } from './currency';

const STORAGE_KEY = 'breakout_achievements_v1';
const VIEWED_STORAGE_KEY = 'breakout_viewed_achievements_v1';
const CLAIM_STORAGE_KEY = 'breakout_achievement_claims_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: 'First Impact',
    description: 'Break your first energy block in any stage',
    icon: 'zap',
    category: 'combat',
    unlocked: false,
    coreReward: 15,
  },
  {
    id: 'combo_5',
    title: 'Combo Spark',
    description: 'Achieve a 5x combo streak without losing ball',
    icon: 'flame',
    category: 'combat',
    unlocked: false,
    coreReward: 20,
  },
  {
    id: 'combo_10',
    title: 'Unstoppable Flow',
    description: 'Reach a blistering 10x combo streak',
    icon: 'zap',
    category: 'combat',
    unlocked: false,
    coreReward: 50,
  },
  {
    id: 'portal_hopper',
    title: 'Quantum Leaper',
    description: 'Warp a ball through a pair of cyber portals',
    icon: 'compass',
    category: 'mastery',
    unlocked: false,
    coreReward: 25,
  },
  {
    id: 'emp_detonator',
    title: 'Shockwave Master',
    description: 'Detonate an EMP explosive block',
    icon: 'target',
    category: 'combat',
    unlocked: false,
    coreReward: 25,
  },
  {
    id: 'speed_demon',
    title: 'Supersonic',
    description: 'Clear any level in under 30 seconds',
    icon: 'timer',
    category: 'speed',
    unlocked: false,
    coreReward: 40,
  },
  {
    id: 'campaign_10',
    title: 'Sector Veteran',
    description: 'Conquer 10 arcade campaign stages',
    icon: 'shield',
    category: 'mastery',
    unlocked: false,
    coreReward: 60,
  },
  {
    id: 'apex_champion',
    title: 'Apex Legend',
    description: 'Conquer all 50 arcade campaign stages',
    icon: 'crown',
    category: 'mastery',
    unlocked: false,
    coreReward: 200,
  },
  {
    id: 'level_architect',
    title: 'Master Architect',
    description: 'Create and save a custom stage in the Studio',
    icon: 'palette',
    category: 'creative',
    unlocked: false,
    coreReward: 35,
  },
  {
    id: 'arena_challenger',
    title: 'Global Contender',
    description: 'Challenge a community stage in Global Arena',
    icon: 'globe',
    category: 'mastery',
    unlocked: false,
    coreReward: 30,
  },
  {
    id: 'laser_barrage',
    title: 'Photon Striker',
    description: 'Strike energy blocks with tactical laser cannons',
    icon: 'zap',
    category: 'combat',
    unlocked: false,
    coreReward: 30,
  },
  {
    id: 'multiball_chaos',
    title: 'Overclocked Swarm',
    description: 'Unleash multi-ball frenzy with multiple simultaneous balls',
    icon: 'flame',
    category: 'mastery',
    unlocked: false,
    coreReward: 35,
  },
  {
    id: 'shield_saviour',
    title: 'Aegis Sentinel',
    description: 'Deflect a draining ball with the bottom safety barrier',
    icon: 'shield',
    category: 'mastery',
    unlocked: false,
    coreReward: 30,
  },
  {
    id: 'boss_slayer',
    title: 'Titan Breaker',
    description: 'Annihilate any Sector Boss stage',
    icon: 'crown',
    category: 'mastery',
    unlocked: false,
    coreReward: 75,
  },
  {
    id: 'celestial_ace',
    title: 'Celestial Ace',
    description: 'Attain a flawless 3-star rating on any stage',
    icon: 'target',
    category: 'mastery',
    unlocked: false,
    coreReward: 50,
  },
];

class AchievementManager {
  private unlockedIds: Set<string> = new Set();
  private viewedIds: Set<string> = new Set();
  private claimedIds: Set<string> = new Set();
  private listeners: ((achievement: Achievement) => void)[] = [];
  private isRestrictedContext: boolean = false;

  constructor() {
    this.load();
  }

  public loadForUser(username?: string) {
    const userKey = username && username.toLowerCase() !== 'anonymous' ? username.toLowerCase() : null;
    const key = userKey ? `breakout_achievements_${userKey}` : STORAGE_KEY;
    const claimKey = userKey ? `breakout_achievement_claims_${userKey}` : CLAIM_STORAGE_KEY;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        this.unlockedIds = new Set(arr);
        this.viewedIds = new Set(arr);
      } else {
        this.unlockedIds = new Set();
        this.viewedIds = new Set();
      }
    } catch {
      this.load();
    }

    try {
      const cRaw = localStorage.getItem(claimKey);
      if (cRaw) {
        this.claimedIds = new Set(JSON.parse(cRaw));
      } else {
        this.claimedIds = new Set();
      }
    } catch {
      this.claimedIds = new Set();
    }

    // Recover unlocked trophies directly from SQLite database for authenticated player
    if (userKey) {
      backendApi.getUserTrophies(userKey).then((trophies) => {
        if (trophies && trophies.length > 0) {
          trophies.forEach((t) => {
            if (t.trophy_id) {
              this.unlockedIds.add(t.trophy_id);
              this.viewedIds.add(t.trophy_id);
            }
          });
          try {
            localStorage.setItem(key, JSON.stringify(Array.from(this.unlockedIds)));
          } catch {}
        }
      }).catch(() => {});
    }
  }

  public reset(): void {
    this.unlockedIds = new Set();
    this.viewedIds = new Set();
    this.claimedIds = new Set();
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(VIEWED_STORAGE_KEY);
      localStorage.removeItem(CLAIM_STORAGE_KEY);
    } catch {}
  }

  /**
   * Set restricted context mode:
   * When true (e.g. testing in Studio or playing self-made levels),
   * no achievements can be progressed or unlocked.
   */
  public setRestrictedContext(restricted: boolean) {
    this.isRestrictedContext = restricted;
  }

  public isRestricted(): boolean {
    return this.isRestrictedContext;
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        this.unlockedIds = new Set(arr);
      }
    } catch {
      this.unlockedIds = new Set();
    }

    try {
      const vRaw = localStorage.getItem(VIEWED_STORAGE_KEY);
      if (vRaw !== null) {
        this.viewedIds = new Set(JSON.parse(vRaw));
      } else {
        // First run with this key: treat currently existing unlocked as viewed
        this.viewedIds = new Set(this.unlockedIds);
        localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(Array.from(this.viewedIds)));
      }
    } catch {
      this.viewedIds = new Set(this.unlockedIds);
    }

    try {
      const cRaw = localStorage.getItem(CLAIM_STORAGE_KEY);
      if (cRaw) {
        this.claimedIds = new Set(JSON.parse(cRaw));
      } else {
        this.claimedIds = new Set();
      }
    } catch {
      this.claimedIds = new Set();
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.unlockedIds)));
    } catch {}
  }

  private saveClaims(username?: string) {
    const userKey = username && username.toLowerCase() !== 'anonymous' ? username.toLowerCase() : null;
    const claimKey = userKey ? `breakout_achievement_claims_${userKey}` : CLAIM_STORAGE_KEY;
    try {
      localStorage.setItem(claimKey, JSON.stringify(Array.from(this.claimedIds)));
    } catch {}
  }

  public isClaimed(id: string): boolean {
    return this.claimedIds.has(id);
  }

  public claimReward(id: string, username?: string): { success: boolean; reward: number } {
    if (!this.unlockedIds.has(id)) {
      return { success: false, reward: 0 };
    }
    if (this.claimedIds.has(id)) {
      return { success: false, reward: 0 };
    }
    const ach = INITIAL_ACHIEVEMENTS.find((a) => a.id === id);
    if (!ach || !ach.coreReward) {
      return { success: false, reward: 0 };
    }

    this.claimedIds.add(id);
    this.markAsViewed(id);
    this.saveClaims(username);

    // Credit cores to balance
    currencyService.addCores(ach.coreReward, username);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('achievement_claimed', { detail: { id, reward: ach.coreReward } })
      );
      window.dispatchEvent(new Event('currency-changed'));
      window.dispatchEvent(new Event('currency_balance_changed'));
    }

    return { success: true, reward: ach.coreReward };
  }

  public getPendingUnviewed(): Achievement | null {
    const all = this.getAll();
    const unviewed = all.filter((a) => a.unlocked && !a.claimed && !this.viewedIds.has(a.id));
    return unviewed.length > 0 ? unviewed[unviewed.length - 1] : null;
  }

  public markAsViewed(id: string): void {
    this.viewedIds.add(id);
    try {
      localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(Array.from(this.viewedIds)));
    } catch {}
  }

  public getAll(): Achievement[] {
    return INITIAL_ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: this.unlockedIds.has(a.id),
      claimed: this.claimedIds.has(a.id),
    }));
  }

  public getUnlockedCount(): number {
    return this.unlockedIds.size;
  }

  public hasUncollected(): boolean {
    return this.getAll().some((a) => a.unlocked && !a.claimed);
  }

  public getUncollectedCount(): number {
    return this.getAll().filter((a) => a.unlocked && !a.claimed).length;
  }

  public unlock(id: string): Achievement | null {
    // Strictly block achievement completion when testing or playing self-made levels
    if (this.isRestrictedContext) {
      return null;
    }

    if (this.unlockedIds.has(id)) return null;

    const ach = INITIAL_ACHIEVEMENTS.find((a) => a.id === id);
    if (!ach) return null;

    this.unlockedIds.add(id);
    this.save();

    const unlockedAch = { ...ach, unlocked: true, unlockedAt: Date.now() };
    this.listeners.forEach((fn) => fn(unlockedAch));

    // Dispatch global window event for components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('achievement_unlocked', { detail: unlockedAch })
      );
    }

    // Background sync to backend service & table
    try {
      const rawUser = typeof localStorage !== 'undefined' ? localStorage.getItem('breakout_auth_user') : null;
      const parsed = rawUser ? JSON.parse(rawUser) : null;
      const username = parsed?.username || 'sourav';
      backendApi.unlockTrophy(username, {
        trophyId: id,
        title: ach.title,
        description: ach.description,
        category: ach.category,
      }).catch(() => {});
    } catch {}

    return unlockedAch;
  }

  public onUnlock(fn: (achievement: Achievement) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }
}

export const achievementManager = new AchievementManager();
