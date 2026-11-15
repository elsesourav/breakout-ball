import { LevelData } from '../types/game';
import { currencyService } from './currency';
import { backendApi } from './backendApi';

export interface DailyApexPayload {
  today: {
    date: string;
    levelId: string;
    name: string;
    creator: string;
    targetCount: number;
    heatScore: number;
    bonusCores: number;
    repMultiplier: number;
    level: LevelData;
    expiresAt: string;
    secondsRemaining: number;
  };
  tomorrow?: {
    date: string;
    levelId: string;
    name: string;
    creator: string;
    targetCount: number;
    heatScore: number;
    bonusCores: number;
    repMultiplier: number;
  };
  serverTime?: string;
  fetchedAt?: number;
}

const STORAGE_CACHE_KEY = 'breakout_daily_apex_cache_v2';
let cachedMission: DailyApexPayload | null = null;
let isFetching = false;

// Hydrate from localStorage immediately on module load
try {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_CACHE_KEY) : null;
  if (raw) cachedMission = JSON.parse(raw);
} catch {}

/**
 * Returns UTC YYYY-MM-DD date key
 */
export function getDailyDateKey(date: Date = new Date()): string {
  if (cachedMission?.today?.date) return cachedMission.today.date;
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Seconds remaining until next rotation (synced with backend or next UTC midnight).
 */
export function getSecondsUntilMidnight(): number {
  if (cachedMission?.today?.expiresAt) {
    const expires = new Date(cachedMission.today.expiresAt).getTime();
    return Math.max(0, Math.floor((expires - Date.now()) / 1000));
  }
  const now = new Date();
  const nextUtcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return Math.max(0, Math.floor((nextUtcMidnight.getTime() - now.getTime()) / 1000));
}

export function formatDailyCountdown(totalSecs: number): string {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
}

/**
 * Fetch and synchronize Daily Apex Mission from authoritative backend scheduler.
 */
export async function fetchDailyApexMission(): Promise<DailyApexPayload | null> {
  if (isFetching) return cachedMission;
  isFetching = true;
  try {
    const data = await backendApi.getDailyApexMission();
    if (data && data.success && data.today) {
      cachedMission = { ...data, fetchedAt: Date.now() };
      try {
        localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(cachedMission));
      } catch {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('daily-apex-synced', { detail: cachedMission }));
      }
      return cachedMission;
    }
  } catch {} finally {
    isFetching = false;
  }
  return cachedMission;
}

export function getCachedDailyMission(): DailyApexPayload | null {
  return cachedMission;
}

/**
 * Returns today's featured mission level (authoritative backend or deterministic fallback).
 */
export function getDailyFeaturedLevel(
  levels: LevelData[],
  date: Date = new Date()
): { level: LevelData; dateKey: string; bonusCores: number } | null {
  if (cachedMission?.today?.level) {
    return {
      level: cachedMission.today.level,
      dateKey: cachedMission.today.date,
      bonusCores: cachedMission.today.bonusCores || 100,
    };
  }

  fetchDailyApexMission().catch(() => {});

  if (!levels || levels.length === 0) return null;
  const dateKey = getDailyDateKey(date);

  let hash = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    hash ^= dateKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
  const finalSeed = (hash ^ (hash >>> 16)) >>> 0;

  const validPool = levels.filter((lvl) => Array.isArray(lvl.blocks) && lvl.blocks.length > 0);
  const pool = validPool.length > 0 ? validPool : levels;
  const level = pool[finalSeed % pool.length];
  const bonusCores = 100 + ((finalSeed % 3) * 25);

  return { level, dateKey, bonusCores };
}

export function isDailyMissionCompleted(dateKey: string = getDailyDateKey()): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(`breakout_apex_done_${dateKey}`) === 'true';
  } catch {
    return false;
  }
}

export function isTodayDailyMission(levelId: string | number, levels: LevelData[]): boolean {
  if (cachedMission?.today?.levelId) {
    return String(cachedMission.today.levelId) === String(levelId);
  }
  const daily = getDailyFeaturedLevel(levels);
  return !!(daily?.level && String(daily.level.id) === String(levelId));
}

export function recordDailyMissionCompletion(
  levelId: string | number,
  levels: LevelData[],
  username?: string
): { success: boolean; bonusCores: number } {
  const daily = getDailyFeaturedLevel(levels);
  if (!daily || !daily.level) return { success: false, bonusCores: 0 };
  if (String(daily.level.id) !== String(levelId)) return { success: false, bonusCores: 0 };

  const { dateKey, bonusCores } = daily;
  if (isDailyMissionCompleted(dateKey)) return { success: false, bonusCores: 0 };

  try {
    localStorage.setItem(`breakout_apex_done_${dateKey}`, 'true');
    currencyService.addCores(bonusCores, username);
    if (username && username.toLowerCase() !== 'anonymous') {
      backendApi.completeDailyApex(username, String(levelId)).catch(() => {});
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('daily-apex-completed', { detail: { dateKey, bonusCores } }));
    }
    return { success: true, bonusCores };
  } catch {
    return { success: false, bonusCores: 0 };
  }
}
