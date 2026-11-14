import { createClient } from '@supabase/supabase-js';

/**
 * Official ElseSourav Platform Identity Client
 * Connects to the unified ElseSourav authentication and user ecosystem.
 */
export const ELSESOURAV_SUPABASE_URL = 'https://srfevooktrqjzjuddmko.supabase.co';
export const ELSESOURAV_SUPABASE_ANON_KEY =
  'sb_publishable_h7Di5k8Rn9op1XjDwpnyXQ_4kuXnmNV';

export const supabase = createClient(
  ELSESOURAV_SUPABASE_URL,
  ELSESOURAV_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'elsesourav_auth_token',
    },
  }
);
