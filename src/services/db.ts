/**
 * Cloud Database Service (Cloud Firestore Native)
 *
 * Connects directly to Google Cloud Firestore (Project: breakout-ball)
 * replacing the legacy Firebase Realtime Database.
 *
 * Implements:
 * - Community & Custom Levels (Firestore 'online_levels' & 'user_levels')
 * - Global Level Leaderboards (Firestore 'leaderboards')
 * - User Progress & Cloud Sync (Firestore 'users')
 * - High-speed Local Cache & Offline Resilience
 */

import { LevelData, LeaderboardEntry, LocalLevelProgress } from '../types/game';
import { INITIAL_LOCAL_LEVELS, INITIAL_ONLINE_LEVELS, MOCK_LEADERBOARDS } from '../constants/game';
import { firestoreDb } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

class CloudDatabaseService {
  private localLevelsKey = 'breakout_db_local_levels';
  private onlineLevelsKey = 'breakout_db_online_levels';
  private userLevelsKey = 'breakout_db_user_levels';
  private leaderboardsKey = 'breakout_db_leaderboards';
  private progressKey = 'breakout_db_progress';

  constructor() {
    this.seedLocalCache();
    this.syncInitialLevelsToCloud().catch(() => {});
  }

  private seedLocalCache() {
    if (!localStorage.getItem(this.localLevelsKey)) {
      localStorage.setItem(this.localLevelsKey, JSON.stringify(INITIAL_LOCAL_LEVELS));
    }
    if (!localStorage.getItem(this.onlineLevelsKey)) {
      localStorage.setItem(this.onlineLevelsKey, JSON.stringify(INITIAL_ONLINE_LEVELS));
    }
    if (!localStorage.getItem(this.leaderboardsKey)) {
      localStorage.setItem(this.leaderboardsKey, JSON.stringify(MOCK_LEADERBOARDS));
    }
  }

  /**
   * One-time background sync of curated initial stages to Cloud Firestore
   */
  private async syncInitialLevelsToCloud(): Promise<void> {
    try {
      const snap = await getDocs(query(collection(firestoreDb, 'online_levels'), limit(1)));
      if (snap.empty) {
        // Seed curated stages into Firestore so all players immediately see them
        for (const lvl of INITIAL_ONLINE_LEVELS) {
          await setDoc(doc(firestoreDb, 'online_levels', lvl.id), {
            ...lvl,
            createdAt: new Date().toISOString(),
          }, { merge: true });
        }
      }
    } catch {}
  }

  // ==========================================
  // LEVELS API (CLOUD FIRESTORE)
  // ==========================================

  public async getLocalLevels(): Promise<LevelData[]> {
    const raw = localStorage.getItem(this.localLevelsKey);
    return raw ? JSON.parse(raw) : INITIAL_LOCAL_LEVELS;
  }

  public async getOnlineLevels(searchTerm?: string): Promise<LevelData[]> {
    // 1. Fetch live levels from Cloud Firestore
    try {
      const q = query(collection(firestoreDb, 'online_levels'), orderBy('playCount', 'desc'), limit(50));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const cloudLevels: LevelData[] = snap.docs.map((d) => d.data() as LevelData);
        // Exclude numeric arcade levels
        const cleanCloud = cloudLevels.filter((l) => isNaN(Number(l.id)));
        const cloudIds = new Set(cleanCloud.map((l) => l.id));

        // Merge with initial curated stages
        const missingCurated = INITIAL_ONLINE_LEVELS.filter((l) => !cloudIds.has(l.id));
        const merged = [...cleanCloud, ...missingCurated];

        // Update local cache for offline play
        localStorage.setItem(this.onlineLevelsKey, JSON.stringify(merged));

        return this.filterLevelsByTerm(merged, searchTerm);
      }
    } catch {}

    // 2. Offline / Cache fallback
    const raw = localStorage.getItem(this.onlineLevelsKey);
    const rawLevels: LevelData[] = raw ? JSON.parse(raw) : INITIAL_ONLINE_LEVELS;
    const cleanLevels = rawLevels.filter((l) => isNaN(Number(l.id)));
    return this.filterLevelsByTerm(cleanLevels, searchTerm);
  }

  private filterLevelsByTerm(levels: LevelData[], term?: string): LevelData[] {
    if (!term || !term.trim()) return levels;
    const upper = term.trim().toUpperCase();
    return levels.filter(
      (l) => l.id.toUpperCase().includes(upper) || (l.name && l.name.toUpperCase().includes(upper))
    );
  }

  public async getUserCreatedLevels(username: string): Promise<LevelData[]> {
    try {
      const snap = await getDocs(collection(firestoreDb, 'user_levels'));
      if (!snap.empty) {
        const cloudLevels = snap.docs
          .map((d) => d.data() as LevelData)
          .filter((l) => l.creator.toLowerCase() === username.toLowerCase());
        if (cloudLevels.length > 0) return cloudLevels;
      }
    } catch {}

    const raw = localStorage.getItem(this.userLevelsKey);
    const levels: LevelData[] = raw ? JSON.parse(raw) : [];
    return levels.filter((l) => l.creator.toLowerCase() === username.toLowerCase());
  }

  public async getLevelById(id: string): Promise<LevelData | null> {
    // 1. Check local stages
    const local = await this.getLocalLevels();
    const foundLocal = local.find((l) => l.id === id);
    if (foundLocal) return foundLocal;

    // 2. Check Firestore
    try {
      const snap = await getDoc(doc(firestoreDb, 'online_levels', id));
      if (snap.exists()) {
        return snap.data() as LevelData;
      }
    } catch {}

    // 3. Check local cache
    const online = await this.getOnlineLevels();
    return online.find((l) => l.id === id) || null;
  }

  public async saveLevel(level: LevelData): Promise<boolean> {
    try {
      // 1. Save to Cloud Firestore
      if (level.isPublic) {
        await setDoc(doc(firestoreDb, 'online_levels', level.id), {
          ...level,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      await setDoc(doc(firestoreDb, 'user_levels', `${level.creator}_${level.id}`), {
        ...level,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // 2. Sync Local Cache
      const rawUser = localStorage.getItem(this.userLevelsKey);
      const userLevels: LevelData[] = rawUser ? JSON.parse(rawUser) : [];
      const existingIdx = userLevels.findIndex((l) => l.id === level.id);
      if (existingIdx >= 0) userLevels[existingIdx] = { ...level };
      else userLevels.unshift(level);
      localStorage.setItem(this.userLevelsKey, JSON.stringify(userLevels));

      const rawOnline = localStorage.getItem(this.onlineLevelsKey);
      let onlineLevels: LevelData[] = rawOnline ? JSON.parse(rawOnline) : [];
      if (level.isPublic) {
        const oIdx = onlineLevels.findIndex((l) => l.id === level.id);
        if (oIdx >= 0) onlineLevels[oIdx] = { ...level };
        else onlineLevels.unshift(level);
      } else {
        onlineLevels = onlineLevels.filter((l) => l.id !== level.id);
      }
      localStorage.setItem(this.onlineLevelsKey, JSON.stringify(onlineLevels));

      return true;
    } catch {
      return false;
    }
  }

  public async updateLevelPrivacy(id: string, isPublic: boolean): Promise<boolean> {
    const level = await this.getLevelById(id);
    if (!level) return false;
    level.isPublic = isPublic;
    return this.saveLevel(level);
  }

  public async deleteLevel(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(firestoreDb, 'online_levels', id)).catch(() => {});

      const rawUser = localStorage.getItem(this.userLevelsKey);
      if (rawUser) {
        const userLevels: LevelData[] = JSON.parse(rawUser);
        localStorage.setItem(this.userLevelsKey, JSON.stringify(userLevels.filter((l) => l.id !== id)));
      }

      const rawOnline = localStorage.getItem(this.onlineLevelsKey);
      if (rawOnline) {
        const onlineLevels: LevelData[] = JSON.parse(rawOnline);
        localStorage.setItem(this.onlineLevelsKey, JSON.stringify(onlineLevels.filter((l) => l.id !== id)));
      }

      return true;
    } catch {
      return false;
    }
  }

  public async incrementPlayCount(levelId: string): Promise<void> {
    try {
      await updateDoc(doc(firestoreDb, 'online_levels', levelId), {
        playCount: increment(1),
      });
    } catch {}

    const rawOnline = localStorage.getItem(this.onlineLevelsKey);
    if (rawOnline) {
      const onlineLevels: LevelData[] = JSON.parse(rawOnline);
      const lvl = onlineLevels.find((l) => l.id === levelId);
      if (lvl) {
        lvl.playCount = (lvl.playCount || 0) + 1;
        localStorage.setItem(this.onlineLevelsKey, JSON.stringify(onlineLevels));
      }
    }
  }

  // ==========================================
  // LEADERBOARD & RANKINGS API (CLOUD FIRESTORE)
  // ==========================================

  public async getLeaderboard(levelId: string): Promise<LeaderboardEntry[]> {
    // 1. Read live leaderboard document from Cloud Firestore
    try {
      const snap = await getDoc(doc(firestoreDb, 'leaderboards', String(levelId)));
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.entries) && data.entries.length > 0) {
          return data.entries;
        }
      }
    } catch {}

    // 2. Local fallback
    const raw = localStorage.getItem(this.leaderboardsKey);
    const all: Record<string, LeaderboardEntry[]> = raw ? JSON.parse(raw) : MOCK_LEADERBOARDS;
    return all[levelId] || all.default || [];
  }

  public async submitScore(
    levelId: string,
    username: string,
    time: number
  ): Promise<{ rank: number; isNewBest: boolean; updatedLeaderboard: LeaderboardEntry[] }> {
    const existingList: LeaderboardEntry[] = await this.getLeaderboard(levelId);

    const currentEntry = existingList.find((e) => e.username.toLowerCase() === username.toLowerCase());
    const isNewBest = !currentEntry || time < currentEntry.time;

    const filtered = existingList.filter((e) => e.username.toLowerCase() !== username.toLowerCase());
    const bestScoreTime = currentEntry && currentEntry.time < time ? currentEntry.time : time;

    filtered.push({
      rank: 0,
      username,
      time: bestScoreTime,
    });

    filtered.sort((a, b) => a.time - b.time);
    filtered.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    const finalLeaderboard = filtered.slice(0, 10);

    // Save to Cloud Firestore
    try {
      await setDoc(doc(firestoreDb, 'leaderboards', String(levelId)), {
        levelId: String(levelId),
        entries: finalLeaderboard,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch {}

    // Sync Local Cache
    try {
      const raw = localStorage.getItem(this.leaderboardsKey);
      const all = raw ? JSON.parse(raw) : MOCK_LEADERBOARDS;
      all[levelId] = finalLeaderboard;
      localStorage.setItem(this.leaderboardsKey, JSON.stringify(all));
    } catch {}

    const userEntry = finalLeaderboard.find((e) => e.username.toLowerCase() === username.toLowerCase());
    const rank = userEntry ? userEntry.rank : finalLeaderboard.length + 1;

    return { rank, isNewBest, updatedLeaderboard: finalLeaderboard };
  }

  // ==========================================
  // USER CLOUD PROGRESS API (CLOUD FIRESTORE)
  // ==========================================

  public async getProgress(username?: string): Promise<Record<string, LocalLevelProgress>> {
    const userKey = username && username.toLowerCase() !== 'anonymous' ? username.toLowerCase() : null;

    // 1. Fetch user progress from Cloud Firestore if authenticated
    if (userKey) {
      try {
        const snap = await getDoc(doc(firestoreDb, 'users', userKey));
        if (snap.exists()) {
          const data = snap.data();
          if (data?.levelsRecord && Object.keys(data.levelsRecord).length > 0) {
            localStorage.setItem(`breakout_db_progress_${userKey}`, JSON.stringify(data.levelsRecord));
            return data.levelsRecord;
          }
        }
      } catch {}
    }

    // 2. Local fallback
    const raw = (userKey ? localStorage.getItem(`breakout_db_progress_${userKey}`) : null) ||
      localStorage.getItem(this.progressKey);

    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }

    const initial: Record<string, LocalLevelProgress> = {
      '1': { levelNumber: 1, completed: false, rank: null, bestTime: null },
    };
    localStorage.setItem(this.progressKey, JSON.stringify(initial));
    return initial;
  }

  public async saveProgress(progress: Record<string, LocalLevelProgress>, username?: string): Promise<void> {
    localStorage.setItem(this.progressKey, JSON.stringify(progress));

    const userKey = username && username.toLowerCase() !== 'anonymous' ? username.toLowerCase() : null;
    if (userKey) {
      localStorage.setItem(`breakout_db_progress_${userKey}`, JSON.stringify(progress));

      // Sync progress to Cloud Firestore
      try {
        await setDoc(doc(firestoreDb, 'users', userKey), {
          levelsRecord: progress,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch {}
    }
  }
}

export const dbService = new CloudDatabaseService();
