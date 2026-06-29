'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes, Mail, Lock, Eye, EyeOff, Users, Target, ClipboardCheck, Loader2, ShieldCheck } from 'lucide-react';
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
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ─── Brand / hero panel ─── */}
      <div className="bg-brand-ink relative hidden overflow-hidden lg:block">
        {/* glow orbs */}
        <div className="animate-blob absolute -left-24 top-0 size-[28rem] rounded-full bg-emerald-400/35 blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute right-0 top-1/3 size-[26rem] rounded-full bg-teal-300/25 blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute -bottom-24 left-1/3 size-[30rem] rounded-full bg-cyan-300/20 blur-3xl" />
        {/* dotted grid */}
        <div className="bg-grid absolute inset-0 opacity-60" />
        {/* top sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
              <Boxes className="size-5" />
            </div>
            <div className="text-sm font-semibold tracking-tight">{APP_NAME}</div>
          </div>

          <div className="max-w-md">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100 ring-1 ring-white/15 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_2px_rgba(110,231,183,0.7)]" />
              Your workspace, beautifully organised
            </div>
            <h1 className="text-[2.7rem] font-semibold leading-[1.05] tracking-tight">
              Your sales pipeline,
              <br />
              <span className="text-gradient">all in one place.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
              From first contact to closed deal — leads, customers and tasks, organised in
              one dependable workspace for your whole team.
            </p>

            <div className="mt-10 space-y-4">
              {HIGHLIGHTS.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.title} className="flex items-start gap-3.5">
                    <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
                      <Icon className="size-[18px] text-emerald-200" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{h.title}</div>
                      <div className="text-xs leading-relaxed text-white/55">{h.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/40">
            <ShieldCheck className="size-3.5" />
            <span>© {new Date().getFullYear()} {APP_NAME} · Secure, role-based access</span>
          </div>
        </div>
      </div>

      {/* ─── Sign-in panel ─── */}
      <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-slate-50 px-4 py-12">
        <div className="pointer-events-none absolute -right-16 top-0 size-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 size-72 rounded-full bg-teal-100/50 blur-3xl" />

        <div className="animate-fade-in-up relative w-full max-w-md">
          {/* brand mark (always visible, doubles for mobile) */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-white/40">
              <Boxes className="size-7" />
            </div>
            <div className="text-base font-semibold tracking-tight text-slate-800 lg:hidden">{APP_NAME}</div>
          </div>

          <div className="glass rounded-3xl p-8 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.25)]">
            <div className="mb-7 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h2>
              <p className="mt-1.5 text-sm text-slate-500">Sign in to your workspace</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-3 text-sm shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-10 text-sm shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15"
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
                <div className="animate-fade-in rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
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

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <ShieldCheck className="size-3.5" />
            Protected workspace · Authorised users only
          </p>
        </div>
      </div>
    </div>
  );
}
