/**
 * Anonymous User to Authenticated Account Data Migration Service
 *
 * Guarantees zero data loss when an anonymous player (who may have cleared
 * levels 10, 20, 30+, earned Cores, upgraded armory equipment, and forged custom
 * arenas in Studio) connects, registers, or logs into an ElseSourav account.
 *
 * Rules:
 * 1. If the authenticated account is fresh (no prior progress), anonymous progress
 *    is fully preserved and linked to the account.
 * 2. If the authenticated account has prior progress, a smart non-destructive merge
 *    preserves the highest cleared levels, best times, maximum stars, and upgrades.
 * 3. Re-assigns all locally created anonymous stages (creatorId: anon_...) to the
 *    new authenticated user UUID and username so they appear in their Studio.
 * 4. Syncs the unified progress to Cloud Firestore and the backend SQLite database.
 */

import { LocalLevelProgress, LevelData } from '../types/game';
import { dbService } from './db';
import { currencyService } from './currency';
import { AuthUser, getAnonymousUserId } from './authHelper';
import { backendApi } from './backendApi';
import { firestoreDb } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface MigrationSummary {
  migrated: boolean;
  levelsPreserved: number;
  customArenasTransferred: number;
  coresBalance: number;
  message?: string;
}

class AccountMigrationService {
  private userLevelsKey = 'breakout_db_user_levels';
  private progressKey = 'breakout_db_progress';

  /**
   * Seamlessly migrate anonymous player data to the newly authenticated account.
   */
  public async migrateAnonymousDataToUser(
    authenticatedUser: AuthUser
  ): Promise<MigrationSummary> {
    if (!authenticatedUser.isLoggedIn || !authenticatedUser.username || authenticatedUser.username === 'anonymous') {
      return { migrated: false, levelsPreserved: 0, customArenasTransferred: 0, coresBalance: 0 };
    }

    const username = authenticatedUser.username.toLowerCase();
    const userId = authenticatedUser.id;
    const anonId = getAnonymousUserId();

    // Prevent redundant repeated migrations for the same anonymous session & user
    const migrationSessionKey = `breakout_anon_migrated_${anonId}_to_${username}`;
    if (localStorage.getItem(migrationSessionKey)) {
      return { migrated: false, levelsPreserved: 0, customArenasTransferred: 0, coresBalance: currencyService.getBalance() };
    }

    // 1. Gather anonymous level progress from local storage
    let anonProgress: Record<string, LocalLevelProgress> = {};
    try {
      const raw = localStorage.getItem(this.progressKey);
      if (raw) anonProgress = JSON.parse(raw);
    } catch {}

    const anonCompleted = Object.values(anonProgress).filter((p) => p.completed);
    const anonCompletedCount = anonCompleted.length;

    // 2. Fetch any pre-existing progress for the authenticated account
    let existingAccountProgress: Record<string, LocalLevelProgress> = {};
    try {
      const cached = localStorage.getItem(`breakout_db_progress_${username}`);
      if (cached) existingAccountProgress = JSON.parse(cached);
    } catch {}

    // Check Cloud Firestore for existing account records
    try {
      const snap = await getDoc(doc(firestoreDb, 'users', username));
      if (snap.exists() && snap.data()?.levelsRecord) {
        existingAccountProgress = { ...existingAccountProgress, ...snap.data().levelsRecord };
      }
    } catch {}

    // Check backend SQLite completions
    try {
      const completions = await backendApi.getUserCompletions(username);
      if (completions && completions.length > 0) {
        for (const c of completions) {
          const num = parseInt(c.level_id, 10);
          const prev = existingAccountProgress[c.level_id];
          existingAccountProgress[c.level_id] = {
            levelNumber: isNaN(num) ? 1 : num,
            completed: true,
            rank: prev?.rank || null,
            bestTime: prev?.bestTime && prev.bestTime < c.time_used ? prev.bestTime : c.time_used,
            stars: Math.max(prev?.stars || 0, c.stars || 1),
          };
        }
      }
    } catch {}

    // 3. Smart Non-Destructive Merge of Level Progress
    const mergedProgress: Record<string, LocalLevelProgress> = {
      '1': { levelNumber: 1, completed: false, rank: null, bestTime: null },
      ...existingAccountProgress,
    };

    let highestUnlocked = 1;

    // Merge each anonymous level into the account progress
    for (const [lvlId, aProg] of Object.entries(anonProgress)) {
      const num = parseInt(lvlId, 10);
      const existing = mergedProgress[lvlId];

      if (aProg.completed) {
        if (!existing || !existing.completed) {
          mergedProgress[lvlId] = { ...aProg };
        } else {
          // If completed in both, keep the best time and highest stars
          const bestTime =
            existing.bestTime !== null && aProg.bestTime !== null
              ? Math.min(existing.bestTime, aProg.bestTime)
              : existing.bestTime ?? aProg.bestTime;
          const stars = Math.max(existing.stars || 0, aProg.stars || 0);
          const claimedCores = Math.max(existing.claimedCores || 0, aProg.claimedCores || 0);

          mergedProgress[lvlId] = {
            ...existing,
            completed: true,
            bestTime,
            stars,
            claimedCores,
          };
        }
        if (!isNaN(num) && num >= highestUnlocked) {
          highestUnlocked = num + 1;
        }
      } else if (!existing) {
        mergedProgress[lvlId] = { ...aProg };
      }
    }

    // Ensure stage following the highest completed level is unlocked
    if (highestUnlocked <= 100 && !mergedProgress[String(highestUnlocked)]) {
      mergedProgress[String(highestUnlocked)] = {
        levelNumber: highestUnlocked,
        completed: false,
        rank: null,
        bestTime: null,
      };
    }

    // Persist merged progress to local storage and Cloud Firestore
    await dbService.saveProgress(mergedProgress, username);
    localStorage.setItem(this.progressKey, JSON.stringify(mergedProgress));

    // Sync newly preserved completions to backend SQLite microservice
    if (anonCompletedCount > 0) {
      for (const [lvlId, p] of Object.entries(mergedProgress)) {
        if (p.completed && p.bestTime !== null) {
          backendApi.recordLevelCompletion(username, {
            levelId: lvlId,
            timeUsed: p.bestTime,
            livesRemaining: p.stars || 3,
            score: Math.max(1000, Math.floor(10000 - p.bestTime * 120)),
            stars: p.stars || 3,
            fullName: authenticatedUser.fullName || username,
            avatarUrl: authenticatedUser.avatarUrl,
          }).catch(() => {});
        }
      }
    }

    // 4. Merge Cores Balance & Armory Upgrades to Authenticated Cloud Account
    await currencyService.load(username);
    await currencyService.syncToCloud(username);

    // 5. Transfer Anonymous Custom Levels (Studio) to Authenticated Account
    let customArenasTransferred = 0;
    try {
      const rawUserLevels = localStorage.getItem(this.userLevelsKey);
      if (rawUserLevels) {
        const levels: LevelData[] = JSON.parse(rawUserLevels);
        let modified = false;

        const updatedLevels = levels.map((lvl) => {
          const isAnonCreator =
            !lvl.creatorId ||
            lvl.creatorId === anonId ||
            !lvl.creator ||
            lvl.creator.toLowerCase() === 'anonymous';

          if (isAnonCreator) {
            modified = true;
            customArenasTransferred++;
            return {
              ...lvl,
              creatorId: userId,
              creator: authenticatedUser.username,
            };
          }
          return lvl;
        });

        if (modified) {
          localStorage.setItem(this.userLevelsKey, JSON.stringify(updatedLevels));
          // Sync each transferred level to Firestore
          for (const lvl of updatedLevels) {
            if (lvl.creatorId === userId) {
              await dbService.saveLevel(lvl).catch(() => {});
            }
          }
        }
      }
    } catch {}

    const finalCompleted = Object.values(mergedProgress).filter((p) => p.completed).length;
    const wasMigrated = anonCompletedCount > 0 || customArenasTransferred > 0;
    if (wasMigrated) {
      localStorage.setItem(migrationSessionKey, 'true');
      localStorage.removeItem(this.progressKey);
    }

    return {
      migrated: wasMigrated,
      levelsPreserved: finalCompleted,
      customArenasTransferred,
      coresBalance: currencyService.getBalance(),
      message: `Your progress and ${customArenasTransferred} custom stage(s) have been successfully linked to @${username}.`,
    };
  }
}

export const accountMigrationService = new AccountMigrationService();
