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
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-600/20">
          <Boxes className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight text-slate-800">{orgName}</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{APP_NAME}</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <NavLinks pathname={pathname} roles={me?.roles ?? []} />
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Link
            href="/app/profile"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg transition-colors hover:opacity-80"
          >
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500/80 to-emerald-700/70 text-xs font-semibold text-white">
              {initials(me?.fullName, me?.email)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-700">
                {me?.fullName ?? me?.email ?? 'Loading…'}
              </div>
              <div className="truncate text-[11px] text-slate-400">{me?.email ?? ''}</div>
            </div>
          </Link>
          <button
            onClick={signOut}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
