'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes, Mail, Lock, Eye, EyeOff, Users, Target, ClipboardCheck, Loader2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { APP_NAME } from '@/lib/app-config';
import { Button } from '@/components/ui/button';

const HIGHLIGHTS = [
  { icon: Users, title: 'Capture every lead', text: 'New enquiries land in one place — never lost in a spreadsheet.' },
  { icon: Target, title: 'Move deals forward', text: 'Track each opportunity through your pipeline, stage by stage.' },
  { icon: ClipboardCheck, title: 'Stay on top of work', text: 'Tasks, follow-ups and clear records for every customer.' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        throw new Error(error?.message ?? 'Login failed');
      }
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        }),
      });
      if (!res.ok) throw new Error('Could not establish session');
      router.replace('/app/leads');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ─── Brand / hero panel ─── */}
      <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-950" />
        <div className="absolute -left-20 top-10 size-96 rounded-full bg-emerald-400/30 blur-3xl animate-blob" />
        <div className="absolute right-0 top-40 size-80 rounded-full bg-teal-300/20 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 size-96 rounded-full bg-cyan-300/20 blur-3xl animate-blob animation-delay-4000" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
              <Boxes className="size-5" />
            </div>
            <div className="text-sm font-semibold tracking-tight">{APP_NAME}</div>
          </div>

          <div className="max-w-md">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              Your sales pipeline,
              <br />
              all in one place.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              From first contact to closed deal — leads, customers and tasks, organised
              in one dependable workspace for your whole team.
            </p>

            <div className="mt-10 space-y-5">
              {HIGHLIGHTS.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.title} className="flex items-start gap-3">
                    <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 ring-1 ring-white/15">
                      <Icon className="size-[18px]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{h.title}</div>
                      <div className="text-xs leading-relaxed text-white/60">{h.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-white/40">
            © {new Date().getFullYear()} {APP_NAME}
          </div>
        </div>
      </div>

      {/* ─── Sign-in panel ─── */}
      <div className="relative flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="pointer-events-none absolute left-1/2 top-1/3 size-72 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="relative w-full max-w-sm">
          {/* mobile-only brand mark */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
            <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-600/20">
              <Boxes className="size-6" />
            </div>
            <div className="text-lg font-semibold text-slate-800">{APP_NAME}</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-7 shadow-xl shadow-slate-200/60 backdrop-blur">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Welcome back</h2>
              <p className="mt-1 text-sm text-slate-500">Sign in to your workspace</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <Button type="submit" className="h-11 w-full rounded-xl text-sm" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Protected workspace · Authorised users only
          </p>
        </div>
      </div>
    </div>
  );
}
