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
    <div className="space-y-4">
      {groups.map((group) => (
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
                  onClick={onNavigate}
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
    </div>
  );
}
