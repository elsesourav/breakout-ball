import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.resolve(__dirname, '../data');
const DB_PATH = path.join(DB_DIR, 'breakout.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

// Initialize relational tables
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    trophy_count INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    cores_balance INTEGER DEFAULT 0,
    levels_completed INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    last_active_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_trophies (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    username TEXT NOT NULL,
    trophy_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    unlocked_at TEXT NOT NULL,
    UNIQUE(username, trophy_id)
  );

  CREATE TABLE IF NOT EXISTS level_completions (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    level_id TEXT NOT NULL,
    time_used REAL NOT NULL,
    lives_remaining INTEGER NOT NULL,
    score INTEGER NOT NULL,
    stars INTEGER NOT NULL,
    completed_at TEXT NOT NULL,
    UNIQUE(username, level_id)
  );

  CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    reward_cores INTEGER NOT NULL,
    pack_cores INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    max_uses INTEGER DEFAULT 1000,
    used_count INTEGER DEFAULT 0,
    expires_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id TEXT PRIMARY KEY,
    coupon_code TEXT NOT NULL,
    username TEXT NOT NULL,
    cores_granted INTEGER NOT NULL,
    ip_address TEXT,
    redeemed_at TEXT NOT NULL,
    UNIQUE(coupon_code, username)
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    username TEXT,
    message TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_completions_level ON level_completions(level_id, time_used ASC);
  CREATE INDEX IF NOT EXISTS idx_trophies_user ON user_trophies(username);
  CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);
`);

// ─────────────────────────────────────────────────────────────────────────────
// REPOSITORY METHODS
// ─────────────────────────────────────────────────────────────────────────────

export const userRepository = {
  get(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)');
    return stmt.get(username);
  },

  getAll(limit = 100) {
    const stmt = db.prepare('SELECT * FROM users ORDER BY total_score DESC LIMIT ?');
    return stmt.all(limit);
  },

  upsert(user) {
    const now = new Date().toISOString();
    const existing = this.get(user.username);
    if (existing) {
      const stmt = db.prepare(`
        UPDATE users 
        SET full_name = COALESCE(?, full_name),
            email = COALESCE(?, email),
            avatar_url = COALESCE(?, avatar_url),
            last_active_at = ?
        WHERE id = ?
      `);
      stmt.run(user.fullName || null, user.email || null, user.avatarUrl || null, now, existing.id);
      return this.get(user.username);
    }

    const id = user.id || `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, full_name, avatar_url, trophy_count, total_score, cores_balance, levels_completed, created_at, last_active_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      user.username,
      user.email || null,
      user.fullName || user.username,
      user.avatarUrl || null,
      user.trophyCount || 0,
      user.totalScore || 0,
      user.coresBalance || 0,
      user.levelsCompleted || 0,
      now,
      now
    );
    return this.get(user.username);
  },

  updateStats(username, { scoreDelta = 0, coresDelta = 0, newTrophy = false, levelCompleted = false }) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE users 
      SET total_score = total_score + ?,
          cores_balance = cores_balance + ?,
          trophy_count = trophy_count + ?,
          levels_completed = levels_completed + ?,
          last_active_at = ?
      WHERE LOWER(username) = LOWER(?)
    `);
    stmt.run(scoreDelta, coresDelta, newTrophy ? 1 : 0, levelCompleted ? 1 : 0, now, username);
  }
};

export const trophyRepository = {
  getUserTrophies(username) {
    const stmt = db.prepare('SELECT * FROM user_trophies WHERE LOWER(username) = LOWER(?) ORDER BY unlocked_at DESC');
    return stmt.all(username);
  },

  unlock(username, { trophyId, title, description, category }) {
    userRepository.upsert({ username });
    const checkStmt = db.prepare('SELECT id FROM user_trophies WHERE LOWER(username) = LOWER(?) AND trophy_id = ?');
    const existing = checkStmt.get(username, trophyId);
    if (existing) return { alreadyUnlocked: true, id: existing.id };

    const now = new Date().toISOString();
    const id = `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const insertStmt = db.prepare(`
      INSERT INTO user_trophies (id, user_id, username, trophy_id, title, description, category, unlocked_at)
      VALUES (?, (SELECT id FROM users WHERE LOWER(username) = LOWER(?)), ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(id, username, username, trophyId, title, description || '', category || 'combat', now);

    userRepository.updateStats(username, { newTrophy: true });
    activityRepository.log('trophy_earned', username, `Unlocked trophy: "${title}"`, { trophyId, category });
    return { alreadyUnlocked: false, id, title, trophyId, unlockedAt: now };
  }
};

export const completionRepository = {
  record(username, { levelId, timeUsed, livesRemaining, score, stars }) {
    userRepository.upsert({ username });
    const now = new Date().toISOString();
    const checkStmt = db.prepare('SELECT id, time_used, score FROM level_completions WHERE LOWER(username) = LOWER(?) AND level_id = ?');
    const existing = checkStmt.get(username, String(levelId));

    if (existing) {
      // Update if new score or time is better
      const isBetter = timeUsed < existing.time_used || score > existing.score;
      if (isBetter) {
        const updateStmt = db.prepare(`
          UPDATE level_completions
          SET time_used = MIN(time_used, ?),
              score = MAX(score, ?),
              lives_remaining = MAX(lives_remaining, ?),
              stars = MAX(stars, ?),
              completed_at = ?
          WHERE id = ?
        `);
        updateStmt.run(timeUsed, score, livesRemaining, stars, now, existing.id);
      }
      return { isFirstClear: false, timeUsed, score };
    }

    const id = `lc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const insertStmt = db.prepare(`
      INSERT INTO level_completions (id, username, level_id, time_used, lives_remaining, score, stars, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(id, username, String(levelId), timeUsed, livesRemaining, score, stars, now);

    userRepository.updateStats(username, { scoreDelta: score, levelCompleted: true });
    activityRepository.log('level_completed', username, `Conquered Level ${levelId} in ${timeUsed.toFixed(1)}s (${stars}⭐)`, {
      levelId,
      timeUsed,
      score,
      stars
    });
    return { isFirstClear: true, timeUsed, score };
  },

  getLevelLeaderboard(levelId, limit = 20) {
    const stmt = db.prepare(`
      SELECT 
        ROW_NUMBER() OVER(ORDER BY time_used ASC, score DESC) as rank,
        lc.username,
        lc.time_used as time,
        lc.score,
        lc.stars,
        lc.completed_at as completedAt,
        u.avatar_url as avatarUrl
      FROM level_completions lc
      LEFT JOIN users u ON LOWER(u.username) = LOWER(lc.username)
      WHERE lc.level_id = ?
      ORDER BY lc.time_used ASC, lc.score DESC
      LIMIT ?
    `);
    return stmt.all(String(levelId), limit);
  },

  getUserCompletions(username) {
    const stmt = db.prepare(`
      SELECT level_id, time_used, lives_remaining, score, stars, completed_at
      FROM level_completions
      WHERE LOWER(username) = LOWER(?)
      ORDER BY CAST(level_id AS INTEGER) ASC
    `);
    return stmt.all(username);
  }
};

export const couponRepository = {
  getAll() {
    const stmt = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC');
    return stmt.all();
  },

  get(code) {
    const stmt = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = UPPER(?)');
    return stmt.get(code);
  },

  create({ code, rewardCores, packCores, maxUses = 1000, expiresAt = null }) {
    const upperCode = code.trim().toUpperCase();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO coupons (code, reward_cores, pack_cores, is_active, max_uses, used_count, expires_at, created_at)
      VALUES (?, ?, ?, 1, ?, 0, ?, ?)
      ON CONFLICT(code) DO UPDATE SET
        reward_cores = excluded.reward_cores,
        pack_cores = excluded.pack_cores,
        is_active = 1,
        max_uses = excluded.max_uses
    `);
    stmt.run(upperCode, rewardCores, packCores, maxUses, expiresAt, now);
    activityRepository.log('coupon_created', 'admin', `Created coupon ${upperCode} (+${rewardCores} Cores for ${packCores} pack)`);
    return this.get(upperCode);
  },

  toggle(code, isActive) {
    const stmt = db.prepare('UPDATE coupons SET is_active = ? WHERE UPPER(code) = UPPER(?)');
    stmt.run(isActive ? 1 : 0, code);
    return this.get(code);
  },

  delete(code) {
    const stmt = db.prepare('DELETE FROM coupons WHERE UPPER(code) = UPPER(?)');
    stmt.run(code);
    activityRepository.log('coupon_deleted', 'admin', `Deleted coupon ${code.toUpperCase()}`);
    return { success: true };
  },

  redeem(code, username, expectedPackCores, ipAddress = '') {
    const upperCode = code.trim().toUpperCase();
    const coupon = this.get(upperCode);

    if (!coupon) return { success: false, message: 'Invalid coupon code.' };
    if (!coupon.is_active) return { success: false, message: 'Coupon has expired or is inactive.' };
    if (coupon.used_count >= coupon.max_uses) return { success: false, message: 'Coupon redemption limit reached.' };
    if (coupon.pack_cores && expectedPackCores && coupon.pack_cores !== expectedPackCores) {
      return { success: false, message: `This coupon is calibrated for ${coupon.pack_cores} Cores packs.` };
    }

    // Single-use check per user
    const checkStmt = db.prepare('SELECT id FROM coupon_redemptions WHERE coupon_code = ? AND LOWER(username) = LOWER(?)');
    const existing = checkStmt.get(upperCode, username);
    if (existing) return { success: false, message: 'Coupon already redeemed on this account.' };

    const now = new Date().toISOString();
    const id = `rd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Atomically insert redemption and increment coupon count
    db.prepare(`
      INSERT INTO coupon_redemptions (id, coupon_code, username, cores_granted, ip_address, redeemed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, upperCode, username, coupon.reward_cores, ipAddress, now);

    db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?').run(upperCode);

    // Update user balance
    userRepository.upsert({ username });
    userRepository.updateStats(username, { coresDelta: coupon.reward_cores });

    activityRepository.log('coupon_redeemed', username, `Redeemed ${upperCode} for +${coupon.reward_cores} Cores`, {
      code: upperCode,
      rewardCores: coupon.reward_cores
    });

    return {
      success: true,
      coresGranted: coupon.reward_cores,
      message: `Coupon Claimed! +${coupon.reward_cores} Cores`
    };
  }
};

export const activityRepository = {
  log(type, username, message, metadata = null, timestamp = null) {
    const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = timestamp || new Date().toISOString();
    const metaStr = metadata ? JSON.stringify(metadata) : null;
    const stmt = db.prepare(`
      INSERT INTO activity_logs (id, type, username, message, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, type, username || 'system', message, metaStr, now);
  },

  getRecent(limit = 50) {
    const stmt = db.prepare('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?');
    return stmt.all(limit).map(r => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata) : null
    }));
  }
};
