/**
 * Standard Database Service (Replaces legacy Firebase Realtime Database)
 *
 * Implements a relational/REST standard database pattern for:
 * - Levels (Local, Online, User Created)
 * - Leaderboards & Scores
 * - User Progress & Telemetry
 *
 * Fully decoupled from Firebase with offline persistence and REST-ready contracts.
 */

import { LevelData, LeaderboardEntry, LocalLevelProgress, BlockData } from '../types/game';
import { INITIAL_LOCAL_LEVELS, INITIAL_ONLINE_LEVELS, MOCK_LEADERBOARDS } from '../constants/game';

export interface DatabaseLevelRow {
  id: string;
  name: string;
  creator: string;
  play_count: number;
  is_public: boolean;
  blocks_json: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseScoreRow {
  id: string;
  level_id: string;
  username: string;
  time: number;
  rank?: number;
  created_at: string;
}

class StandardDatabaseService {
  private localLevelsKey = 'breakout_db_local_levels';
  private onlineLevelsKey = 'breakout_db_online_levels';
  private userLevelsKey = 'breakout_db_user_levels';
  private leaderboardsKey = 'breakout_db_leaderboards';
  private progressKey = 'breakout_db_progress';

  constructor() {
    this.seedDatabaseIfEmpty();
  }

  private seedDatabaseIfEmpty() {
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

  // ==========================================
  // LEVELS API
  // ==========================================

  public async getLocalLevels(): Promise<LevelData[]> {
    const raw = localStorage.getItem(this.localLevelsKey);
    return raw ? JSON.parse(raw) : INITIAL_LOCAL_LEVELS;
  }

  public async getOnlineLevels(searchTerm?: string): Promise<LevelData[]> {
    const raw = localStorage.getItem(this.onlineLevelsKey);
    const levels: LevelData[] = raw ? JSON.parse(raw) : INITIAL_ONLINE_LEVELS;

    if (!searchTerm || !searchTerm.trim()) {
      return levels;
    }

    const term = searchTerm.trim().toUpperCase();
    return levels.filter(
      (l) => l.id.toUpperCase().includes(term) || (l.name && l.name.toUpperCase().includes(term))
    );
  }

  public async getUserCreatedLevels(username: string): Promise<LevelData[]> {
    const raw = localStorage.getItem(this.userLevelsKey);
    const levels: LevelData[] = raw ? JSON.parse(raw) : [];
    return levels.filter((l) => l.creator.toLowerCase() === username.toLowerCase());
  }

  public async getLevelById(id: string): Promise<LevelData | null> {
    const local = await this.getLocalLevels();
    const foundLocal = local.find((l) => l.id === id);
    if (foundLocal) return foundLocal;

    const online = await this.getOnlineLevels();
    const foundOnline = online.find((l) => l.id === id);
    if (foundOnline) return foundOnline;

    const rawUser = localStorage.getItem(this.userLevelsKey);
    const userLevels: LevelData[] = rawUser ? JSON.parse(rawUser) : [];
    return userLevels.find((l) => l.id === id) || null;
  }

  public async saveLevel(level: LevelData): Promise<boolean> {
    try {
      const rawUser = localStorage.getItem(this.userLevelsKey);
      const userLevels: LevelData[] = rawUser ? JSON.parse(rawUser) : [];

      const existingIndex = userLevels.findIndex((l) => l.id === level.id);
      if (existingIndex >= 0) {
        userLevels[existingIndex] = { ...level };
      } else {
        userLevels.unshift(level);
      }
      localStorage.setItem(this.userLevelsKey, JSON.stringify(userLevels));

      // Sync with online levels repository if public
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
    const rawUser = localStorage.getItem(this.userLevelsKey);
    const userLevels: LevelData[] = rawUser ? JSON.parse(rawUser) : [];
    const target = userLevels.find((l) => l.id === id);
    if (!target) return false;

    target.isPublic = isPublic;
    return this.saveLevel(target);
  }

  public async deleteLevel(id: string): Promise<boolean> {
    try {
      const rawUser = localStorage.getItem(this.userLevelsKey);
      if (rawUser) {
        const userLevels: LevelData[] = JSON.parse(rawUser);
        const filtered = userLevels.filter((l) => l.id !== id);
        localStorage.setItem(this.userLevelsKey, JSON.stringify(filtered));
      }

      const rawOnline = localStorage.getItem(this.onlineLevelsKey);
      if (rawOnline) {
        const onlineLevels: LevelData[] = JSON.parse(rawOnline);
        const filtered = onlineLevels.filter((l) => l.id !== id);
        localStorage.setItem(this.onlineLevelsKey, JSON.stringify(filtered));
      }

      return true;
    } catch {
      return false;
    }
  }

  public async incrementPlayCount(levelId: string): Promise<void> {
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
  // LEADERBOARD & SCORES API
  // ==========================================

  public async getLeaderboard(levelId: string): Promise<LeaderboardEntry[]> {
    const raw = localStorage.getItem(this.leaderboardsKey);
    const allLeaderboards: Record<string, LeaderboardEntry[]> = raw
      ? JSON.parse(raw)
      : MOCK_LEADERBOARDS;

    return allLeaderboards[levelId] || allLeaderboards.default || [];
  }

  public async submitScore(
    levelId: string,
    username: string,
    time: number
  ): Promise<{ rank: number; isNewBest: boolean; updatedLeaderboard: LeaderboardEntry[] }> {
    const raw = localStorage.getItem(this.leaderboardsKey);
    const allLeaderboards: Record<string, LeaderboardEntry[]> = raw
      ? JSON.parse(raw)
      : MOCK_LEADERBOARDS;

    const existingList: LeaderboardEntry[] = allLeaderboards[levelId] || [
      ...(allLeaderboards.default || []),
    ];

    const currentEntry = existingList.find((e) => e.username.toLowerCase() === username.toLowerCase());
    const isNewBest = !currentEntry || time < currentEntry.time;

    const filtered = existingList.filter((e) => e.username.toLowerCase() !== username.toLowerCase());
    const bestScoreTime = currentEntry && currentEntry.time < time ? currentEntry.time : time;

    filtered.push({
      rank: 0,
      username,
      time: bestScoreTime,
    });

    // Sort ascending by completion time
    filtered.sort((a, b) => a.time - b.time);
    filtered.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    const finalLeaderboard = filtered.slice(0, 10);
    allLeaderboards[levelId] = finalLeaderboard;
    localStorage.setItem(this.leaderboardsKey, JSON.stringify(allLeaderboards));

    const userEntry = finalLeaderboard.find((e) => e.username.toLowerCase() === username.toLowerCase());
    const rank = userEntry ? userEntry.rank : finalLeaderboard.length + 1;

    return { rank, isNewBest, updatedLeaderboard: finalLeaderboard };
  }

  // ==========================================
  // LOCAL PROGRESS API
  // ==========================================

  public async getProgress(): Promise<Record<string, LocalLevelProgress>> {
    const raw = localStorage.getItem(this.progressKey);
    if (raw) return JSON.parse(raw);

    const initial = {
      '1': { levelNumber: 1, completed: false, rank: null, bestTime: null },
    };
    localStorage.setItem(this.progressKey, JSON.stringify(initial));
    return initial;
  }

  public async saveProgress(progress: Record<string, LocalLevelProgress>): Promise<void> {
    localStorage.setItem(this.progressKey, JSON.stringify(progress));
  }
}

export const dbService = new StandardDatabaseService();
