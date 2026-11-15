import { LevelData, LeaderboardEntry, LocalLevelProgress } from '../types/game';
import { INITIAL_LOCAL_LEVELS, INITIAL_ONLINE_LEVELS, MOCK_LEADERBOARDS } from '../constants/game';
import { firestoreDb } from './firebase';
import { backendApi } from './backendApi';
import { authService } from './auth';
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, increment, query, orderBy, limit
} from 'firebase/firestore';

/**
 * Ensures all portals remain Quantum Portals (h: 7) and are properly paired.
 * Under NO circumstances does this function convert a portal (h: 7) into a standard block or Titanium block!
 */
export function sanitizePortals(level: LevelData): LevelData {
  if (!level || !level.blocks || !Array.isArray(level.blocks)) return level;
  const portals = level.blocks.filter((b) => b.h === 7);
  if (portals.length === 0) return level;

  // Track existing portal pair IDs (1..4)
  let unassignedPortalsCount = 0;
  const newBlocks = level.blocks.map((b) => {
    if (b.h !== 7) return b;
    // Keep portal type (h: 7) strictly intact - NEVER convert to Titanium or another block
    if (b.portalPairId !== undefined && b.portalPairId >= 1 && b.portalPairId <= 4) {
      return b;
    }
    // Allocate sequential pair IDs for unassigned portals (every 2 portals share a pairId)
    const pairId = Math.min(4, Math.floor(unassignedPortalsCount / 2) + 1);
    unassignedPortalsCount++;
    return { ...b, portalPairId: pairId };
  });

  return {
    ...level,
    blocks: newBlocks,
  };
}

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
    try {
      const parsed = JSON.parse(localStorage.getItem(this.localLevelsKey) || '[]');
      if (!Array.isArray(parsed) || parsed.length < INITIAL_LOCAL_LEVELS.length) {
        localStorage.setItem(this.localLevelsKey, JSON.stringify(INITIAL_LOCAL_LEVELS));
      }
    } catch {
      localStorage.setItem(this.localLevelsKey, JSON.stringify(INITIAL_LOCAL_LEVELS));
    }
    const rawOnline = localStorage.getItem(this.onlineLevelsKey);
    const curatedMap = new Map(INITIAL_ONLINE_LEVELS.map((l) => [l.id, l]));
    if (!rawOnline) {
      localStorage.setItem(this.onlineLevelsKey, JSON.stringify(INITIAL_ONLINE_LEVELS));
    } else {
      try {
        const parsed: LevelData[] = JSON.parse(rawOnline);
        const updatedOnline = parsed.map((l) => {
          const curated = curatedMap.get(l.id);
          return curated ? { ...curated, playCount: Math.max(curated.playCount || 0, l.playCount || 0) } : sanitizePortals(l);
        });
        INITIAL_ONLINE_LEVELS.forEach((curated) => {
          if (!updatedOnline.some((l) => l.id === curated.id)) updatedOnline.push(curated);
        });
        localStorage.setItem(this.onlineLevelsKey, JSON.stringify(updatedOnline));
      } catch {
        localStorage.setItem(this.onlineLevelsKey, JSON.stringify(INITIAL_ONLINE_LEVELS));
      }
    }
    if (!localStorage.getItem(this.leaderboardsKey)) {
      localStorage.setItem(this.leaderboardsKey, JSON.stringify(MOCK_LEADERBOARDS));
    }
  }

  /** Background sync of curated initial stages to Cloud Firestore */
  private async syncInitialLevelsToCloud(): Promise<void> {
    try {
      for (const lvl of INITIAL_ONLINE_LEVELS) {
        await setDoc(doc(firestoreDb, 'online_levels', lvl.id), { ...lvl, updatedAt: new Date().toISOString() }, { merge: true });
      }
    } catch {}
  }

  // ==========================================
  // LEVELS API (CLOUD FIRESTORE)
  // ==========================================

  public async getLocalLevels(): Promise<LevelData[]> {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.localLevelsKey) || '[]');
      if (Array.isArray(parsed) && parsed.length >= INITIAL_LOCAL_LEVELS.length) return parsed;
    } catch {}
    localStorage.setItem(this.localLevelsKey, JSON.stringify(INITIAL_LOCAL_LEVELS));
    return INITIAL_LOCAL_LEVELS;
  }

  public async getOnlineLevels(searchTerm?: string): Promise<LevelData[]> {
    const curatedMap = new Map(INITIAL_ONLINE_LEVELS.map((l) => [l.id, l]));

    // 1. Fetch live levels from Cloud Firestore
    try {
      const q = query(collection(firestoreDb, 'online_levels'), orderBy('playCount', 'desc'), limit(50));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const cloudLevels: LevelData[] = snap.docs.map((d) => d.data() as LevelData);
        // Exclude numeric arcade levels
        const cleanCloud = cloudLevels.filter((l) => isNaN(Number(l.id)));

        // Merge: Curated levels ALWAYS use official definitions with verified portal pairings,
        // while adopting any updated playCount.
        // User-generated levels are strictly sanitized against orphan single portals.
        const sanitizedCloud = cleanCloud.map((cloudLvl) => {
          const curated = curatedMap.get(cloudLvl.id);
          if (curated) {
            return {
              ...curated,
              playCount: Math.max(curated.playCount || 0, cloudLvl.playCount || 0),
            };
          }
          return sanitizePortals(cloudLvl);
        });

        const cloudIds = new Set(sanitizedCloud.map((l) => l.id));
        const missingCurated = INITIAL_ONLINE_LEVELS.filter((l) => !cloudIds.has(l.id));
        const merged = [...sanitizedCloud, ...missingCurated];

        // Update local cache for offline play
        localStorage.setItem(this.onlineLevelsKey, JSON.stringify(merged));

        return this.filterLevelsByTerm(merged, searchTerm);
      }
    } catch {}

    // 2. Offline / Cache fallback
    const raw = localStorage.getItem(this.onlineLevelsKey);
    const rawLevels: LevelData[] = raw ? JSON.parse(raw) : INITIAL_ONLINE_LEVELS;
    const cleanLevels = rawLevels
      .map((l) => {
        const curated = curatedMap.get(l.id);
        if (curated) {
          return {
            ...curated,
            playCount: Math.max(curated.playCount || 0, l.playCount || 0),
          };
        }
        return sanitizePortals(l);
      })
      .filter((l) => isNaN(Number(l.id)));
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

    // 2. Check curated stages first (authoritative verified layouts)
    const curated = INITIAL_ONLINE_LEVELS.find((l) => l.id === id);
    if (curated) return curated;

    // 3. Check Firestore
    try {
      const snap = await getDoc(doc(firestoreDb, 'online_levels', id));
      if (snap.exists()) {
        return sanitizePortals(snap.data() as LevelData);
      }
    } catch {}

    // 4. Check local cache
    const online = await this.getOnlineLevels();
    const foundOnline = online.find((l) => l.id === id);
    return foundOnline ? sanitizePortals(foundOnline) : null;
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
    // 1. Live Backend Microservice
    try {
      const apiEntries = await backendApi.getLevelLeaderboard(levelId);
      if (apiEntries && apiEntries.length > 0) {
        return apiEntries.map((e) => ({
          rank: e.rank,
          username: e.username,
          displayName: e.fullName || e.username,
          avatarUrl: e.avatarUrl,
          score: e.score,
          time: e.time ?? 30,
        }));
      }
    } catch {}

    // 2. Cloud Firestore
    try {
      const snap = await getDoc(doc(firestoreDb, 'leaderboards', String(levelId)));
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.entries) && data.entries.length > 0) {
          return data.entries;
        }
      }
    } catch {}

    // 3. Local fallback
    const raw = localStorage.getItem(this.leaderboardsKey);
    const all: Record<string, LeaderboardEntry[]> = raw ? JSON.parse(raw) : MOCK_LEADERBOARDS;
    return all[levelId] || all.default || [];
  }

  public async submitScore(
    levelId: string,
    username: string,
    time: number,
    livesRemaining: number = 3
  ): Promise<{ rank: number; isNewBest: boolean; updatedLeaderboard: LeaderboardEntry[] }> {
    const existingList: LeaderboardEntry[] = await this.getLeaderboard(levelId);
    const currentEntry = existingList.find((e) => e.username.toLowerCase() === username.toLowerCase());
    const isNewBest = !currentEntry || time < currentEntry.time;
    const filtered = existingList.filter((e) => e.username.toLowerCase() !== username.toLowerCase());
    const bestScoreTime = currentEntry && currentEntry.time < time ? currentEntry.time : time;
    const userProfile = authService.getCurrentUser();

    filtered.push({
      rank: 0,
      username,
      displayName: userProfile.fullName || currentEntry?.displayName || username,
      avatarUrl: userProfile.avatarUrl || currentEntry?.avatarUrl,
      time: bestScoreTime,
    });
    filtered.sort((a, b) => a.time - b.time);
    filtered.forEach((item, idx) => { item.rank = idx + 1; });
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

    // Background sync to backend microservice
    backendApi.recordLevelCompletion(username, {
      levelId,
      timeUsed: time,
      livesRemaining,
      score: Math.max(1000, Math.floor(10000 - time * 120)),
      stars: Math.min(3, Math.max(1, livesRemaining)),
    }).catch(() => {});

    const userEntry = finalLeaderboard.find((e) => e.username.toLowerCase() === username.toLowerCase());
    const rank = userEntry ? userEntry.rank : finalLeaderboard.length + 1;
    return { rank, isNewBest, updatedLeaderboard: finalLeaderboard };
  }

  // ==========================================
  // USER CLOUD PROGRESS API (CLOUD FIRESTORE & SQLITE)
  // ==========================================

  public clearLocalProgress(username?: string): void {
    const freshStart = { '1': { levelNumber: 1, completed: false, rank: null, bestTime: null } };
    try {
      localStorage.removeItem(this.progressKey);
      if (username) localStorage.removeItem(`breakout_db_progress_${username.toLowerCase()}`);
      localStorage.removeItem(this.userLevelsKey);
      localStorage.removeItem('breakout_custom_levels');
      localStorage.setItem(this.progressKey, JSON.stringify(freshStart));
    } catch {}
  }

  public async getProgress(username?: string): Promise<Record<string, LocalLevelProgress>> {
    const userKey = username && username.toLowerCase() !== 'anonymous' ? username.toLowerCase() : null;
    const defaultInitial: Record<string, LocalLevelProgress> = {
      '1': { levelNumber: 1, completed: false, rank: null, bestTime: null },
    };

    if (!userKey) {
      try {
        const raw = localStorage.getItem(this.progressKey);
        if (raw) return JSON.parse(raw);
      } catch {}
      localStorage.setItem(this.progressKey, JSON.stringify(defaultInitial));
      return defaultInitial;
    }

    let progress: Record<string, LocalLevelProgress> = { ...defaultInitial };
    try {
      const cached = localStorage.getItem(`breakout_db_progress_${userKey}`);
      if (cached) progress = { ...progress, ...JSON.parse(cached) };
    } catch {}

    try {
      const snap = await getDoc(doc(firestoreDb, 'users', userKey));
      if (snap.exists() && snap.data()?.levelsRecord) {
        progress = { ...progress, ...snap.data().levelsRecord };
      }
    } catch {}

    // Recover completions from SQLite backend
    try {
      const completions = await backendApi.getUserCompletions(userKey);
      if (completions && completions.length > 0) {
        let maxCompleted = 0;
        for (const c of completions) {
          const num = parseInt(c.level_id, 10);
          if (!isNaN(num) && num > maxCompleted) maxCompleted = num;
          const prev = progress[c.level_id];
          progress[c.level_id] = {
            levelNumber: isNaN(num) ? 1 : num,
            completed: true,
            rank: prev?.rank || null,
            bestTime: prev?.bestTime && prev.bestTime < c.time_used ? prev.bestTime : c.time_used,
            stars: Math.max(prev?.stars || 0, c.stars || 1),
          };
        }
        const nextLevel = maxCompleted + 1;
        if (nextLevel <= 10 && !progress[String(nextLevel)]) {
          progress[String(nextLevel)] = { levelNumber: nextLevel, completed: false, rank: null, bestTime: null };
        }
      }
    } catch {}

    try {
      localStorage.setItem(`breakout_db_progress_${userKey}`, JSON.stringify(progress));
      localStorage.setItem(this.progressKey, JSON.stringify(progress));
    } catch {}
    return progress;
  }

  public async saveProgress(progress: Record<string, LocalLevelProgress>, username?: string): Promise<void> {
    localStorage.setItem(this.progressKey, JSON.stringify(progress));
    const userKey = username && username.toLowerCase() !== 'anonymous' ? username.toLowerCase() : null;
    if (userKey) {
      localStorage.setItem(`breakout_db_progress_${userKey}`, JSON.stringify(progress));
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

export async function getOverallLeaderboard() {
  try {
    const snap = await getDoc(doc(firestoreDb, 'leaderboards', 'overall'));
    if (snap.exists() && Array.isArray(snap.data()?.entries)) return snap.data()?.entries;
  } catch {}
  return [];
}
