import { LevelData, LeaderboardEntry } from '../types/game';
import { INITIAL_LOCAL_LEVELS, INITIAL_ONLINE_LEVELS, MOCK_LEADERBOARDS } from '../constants/game';
import { firestoreDb } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { authService } from './auth';

/**
 * Ensures all portals remain Quantum Portals (h: 7) and are properly paired.
 */
export function sanitizePortals(level: LevelData): LevelData {
  if (!level || !level.blocks || !Array.isArray(level.blocks)) return level;
  const portals = level.blocks.filter((b) => b.h === 7);
  if (portals.length === 0) return level;

  let unassignedPortalsCount = 0;
  const newBlocks = level.blocks.map((b) => {
    if (b.h !== 7) return b;
    if (b.portalPairId !== undefined && b.portalPairId >= 1 && b.portalPairId <= 4) {
      return b;
    }
    const pairId = Math.min(4, Math.floor(unassignedPortalsCount / 2) + 1);
    unassignedPortalsCount++;
    return { ...b, portalPairId: pairId };
  });

  return {
    ...level,
    blocks: newBlocks,
  };
}

export async function getOverallLeaderboard() {
  try {
    const snap = await getDoc(doc(firestoreDb, 'leaderboards', 'overall'));
    if (snap.exists() && Array.isArray(snap.data()?.entries)) return snap.data()?.entries;
  } catch {}
  return [];
}

export function seedDbLocalCache(
  localKey: string,
  onlineKey: string,
  userLevelsKey: string,
  leaderboardsKey: string
) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    const parsed = JSON.parse(localStorage.getItem(localKey) || '[]');
    if (!Array.isArray(parsed) || parsed.length < INITIAL_LOCAL_LEVELS.length) {
      localStorage.setItem(localKey, JSON.stringify(INITIAL_LOCAL_LEVELS));
    }
  } catch {
    localStorage.setItem(localKey, JSON.stringify(INITIAL_LOCAL_LEVELS));
  }
  const rawOnline = localStorage.getItem(onlineKey);
  const curatedMap = new Map(INITIAL_ONLINE_LEVELS.map((l) => [l.id, l]));
  if (!rawOnline) {
    localStorage.setItem(onlineKey, JSON.stringify(INITIAL_ONLINE_LEVELS));
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
      localStorage.setItem(onlineKey, JSON.stringify(updatedOnline));
    } catch {
      localStorage.setItem(onlineKey, JSON.stringify(INITIAL_ONLINE_LEVELS));
    }
  }
  const rawLeaderboards = localStorage.getItem(leaderboardsKey);
  if (!rawLeaderboards) {
    localStorage.setItem(leaderboardsKey, JSON.stringify(MOCK_LEADERBOARDS));
  } else {
    try {
      const parsed = JSON.parse(rawLeaderboards);
      if (parsed && parsed.default) delete parsed.default;
      let modified = false;
      for (const [k, v] of Object.entries(MOCK_LEADERBOARDS)) {
        if (!parsed[k]) { parsed[k] = v; modified = true; }
      }
      if (modified) localStorage.setItem(leaderboardsKey, JSON.stringify(parsed));
    } catch {}
  }
  const rawUser = localStorage.getItem(userLevelsKey);
  if (rawUser) {
    try {
      const parsed: LevelData[] = JSON.parse(rawUser);
      let modified = false;
      const anonId = authService.getAnonymousUserId();
      const updated = parsed.map((lvl) => {
        if (!lvl.creatorId && (!lvl.creator || lvl.creator.toLowerCase() === 'anonymous')) {
          modified = true;
          return { ...lvl, creatorId: anonId };
        }
        return lvl;
      });
      if (modified) localStorage.setItem(userLevelsKey, JSON.stringify(updated));
    } catch {}
  }
}
