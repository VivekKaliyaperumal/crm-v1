'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Target, Handshake, UserCheck, Building2, LandPlot,
  MapPin, PhoneCall, ListTodo, FileText, BookCheck, Wallet, Receipt, FolderOpen,
  Megaphone, Boxes, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/app-config';
import { useMe } from '@/lib/me';

type Item = { to: string; label: string; icon: typeof Users };
type Group = { label: string; items: Item[] };

const GROUPS: Group[] = [
  { label: 'Workspace', items: [{ to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'Sales',
    items: [
      { to: '/app/leads', label: 'Leads', icon: Users },
      { to: '/app/opportunities', label: 'Opportunities', icon: Target },
      { to: '/app/deals', label: 'Deals', icon: Handshake },
      { to: '/app/customers', label: 'Customers', icon: UserCheck },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { to: '/app/projects', label: 'Projects', icon: Building2 },
      { to: '/app/plots', label: 'Plot Inventory', icon: LandPlot },
      { to: '/app/site-visits', label: 'Site Visits', icon: MapPin },
    ],
  },
  {
    label: 'Activities',
    items: [
      { to: '/app/follow-ups', label: 'Follow-ups', icon: PhoneCall },
      { to: '/app/tasks', label: 'Tasks', icon: ListTodo },
    ],
  },
  {
    label: 'Billing',
    items: [
      { to: '/app/quotations', label: 'Quotations', icon: FileText },
      { to: '/app/bookings', label: 'Bookings', icon: BookCheck },
      { to: '/app/payments', label: 'Payments', icon: Wallet },
      { to: '/app/receipts', label: 'Receipts', icon: Receipt },
    ],
  },
  {
    label: 'Growth',
    items: [
      { to: '/app/campaigns', label: 'Campaigns', icon: Megaphone },
      { to: '/app/documents', label: 'Documents', icon: FolderOpen },
    ],
  },
];

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
      {/* Brand — the client's own organization (white-label) */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-600/20">
          <Boxes className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight text-slate-800">{orgName}</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{APP_NAME}</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.to || pathname.startsWith(item.to + '/');
                return (
                  <Link
                    key={item.to}
                    href={item.to}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <Icon className={cn('size-[17px] shrink-0', active && 'text-emerald-600')} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500/80 to-emerald-700/70 text-xs font-semibold text-white">
            {initials(me?.fullName, me?.email)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-slate-700">
              {me?.fullName ?? me?.email ?? 'Loading…'}
            </div>
            <div className="truncate text-[11px] text-slate-400">{me?.email ?? ''}</div>
          </div>
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
