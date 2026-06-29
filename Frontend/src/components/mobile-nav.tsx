'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Boxes, Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/app-config';
import { useMe } from '@/lib/me';
import { NavLinks } from '@/components/nav';
import { NotificationsBell } from '@/components/notifications-bell';

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me } = useMe();
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  async function signOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.replace('/login');
    router.refresh();
  }

  const orgName = me?.org?.name ?? 'Workspace';

  return (
    <>
      {/* Top bar (mobile only) */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-md md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="grid size-9 place-items-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-sm shadow-emerald-500/30">
            <Boxes className="size-3.5" />
          </div>
          <span className="truncate text-sm font-semibold text-slate-800">{orgName}</span>
        </div>
        <NotificationsBell tone="light" className="ml-auto" />
      </header>

      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'bg-brand-ink fixed inset-y-0 left-0 z-50 flex w-72 flex-col shadow-2xl transition-transform duration-300 ease-out md:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-white/20">
              <Boxes className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight text-white">{orgName}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-300/70">{APP_NAME}</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="grid size-8 place-items-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <NavLinks pathname={pathname} roles={me?.roles ?? []} onNavigate={() => setOpen(false)} />
        </nav>

        <div className="border-t border-white/5 p-3">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
