import crypto from 'crypto';

if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile(); } catch {}
  try { process.loadEnvFile('server/.env'); } catch {}
}

export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://srfevooktrqjzjuddmko.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_h7Di5k8Rn9op1XjDwpnyXQ_4kuXnmNV';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const ADMIN_EMAILS = new Set([
  'elsesourav@gmail.com',
  'admin@elsesourav.com',
  (process.env.ADMIN_EMAIL || '').toLowerCase(),
].filter(Boolean));

export const ADMIN_USERNAMES = new Set([
  'elsesourav',
  (process.env.ADMIN_USERNAME || '').toLowerCase(),
].filter(Boolean));

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'breakout_master_admin_secret_key_9870_vm3';

// In-Memory Active Admin Sessions Store (token -> { username, email, expiresAt })
export const activeAdminSessions = new Map();

export function generateAdminToken(username, email) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', ADMIN_SECRET_KEY).update(`${username}:${email}:${salt}:${Date.now()}`).digest('hex');
  const token = `adm_${hash}`;
  const expiresAt = Date.now() + 7 * 24 * 3600 * 1000; // 7 days valid
  activeAdminSessions.set(token, { username, email, expiresAt });
  return { token, expiresAt };
}

export async function verifySupabaseToken(token) {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchElseSouravUserProfile(identifier) {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase().replace(/^@/, '');
  const isEmail = clean.includes('@');
  const queryParam = isEmail
    ? `email=eq.${encodeURIComponent(clean)}`
    : `username=eq.${encodeURIComponent(clean)}`;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/User?${queryParam}&select=id,email,username,displayName,photoUrl,role`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) return rows[0];
    }
  } catch {}
  return null;
}

export function makeAdminUserPayload(id, username, email, meta, profile) {
  return {
    id,
    username,
    fullName: profile?.fullName || profile?.name || meta?.full_name || meta?.name || 'ElseSourav Admin',
    email,
    avatarUrl: profile?.avatarUrl || profile?.avatar || meta?.avatar_url || meta?.picture || meta?.photoUrl,
    isAdmin: true,
  };
}

export async function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.headers['x-admin-key'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Master Admin authorization required.' });
  }

  // 1. Check in-memory active admin sessions
  const session = activeAdminSessions.get(token);
  if (session && Date.now() <= session.expiresAt) {
    req.adminUser = session.username;
    return next();
  }

  // 2. Check if token is a direct Supabase JWT from ElseSourav Auth
  const sbUser = await verifySupabaseToken(token);
  if (sbUser) {
    const email = (sbUser.email || '').toLowerCase();
    const meta = sbUser.user_metadata || {};
    const uname = (meta.username || meta.user_name || '').toLowerCase();
    const profile = await fetchElseSouravUserProfile(email || uname);

    if (ADMIN_EMAILS.has(email) || ADMIN_USERNAMES.has(uname) || meta.role === 'ADMIN' || sbUser.role === 'ADMIN' || profile?.role === 'ADMIN') {
      const adminName = uname || profile?.username || email || 'elsesourav';
      activeAdminSessions.set(token, { username: adminName, email, expiresAt: Date.now() + 3600 * 1000 });
      req.adminUser = adminName;
      return next();
    }
  }

  return res.status(403).json({ error: 'Forbidden: Invalid or unauthorized admin credentials.' });
}
