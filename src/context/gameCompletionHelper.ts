import { LevelData } from '../types/game';
import { dbService } from '../services/db';
import { currencyService } from '../services/currency';
import { achievementManager } from '../services/achievements';
import { isTodayDailyMission, recordDailyMissionCompletion } from '../services/dailyApex';

export interface CompletionOutcome {
  rank: number;
  isNewBest: boolean;
  coresEarned: number;
  isFirstClear: boolean;
  starsEarned: number;
  previousStars: number;
  newBestStars: number;
  totalClaimedForLevel: number;
  maxCoresForLevel: number;
  remainingCoresForLevel: number;
}

export async function processLevelCompletion(
  levelId: string,
  time: number,
  livesRemaining: number = 3,
  username: string,
  onlineLevels: LevelData[],
  isRestricted: boolean,
  setLeaderboardForLevel: (levelId: string, board: any[]) => void
): Promise<CompletionOutcome> {
  let rank = 1;
  let isNewBest = false;
  let coresEarned = 0;
  let isFirstClear = false;
  let starsEarned = Math.min(3, Math.max(1, livesRemaining));
  let previousStars = 0;
  let newBestStars = starsEarned;
  let totalClaimedForLevel = 0;
  let maxCoresForLevel = 0;
  let remainingCoresForLevel = 0;

  if (!isRestricted) {
    const result = await dbService.submitScore(levelId, username, time, livesRemaining);
    rank = result.rank;
    isNewBest = result.isNewBest;
    setLeaderboardForLevel(levelId, result.updatedLeaderboard);

    if (time < 30) {
      achievementManager.unlock('speed_demon');
    }

    const levelNum = parseInt(levelId, 10);
    if (!isNaN(levelNum)) {
      const starReward = currencyService.earnLevelRewardWithStars(
        levelId,
        levelNum,
        livesRemaining,
        username
      );
      coresEarned = starReward.coresEarned;
      starsEarned = starReward.starsEarned;
      previousStars = starReward.previousStars;
      newBestStars = starReward.newBestStars;
      totalClaimedForLevel = starReward.totalClaimedForLevel;
      maxCoresForLevel = starReward.maxCoresForLevel;
      remainingCoresForLevel = starReward.remainingCoresForLevel;
      isFirstClear = starReward.isFirstClear;
    } else {
      coresEarned = currencyService.earnArenaReward(levelId, 1.0, username);
      isFirstClear = coresEarned > 0;
    }

    if (isTodayDailyMission(levelId, onlineLevels)) {
      const dailyResult = recordDailyMissionCompletion(levelId, onlineLevels, username);
      if (dailyResult.success) {
        coresEarned += dailyResult.bonusCores;
      }
    }
  }

  return {
    rank,
    isNewBest,
    coresEarned,
    isFirstClear,
    starsEarned,
    previousStars,
    newBestStars,
    totalClaimedForLevel,
    maxCoresForLevel,
    remainingCoresForLevel,
  };
}
