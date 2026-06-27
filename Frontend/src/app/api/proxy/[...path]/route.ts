import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/server/session';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

/**
 * BFF proxy: forwards /api/proxy/<path> to the NestJS API at <BACKEND_URL>/api/<path>,
 * injecting the user's access token (kept in httpOnly cookies) as a Bearer header.
 * The browser never sees the JWT.
 */
async function handle(req: Request, path: string[]): Promise<NextResponse> {
  const store = await cookies();
  const token = await getValidAccessToken(store);
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const search = new URL(req.url).search;
  const target = `${BACKEND_URL}/api/${path.join('/')}${search}`;

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const contentType = req.headers.get('content-type');
  if (contentType) headers['content-type'] = contentType;

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const res = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? await req.text() : undefined,
    cache: 'no-store',
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: Request, ctx: Ctx) {
  return handle(req, (await ctx.params).path);
}
export async function POST(req: Request, ctx: Ctx) {
  return handle(req, (await ctx.params).path);
}
export async function PATCH(req: Request, ctx: Ctx) {
  return handle(req, (await ctx.params).path);
}
export async function PUT(req: Request, ctx: Ctx) {
  return handle(req, (await ctx.params).path);
}
export async function DELETE(req: Request, ctx: Ctx) {
  return handle(req, (await ctx.params).path);
}
