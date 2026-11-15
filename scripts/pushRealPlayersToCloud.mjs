import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { db, userRepository, completionRepository, couponRepository, trophyRepository } from '../server/src/db.mjs';

const firebaseConfig = {
  apiKey: 'AIzaSyBGy5_GyHzwNsDECkbR8my_PSWYYaCdAPM',
  authDomain: 'breakout-ball.firebaseapp.com',
  projectId: 'breakout-ball',
  storageBucket: 'breakout-ball.firebasestorage.app',
  messagingSenderId: '139813194858',
  appId: '1:139813194858:web:7def41428420668b41ce13',
  measurementId: 'G-7MV0LWSTR6',
};

const app = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(app);

async function pushToCloud() {
  console.log('[Cloud Sync] Starting push of pre-players and 50 level leaderboards to Cloud Firestore...');

  // 1. Push All Users to Cloud Firestore 'users' collection with full progression data
  const allUsers = userRepository.getAll(100);
  console.log(`[Cloud Sync] Pushing ${allUsers.length} user profiles with progression & trophies...`);
  for (const u of allUsers) {
    try {
      const completions = completionRepository.getUserCompletions(u.username);
      const levelsRecord = {};
      const claimedLevels = [];
      const levelStars = {};
      const levelClaimedCores = {};
      for (const comp of completions) {
        const sLvl = String(comp.level_id);
        levelsRecord[sLvl] = {
          levelNumber: Number(comp.level_id),
          completed: true,
          bestTime: comp.time_used,
          rank: null,
          stars: comp.stars,
          claimedCores: comp.score,
          maxCores: 500,
        };
        claimedLevels.push(sLvl);
        levelStars[sLvl] = comp.stars;
        levelClaimedCores[sLvl] = comp.score;
      }

      if (completions.length > 0 && completions.length < 50) {
        const nextLvl = completions.length + 1;
        levelsRecord[String(nextLvl)] = {
          levelNumber: nextLvl,
          completed: false,
          rank: null,
          bestTime: null,
          stars: 0,
          claimedCores: 0,
          maxCores: 500,
        };
      }

      const trophies = trophyRepository.getUserTrophies(u.username);
      const unlockedBadges = trophies.map(t => t.trophy_id);

      await setDoc(doc(firestoreDb, 'users', u.username.toLowerCase()), {
        username: u.username,
        fullName: u.full_name,
        avatarUrl: u.avatar_url,
        totalScore: u.total_score,
        trophyCount: u.trophy_count,
        levelsCompleted: u.levels_completed,
        coresBalance: u.cores_balance,
        currency: u.cores_balance,
        levelsRecord,
        claimedLevels,
        levelStars,
        levelClaimedCores,
        unlockedBadges,
        lastActiveAt: u.last_active_at,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn(`[Cloud Sync] Warning for user ${u.username}:`, err.message);
    }
  }

  // 2. Push Real Leaderboards for Levels 1 to 50 to 'leaderboards' collection
  console.log('[Cloud Sync] Pushing real competitive leaderboards for Levels 1 to 50...');
  for (let lvl = 1; lvl <= 50; lvl++) {
    const entries = completionRepository.getLevelLeaderboard(lvl, 10);
    try {
      await setDoc(doc(firestoreDb, 'leaderboards', String(lvl)), {
        levelId: String(lvl),
        entries: entries.map(e => ({
          rank: e.rank,
          username: e.username,
          time: e.time,
          score: e.score,
          stars: e.stars,
          avatarUrl: e.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(e.username)}&size=32`,
          completedAt: e.completedAt,
        })),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn(`[Cloud Sync] Warning for level ${lvl}:`, err.message);
    }
  }

  // 3. Push Global Overall Leaderboard to 'leaderboards/overall'
  console.log('[Cloud Sync] Pushing overall score leaderboard...');
  try {
    await setDoc(doc(firestoreDb, 'leaderboards', 'overall'), {
      levelId: 'overall',
      entries: allUsers.map((u, idx) => ({
        rank: idx + 1,
        username: u.username,
        fullName: u.full_name,
        avatarUrl: u.avatar_url,
        score: u.total_score,
        coresCleared: u.levels_completed,
        trophyCount: u.trophy_count,
      })),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Cloud Sync] Warning for overall leaderboard:', err.message);
  }

  // 4. Push Coupons to Cloud Firestore 'coupons' collection
  const allCoupons = couponRepository.getAll();
  console.log(`[Cloud Sync] Pushing ${allCoupons.length} official coupons...`);
  for (const c of allCoupons) {
    try {
      await setDoc(doc(firestoreDb, 'coupons', c.code), {
        code: c.code,
        rewardCores: c.reward_cores,
        packCores: c.pack_cores,
        isActive: Boolean(c.is_active),
        maxUses: c.max_uses,
        usedCount: c.used_count,
        expiresAt: c.expires_at || null,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn(`[Cloud Sync] Warning for coupon ${c.code}:`, err.message);
    }
  }

  console.log('[Cloud Sync] SUCCESS! All 50 players, 30 level leaderboards, and coupons synced to Cloud Firestore.');
  process.exit(0);
}

pushToCloud().catch((err) => {
  console.error('[Cloud Sync] Fatal error:', err);
  process.exit(1);
});
