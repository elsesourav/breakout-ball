import express from 'express';
import cors from 'cors';
import {
  db,
  userRepository,
  trophyRepository,
  completionRepository,
  couponRepository,
  activityRepository,
  dailyApexRepository
} from './db.mjs';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  ADMIN_EMAILS,
  ADMIN_USERNAMES,
  generateAdminToken,
  verifySupabaseToken,
  fetchElseSouravUserProfile,
  makeAdminUserPayload,
  requireAdminAuth
} from './authHelper.mjs';

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
    const { username, levelId, timeUsed, livesRemaining, score, stars, fullName, avatarUrl } = req.body;
    if (!username || levelId === undefined || timeUsed === undefined) {
      return res.status(400).json({ error: 'Missing username, levelId, or timeUsed' });
    }

    const result = completionRepository.record(username, {
      levelId,
      timeUsed: Number(timeUsed),
      livesRemaining: Number(livesRemaining || 3),
      score: Number(score || 1000),
      stars: Number(stars || 3),
      fullName,
      avatarUrl
    });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/levels/user/:username', (req, res) => {
  try {
    const { username } = req.params;
    const completions = completionRepository.getUserCompletions(username);
    const user = userRepository.get(username);
    res.json({ success: true, username, completions, user: user || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DAILY APEX MISSIONS (SYNCHRONIZED SCHEDULE WITH PRE-PREPARED NEXT DAY)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/daily-apex', (_req, res) => {
  try {
    const mission = dailyApexRepository.getCurrentMission();
    res.json({ success: true, ...mission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/daily-apex/complete', (req, res) => {
  try {
    const { username, levelId } = req.body;
    const mission = dailyApexRepository.getCurrentMission();
    const bonusCores = mission?.today?.bonusCores || 100;
    if (username && username.toLowerCase() !== 'anonymous') {
      userRepository.updateStats(username, { coresDelta: bonusCores });
      activityRepository.log('apex_cleared', username, `Completed Daily Apex: ${mission?.today?.name || levelId} (+${bonusCores} Cores)`);
    }
    res.json({ success: true, bonusCores });
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
// 6. ADMIN AUTHENTICATION & ACCESS CONTROL
// ─────────────────────────────────────────────────────────────────────────────
// 6. ELSESOURAV USER PROFILE & IDENTITY SYNC
app.get('/api/user/profile/:identifier', async (req, res) => {
  try {
    const profile = await fetchElseSouravUserProfile(req.params.identifier);
    if (!profile) return res.status(404).json({ error: 'User profile not found on ElseSourav' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { token, identifier, username, email, password } = req.body;

    // A. Direct Supabase JWT Token Verification
    if (token) {
      const sbUser = await verifySupabaseToken(token);
      if (!sbUser) return res.status(401).json({ success: false, message: 'Invalid or expired Supabase session.' });

      const userEmail = (sbUser.email || '').toLowerCase();
      const meta = sbUser.user_metadata || {};
      const uname = (meta.username || meta.user_name || '').toLowerCase();
      const profile = await fetchElseSouravUserProfile(userEmail || uname);

      const isAdmin = ADMIN_EMAILS.has(userEmail) || ADMIN_USERNAMES.has(uname) || meta.role === 'ADMIN' || sbUser.role === 'ADMIN' || profile?.role === 'ADMIN';

      if (!isAdmin) {
        activityRepository.log('admin_login_denied', userEmail || uname, 'Non-admin user attempted admin access');
        return res.status(403).json({ success: false, message: 'Account is not an authorized administrator.' });
      }

      const adminUser = uname || profile?.username || userEmail || 'elsesourav';
      const { token: sessionToken, expiresAt } = generateAdminToken(adminUser, userEmail);
      activityRepository.log('admin_login_success', adminUser, 'Admin verified via ElseSourav Supabase session');

      return res.json({
        success: true,
        token: sessionToken,
        expiresAt,
        user: makeAdminUserPayload(sbUser.id, adminUser, userEmail, meta, profile),
      });
    }

    // B. ElseSourav Credentials (email or @username + password)
    const rawId = (identifier || username || email || '').trim().replace(/^@/, '');
    if (!rawId || !password) {
      return res.status(400).json({ success: false, message: 'Please provide identifier/email and password.' });
    }

    let targetEmail = rawId;
    let profile = await fetchElseSouravUserProfile(rawId);
    if (profile?.email) {
      targetEmail = profile.email;
    }

    const sbAuthRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, password }),
      signal: AbortSignal.timeout(5000),
    });

    const sbData = await sbAuthRes.json();
    if (!sbAuthRes.ok || !sbData.user) {
      activityRepository.log('admin_login_failed', rawId, 'Invalid credentials against ElseSourav Auth');
      return res.status(401).json({ success: false, message: sbData.error_description || sbData.message || 'Invalid ElseSourav credentials.' });
    }

    const verifiedEmail = (sbData.user.email || targetEmail).toLowerCase();
    const meta = sbData.user.user_metadata || {};
    const verifiedUsername = (meta.username || meta.user_name || profile?.username || rawId).toLowerCase();
    if (!profile) profile = await fetchElseSouravUserProfile(verifiedEmail);

    const isAdmin = ADMIN_EMAILS.has(verifiedEmail) || ADMIN_USERNAMES.has(verifiedUsername) || meta.role === 'ADMIN' || profile?.role === 'ADMIN';

    if (!isAdmin) {
      activityRepository.log('admin_login_denied', verifiedEmail, 'Authenticated user is not an administrator');
      return res.status(403).json({ success: false, message: 'Your ElseSourav account does not have administrator privileges.' });
    }

    const { token: sessionToken, expiresAt } = generateAdminToken(verifiedUsername, verifiedEmail);
    activityRepository.log('admin_login_success', verifiedUsername, 'Master admin authenticated via ElseSourav credentials');

    return res.json({
      success: true,
      token: sessionToken,
      expiresAt,
      user: makeAdminUserPayload(sbData.user.id, verifiedUsername, verifiedEmail, meta, profile),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/verify', requireAdminAuth, (req, res) => {
  res.json({ success: true, valid: true, admin: req.adminUser });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. PROTECTED ADMIN CONTROL & LOGS (Require Verified Admin Token)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/admin/coupons', requireAdminAuth, (_req, res) => {
  try {
    const coupons = couponRepository.getAll();
    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/coupons', requireAdminAuth, (req, res) => {
  try {
    const { code, rewardCores, packCores, maxUses, perUserLimit, isUnlimited, expiresAt } = req.body;
    if (!code || !rewardCores || !packCores) {
      return res.status(400).json({ error: 'Missing code, rewardCores, or packCores' });
    }
    const created = couponRepository.create({
      code,
      rewardCores: Number(rewardCores),
      packCores: Number(packCores),
      maxUses: Number(maxUses || 1000),
      perUserLimit: perUserLimit !== undefined ? Number(perUserLimit) : 1,
      isUnlimited: Boolean(isUnlimited),
      expiresAt: expiresAt || null
    });
    res.json({ success: true, coupon: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/coupons/:code', requireAdminAuth, (req, res) => {
  try {
    const { code } = req.params;
    const result = couponRepository.delete(code);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/coupons/:code/toggle', requireAdminAuth, (req, res) => {
  try {
    const { code } = req.params;
    const { isActive } = req.body;
    const updated = couponRepository.toggle(code, Boolean(isActive));
    res.json({ success: true, coupon: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/logs', requireAdminAuth, (req, res) => {
  try {
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const logs = activityRepository.getRecent(limit);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/dashboard', requireAdminAuth, (_req, res) => {
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
