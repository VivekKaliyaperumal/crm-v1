import { createClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client — used ONLY for the login call (signInWithPassword).
 * We deliberately do NOT persist the session in the browser: after sign-in we
 * hand the tokens to a server route that stores them in httpOnly cookies, so no
 * JWT ever lives in localStorage (org hard rule).
 */
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);
