import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { clearSession, setSession, type SupabaseSession } from '@/lib/server/session';

/** Store the Supabase session in httpOnly cookies after a successful login. */
export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as Partial<SupabaseSession>;
  if (!body.access_token || !body.refresh_token) {
    return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
  }
  const store = await cookies();
  setSession(store, body as SupabaseSession);
  return NextResponse.json({ ok: true });
}

/** Log out — clear cookies. */
export async function DELETE(): Promise<NextResponse> {
  const store = await cookies();
  clearSession(store);
  return NextResponse.json({ ok: true });
}
