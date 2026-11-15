import { Achievement } from '../types/game';
import { backendApi } from './backendApi';

const STORAGE_KEY = 'breakout_achievements_v1';
const VIEWED_STORAGE_KEY = 'breakout_viewed_achievements_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: 'First Impact',
    description: 'Break your first energy block in any stage',
    icon: 'zap',
    category: 'combat',
    unlocked: false,
  },
  {
    id: 'combo_5',
    title: 'Combo Spark',
    description: 'Achieve a 5x combo streak without losing ball',
    icon: 'flame',
    category: 'combat',
    unlocked: false,
  },
  {
    id: 'combo_10',
    title: 'Unstoppable Flow',
    description: 'Reach a blistering 10x combo streak',
    icon: 'zap',
    category: 'combat',
    unlocked: false,
  },
  {
    id: 'portal_hopper',
    title: 'Quantum Leaper',
    description: 'Warp a ball through a pair of cyber portals',
    icon: 'compass',
    category: 'mastery',
    unlocked: false,
  },
  {
    id: 'emp_detonator',
    title: 'Shockwave Master',
    description: 'Detonate an EMP explosive block',
    icon: 'target',
    category: 'combat',
    unlocked: false,
  },
  {
    id: 'speed_demon',
    title: 'Supersonic',
    description: 'Clear any level in under 30 seconds',
    icon: 'timer',
    category: 'speed',
    unlocked: false,
  },
  {
    id: 'campaign_10',
    title: 'Sector Veteran',
    description: 'Conquer 10 arcade campaign stages',
    icon: 'shield',
    category: 'mastery',
    unlocked: false,
  },
  {
    id: 'apex_champion',
    title: 'Apex Legend',
    description: 'Conquer all 50 arcade campaign stages',
    icon: 'crown',
    category: 'mastery',
    unlocked: false,
  },
  {
    id: 'level_architect',
    title: 'Master Architect',
    description: 'Create and save a custom stage in the Studio',
    icon: 'palette',
    category: 'creative',
    unlocked: false,
  },
  {
    id: 'arena_challenger',
    title: 'Global Contender',
    description: 'Challenge a community stage in Global Arena',
    icon: 'globe',
    category: 'mastery',
    unlocked: false,
  },
];

class AchievementManager {
  private unlockedIds: Set<string> = new Set();
  private viewedIds: Set<string> = new Set();
  private listeners: ((achievement: Achievement) => void)[] = [];
  private isRestrictedContext: boolean = false;

  constructor() {
    this.load();
  }

  public loadForUser(username?: string) {
    const userKey = username && username.toLowerCase() !== 'anonymous' ? username.toLowerCase() : null;
    const key = userKey ? `breakout_achievements_${userKey}` : STORAGE_KEY;
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
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(VIEWED_STORAGE_KEY);
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
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.unlockedIds)));
    } catch {}
  }

  public getPendingUnviewed(): Achievement | null {
    const all = this.getAll();
    const unviewed = all.filter((a) => a.unlocked && !this.viewedIds.has(a.id));
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
    }));
  }

  public getUnlockedCount(): number {
    return this.unlockedIds.size;
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
