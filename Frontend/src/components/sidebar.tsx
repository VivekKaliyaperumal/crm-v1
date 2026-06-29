'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Boxes, LogOut } from 'lucide-react';
import { APP_NAME } from '@/lib/app-config';
import { useMe } from '@/lib/me';
import { NavLinks } from '@/components/nav';

function initials(name: string | null | undefined, email: string | null | undefined): string {
  const base = name ?? email ?? '?';
  return base
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me } = useMe();

  async function signOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.replace('/login');
    router.refresh();
  }

  const orgName = me?.org?.name ?? 'Workspace';

  return (
    <aside className="bg-brand-ink relative hidden w-64 flex-col border-r border-white/5 md:flex">
      {/* top sheen line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-white/20">
          <Boxes className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight text-white">{orgName}</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-300/70">{APP_NAME}</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <NavLinks pathname={pathname} roles={me?.roles ?? []} />
      </nav>

      <div className="border-t border-white/5 p-3">
        <div className="glass-dark flex items-center gap-3 rounded-2xl px-2.5 py-2.5">
          <Link
            href="/app/profile"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg transition-opacity hover:opacity-80"
          >
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-semibold text-white ring-1 ring-white/20">
              {initials(me?.fullName, me?.email)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">
                {me?.fullName ?? me?.email ?? 'Loading…'}
              </div>
              <div className="truncate text-[11px] text-white/45">{me?.email ?? ''}</div>
            </div>
          </Link>
          <button
            onClick={signOut}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
