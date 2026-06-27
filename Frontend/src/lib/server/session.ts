import 'server-only';
import type { cookies } from 'next/headers';

type CookieStore = Awaited<ReturnType<typeof cookies>>;

const ACCESS = 'sb-access-token';
const REFRESH = 'sb-refresh-token';
const EXPIRES = 'sb-expires-at';

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number; // unix seconds
  expires_in?: number;
}

export function setSession(store: CookieStore, session: SupabaseSession): void {
  const expiresAt =
    session.expires_at ?? Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600);
  store.set(ACCESS, session.access_token, baseCookie);
  store.set(REFRESH, session.refresh_token, baseCookie);
  store.set(EXPIRES, String(expiresAt), baseCookie);
}

export function clearSession(store: CookieStore): void {
  for (const name of [ACCESS, REFRESH, EXPIRES]) {
    store.set(name, '', { ...baseCookie, maxAge: 0 });
  }
}

/**
 * Returns a valid access token, refreshing via Supabase if the current one has
 * expired. Returns null if there is no session / refresh fails.
 */
export async function getValidAccessToken(store: CookieStore): Promise<string | null> {
  const access = store.get(ACCESS)?.value;
  const refresh = store.get(REFRESH)?.value;
  if (!access || !refresh) return null;

  const expiresAt = Number(store.get(EXPIRES)?.value ?? 0);
  const now = Math.floor(Date.now() / 1000);
  if (expiresAt - 60 > now) return access; // still valid (60s safety buffer)

  // Refresh.
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    {
      method: 'POST',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: 'no-store',
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as SupabaseSession;
  if (!data.access_token) return null;
  setSession(store, data);
  return data.access_token;
}
