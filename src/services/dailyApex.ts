import { LevelData } from '../types/game';
import { currencyService } from './currency';

/**
 * Returns local YYYY-MM-DD date key
 */
export function getDailyDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Seconds remaining until next local midnight (00:00:00).
 */
export function getSecondsUntilMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  return Math.max(0, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
}

/**
 * Formats seconds into compact countdown string: e.g. "10h 14m 22s"
 */
export function formatDailyCountdown(totalSecs: number): string {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  return `${m}m ${s}s`;
}

/**
 * Deterministic daily pseudo-random selection for Daily Apex Mission.
 * Generates a stable, high-entropy index for any given date string (YYYY-MM-DD).
 * Ensures all players see the exact same random Daily Apex Mission each day,
 * and automatically rotates to a new random stage at midnight without needing any admin panel.
 */
export function getDailyFeaturedLevel(
  levels: LevelData[],
  date: Date = new Date()
): { level: LevelData; dateKey: string; bonusCores: number } | null {
  if (!levels || levels.length === 0) return null;

  const dateKey = getDailyDateKey(date);

  // Multiplicative & avalanche hash for high entropy daily pseudo-randomness
  let hash = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    hash ^= dateKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
  const finalSeed = (hash ^ (hash >>> 16)) >>> 0;

  // Filter for playable arena levels (must have blocks)
  const validPool = levels.filter((lvl) => Array.isArray(lvl.blocks) && lvl.blocks.length > 0);
  const pool = validPool.length > 0 ? validPool : levels;

  const selectedIndex = finalSeed % pool.length;
  const level = pool[selectedIndex];

  // Daily bounty: dynamically alternates between 100, 125, 150 cores based on daily seed
  const bonusCores = 100 + ((finalSeed % 3) * 25);

  return { level, dateKey, bonusCores };
}

/**
 * Checks whether today's Daily Apex Mission has been completed and claimed.
 */
export function isDailyMissionCompleted(dateKey: string = getDailyDateKey()): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(`breakout_apex_done_${dateKey}`) === 'true';
  } catch {
    return false;
  }
}

/**
 * Checks if a given level ID matches today's Daily Apex Mission.
 */
export function isTodayDailyMission(levelId: string | number, levels: LevelData[]): boolean {
  const daily = getDailyFeaturedLevel(levels);
  if (!daily || !daily.level) return false;
  return String(daily.level.id) === String(levelId);
}

/**
 * Records completion of today's Daily Apex Mission, awards bounty cores once,
 * and broadcasts an event to notify all components.
 */
export function recordDailyMissionCompletion(
  levelId: string | number,
  levels: LevelData[],
  username?: string
): { success: boolean; bonusCores: number } {
  const daily = getDailyFeaturedLevel(levels);
  if (!daily || !daily.level) return { success: false, bonusCores: 0 };

  if (String(daily.level.id) !== String(levelId)) {
    return { success: false, bonusCores: 0 };
  }

  const { dateKey, bonusCores } = daily;
  if (isDailyMissionCompleted(dateKey)) {
    return { success: false, bonusCores: 0 };
  }

  try {
    localStorage.setItem(`breakout_apex_done_${dateKey}`, 'true');
    currencyService.addCores(bonusCores, username);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('daily-apex-completed', { detail: { dateKey, bonusCores } })
      );
    }
    return { success: true, bonusCores };
  } catch {
    return { success: false, bonusCores: 0 };
  }
}
