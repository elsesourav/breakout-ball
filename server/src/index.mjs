import express from 'express';
import cors from 'cors';
import {
  db,
  userRepository,
  trophyRepository,
  completionRepository,
  couponRepository,
  activityRepository
} from './db.mjs';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// 1. HEALTH & METRICS
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const usersCount = db.prepare('SELECT count(*) as c FROM users').get().c;
  const completionsCount = db.prepare('SELECT count(*) as c FROM level_completions').get().c;
  const trophiesCount = db.prepare('SELECT count(*) as c FROM user_trophies').get().c;
  const couponsCount = db.prepare('SELECT count(*) as c FROM coupons').get().c;

  res.json({
    status: 'online',
    service: 'breakout-backend',
    version: '1.0.0',
    uptime: Math.round(process.uptime()),
    database: {
      type: 'sqlite',
      usersCount,
      completionsCount,
      trophiesCount,
      couponsCount
    },
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. TROPHIES & ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/trophies/unlock', (req, res) => {
  try {
    const { username, trophyId, title, description, category } = req.body;
    if (!username || !trophyId || !title) {
      return res.status(400).json({ error: 'Missing username, trophyId, or title' });
    }

    const result = trophyRepository.unlock(username, {
      trophyId,
      title,
      description,
      category
    });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/trophies/user/:username', (req, res) => {
  try {
    const { username } = req.params;
    const trophies = trophyRepository.getUserTrophies(username);
    const user = userRepository.get(username);
    res.json({
      username,
      totalTrophies: trophies.length,
      trophies,
      user: user || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. LEVEL COMPLETIONS & PROGRESS
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/levels/complete', (req, res) => {
  try {
    const { username, levelId, timeUsed, livesRemaining, score, stars } = req.body;
    if (!username || levelId === undefined || timeUsed === undefined) {
      return res.status(400).json({ error: 'Missing username, levelId, or timeUsed' });
    }

    const result = completionRepository.record(username, {
      levelId,
      timeUsed: Number(timeUsed),
      livesRemaining: Number(livesRemaining || 3),
      score: Number(score || 1000),
      stars: Number(stars || 3)
    });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. LEADERBOARDS (REAL DATA FROM DATABASE)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/leaderboard/level/:id', (req, res) => {
  try {
    const levelId = req.params.id;
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const entries = completionRepository.getLevelLeaderboard(levelId, limit);
    res.json({ levelId, count: entries.length, entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/leaderboard/global', (req, res) => {
  try {
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const users = userRepository.getAll(limit);
    const entries = users.map((u, idx) => ({
      rank: idx + 1,
      username: u.username,
      fullName: u.full_name,
      avatarUrl: u.avatar_url,
      totalScore: u.total_score,
      trophyCount: u.trophy_count,
      levelsCompleted: u.levels_completed,
      coresBalance: u.cores_balance,
      lastActiveAt: u.last_active_at
    }));
    res.json({ count: entries.length, entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/leaderboard/weekly', (req, res) => {
  try {
    // Weekly rankings based on recent completions
    const stmt = db.prepare(`
      SELECT 
        u.username,
        u.full_name as fullName,
        u.avatar_url as avatarUrl,
        SUM(lc.score) as weeklyScore,
        COUNT(lc.id) as weeklyCleared
      FROM level_completions lc
      JOIN users u ON LOWER(u.username) = LOWER(lc.username)
      WHERE lc.completed_at >= datetime('now', '-7 days')
      GROUP BY u.username
      ORDER BY weeklyScore DESC
      LIMIT 50
    `);
    const rows = stmt.all();
    const entries = rows.map((r, idx) => ({
      rank: idx + 1,
      username: r.username,
      fullName: r.fullName,
      avatarUrl: r.avatarUrl,
      score: r.weeklyScore,
      coresCleared: r.weeklyCleared,
      badgeTitle: idx === 0 ? 'Weekly Champion' : (idx < 5 ? 'Weekly Ace' : 'Weekly Challenger')
    }));
    res.json({ count: entries.length, entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. COUPON ENGINE (VALIDATION & REDEMPTION)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/coupons/validate', (req, res) => {
  try {
    const { code, expectedPackCores, username } = req.body;
    if (!code) return res.status(400).json({ valid: false, message: 'Please enter a coupon code.' });

    const coupon = couponRepository.get(code);
    if (!coupon) return res.json({ valid: false, message: 'Invalid coupon code.' });
    if (!coupon.is_active) return res.json({ valid: false, message: 'Coupon is inactive or expired.' });
    if (coupon.used_count >= coupon.max_uses) return res.json({ valid: false, message: 'Coupon limit reached.' });
    if (coupon.pack_cores && expectedPackCores && coupon.pack_cores !== expectedPackCores) {
      return res.json({ valid: false, message: `Coupon is valid for ${coupon.pack_cores} Cores pack only.` });
    }

    if (username) {
      const checkStmt = db.prepare('SELECT id FROM coupon_redemptions WHERE coupon_code = ? AND LOWER(username) = LOWER(?)');
      if (checkStmt.get(coupon.code, username)) {
        return res.json({ valid: false, message: 'Coupon already redeemed by your account.' });
      }
    }

    res.json({
      valid: true,
      rewardCores: coupon.reward_cores,
      packCores: coupon.pack_cores,
      message: `Valid coupon for +${coupon.reward_cores.toLocaleString()} Cores!`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons/redeem', (req, res) => {
  try {
    const { code, username, expectedPackCores } = req.body;
    if (!code || !username) {
      return res.status(400).json({ success: false, message: 'Missing code or username.' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const result = couponRepository.redeem(code, username, expectedPackCores, String(ip));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. ADMIN CONTROL & LOGS
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/admin/coupons', (_req, res) => {
  try {
    const coupons = couponRepository.getAll();
    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/coupons', (req, res) => {
  try {
    const { code, rewardCores, packCores, maxUses, expiresAt } = req.body;
    if (!code || !rewardCores || !packCores) {
      return res.status(400).json({ error: 'Missing code, rewardCores, or packCores' });
    }
    const created = couponRepository.create({
      code,
      rewardCores: Number(rewardCores),
      packCores: Number(packCores),
      maxUses: Number(maxUses || 1000),
      expiresAt: expiresAt || null
    });
    res.json({ success: true, coupon: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/coupons/:code', (req, res) => {
  try {
    const { code } = req.params;
    const result = couponRepository.delete(code);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/coupons/:code/toggle', (req, res) => {
  try {
    const { code } = req.params;
    const { isActive } = req.body;
    const updated = couponRepository.toggle(code, Boolean(isActive));
    res.json({ success: true, coupon: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/logs', (req, res) => {
  try {
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const logs = activityRepository.getRecent(limit);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/dashboard', (_req, res) => {
  try {
    const totalUsers = db.prepare('SELECT count(*) as c FROM users').get().c;
    const totalCompletions = db.prepare('SELECT count(*) as c FROM level_completions').get().c;
    const totalTrophies = db.prepare('SELECT count(*) as c FROM user_trophies').get().c;
    const totalCoupons = db.prepare('SELECT count(*) as c FROM coupons').get().c;
    const totalRedemptions = db.prepare('SELECT count(*) as c, COALESCE(SUM(cores_granted), 0) as s FROM coupon_redemptions').get();

    res.json({
      metrics: {
        totalUsers,
        totalCompletions,
        totalTrophies,
        totalCoupons,
        totalRedemptions: totalRedemptions.c,
        totalCoresDistributed: totalRedemptions.s
      },
      recentLogs: activityRepository.getRecent(10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Breakout Backend] Cyber Service online on http://0.0.0.0:${PORT}`);
});
