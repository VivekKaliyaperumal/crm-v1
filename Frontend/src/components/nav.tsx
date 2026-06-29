'use client';
import Link from 'next/link';
import {
  LayoutDashboard, Users, Target, Handshake, UserCheck, Building2, LandPlot,
  MapPin, PhoneCall, ListTodo, FileText, BookCheck, Wallet, Receipt, FolderOpen,
  Megaphone, UsersRound, ShieldCheck, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavItem = { to: string; label: string; icon: typeof Users };
export type NavGroup = { label: string; items: NavItem[]; admin?: boolean };

export const NAV_GROUPS: NavGroup[] = [
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
  {
    label: 'Admin',
    admin: true,
    items: [
      { to: '/app/team', label: 'Team', icon: UsersRound },
      { to: '/app/permissions', label: 'Permissions', icon: ShieldCheck },
      { to: '/app/settings', label: 'Organization', icon: Settings },
    ],
  },
];

export function NavLinks({
  pathname,
  roles = [],
  onNavigate,
}: {
  pathname: string;
  roles?: string[];
  onNavigate?: () => void;
}) {
  const isAdmin = roles.includes('admin');
  const groups = NAV_GROUPS.filter((g) => !g.admin || isAdmin);
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
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
                  onClick={onNavigate}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-inset ring-white/10'
                      : 'text-white/65 hover:bg-white/5 hover:text-white',
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-emerald-300 to-teal-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.6)]" />
                  )}
                  <Icon
                    className={cn(
                      'size-[18px] shrink-0 transition-colors',
                      active ? 'text-emerald-300' : 'text-white/45 group-hover:text-white/80',
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
