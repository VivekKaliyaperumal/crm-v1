'use client';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  Users,
  UserCheck,
  Target,
  Handshake,
  LandPlot,
  BookCheck,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

interface StatusCount {
  status: string;
  count: number;
}

interface DashboardStats {
  totals: {
    leads: number;
    customers: number;
    opportunities: number;
    deals: number;
    plots: number;
    bookings: number;
  };
  leadsByStatus: StatusCount[];
  dealsByStatus: StatusCount[];
  plotsByStatus: StatusCount[];
  wonDealValue: number;
}

const PALETTE = [
  '#059669',
  '#10b981',
  '#34d399',
  '#6ee7b7',
  '#a7f3d0',
  '#f59e0b',
  '#fb7185',
  '#38bdf8',
  '#a78bfa',
  '#facc15',
];

type KpiKey = keyof DashboardStats['totals'];

const KPIS: { key: KpiKey; label: string; href: string; icon: typeof Users; tint: string; glow: string }[] = [
  { key: 'leads', label: 'Leads', href: '/app/leads', icon: Users, tint: 'from-emerald-500 to-teal-600', glow: 'group-hover:shadow-emerald-500/15' },
  { key: 'customers', label: 'Customers', href: '/app/customers', icon: UserCheck, tint: 'from-sky-500 to-blue-600', glow: 'group-hover:shadow-sky-500/15' },
  { key: 'opportunities', label: 'Opportunities', href: '/app/opportunities', icon: Target, tint: 'from-violet-500 to-purple-600', glow: 'group-hover:shadow-violet-500/15' },
  { key: 'deals', label: 'Deals', href: '/app/deals', icon: Handshake, tint: 'from-amber-500 to-orange-600', glow: 'group-hover:shadow-amber-500/15' },
  { key: 'plots', label: 'Plots', href: '/app/plots', icon: LandPlot, tint: 'from-teal-500 to-cyan-600', glow: 'group-hover:shadow-teal-500/15' },
  { key: 'bookings', label: 'Bookings', href: '/app/bookings', icon: BookCheck, tint: 'from-rose-500 to-pink-600', glow: 'group-hover:shadow-rose-500/15' },
];

function labelStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function withLabels(rows: StatusCount[]) {
  return rows.map((r) => ({ ...r, label: labelStatus(r.status) }));
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
      <p className="mt-0.5 text-sm text-slate-500">A live overview of your workspace</p>
    </div>
  );
}

function Kpi({
  label,
  value,
  href,
  icon: Icon,
  tint,
  glow,
}: {
  label: string;
  value: number | string;
  href: string;
  icon: typeof Users;
  tint: string;
  glow: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className={`relative overflow-hidden p-5 hover:-translate-y-1 hover:shadow-card-hover ${glow}`}>
        <div className="flex items-start justify-between">
          <div
            className={`grid size-11 place-items-center rounded-xl bg-gradient-to-br ${tint} text-white shadow-md ring-1 ring-white/30`}
          >
            <Icon className="size-5" />
          </div>
          <ArrowUpRight className="size-4 text-slate-300 transition-colors group-hover:text-slate-500" />
        </div>
        <div className="mt-4 text-[2rem] font-semibold leading-none tracking-tight text-slate-900">
          {value}
        </div>
        <div className="mt-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard/stats'],
    queryFn: () => apiFetch<DashboardStats>('dashboard/stats'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="shimmer size-11 rounded-xl" />
              <div className="shimmer mt-4 h-7 w-12 rounded" />
              <div className="shimmer mt-2 h-3 w-16 rounded" />
            </Card>
          ))}
        </div>
        <div className="shimmer h-28 rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="shimmer h-4 w-32 rounded" />
              <div className="shimmer mt-4 h-[280px] w-full rounded-xl" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-rose-600">
              Could not load dashboard stats
              {error instanceof Error ? `: ${error.message}` : ''}.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { totals, leadsByStatus, dealsByStatus, wonDealValue } = data;
  const leadsData = withLabels(leadsByStatus);
  const dealsData = withLabels(dealsByStatus);

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="stagger grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {KPIS.map((k) => (
          <Kpi
            key={k.key}
            label={k.label}
            value={totals[k.key]}
            href={k.href}
            icon={k.icon}
            tint={k.tint}
            glow={k.glow}
          />
        ))}
      </div>

      {/* Hero: won deal value */}
      <div className="bg-brand-ink relative overflow-hidden rounded-2xl p-6 text-white shadow-[0_24px_50px_-20px_rgba(5,95,70,0.6)]">
        <div className="animate-blob absolute -right-10 -top-10 size-56 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-200/80">
              <TrendingUp className="size-4" /> Won deal value
            </div>
            <div className="mt-2 text-4xl font-semibold tracking-tight">{formatINR(wonDealValue)}</div>
            <p className="mt-1.5 text-sm text-white/55">Total value of deals marked won</p>
          </div>
          <Link
            href="/app/deals"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/15"
          >
            View deals <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads by status</CardTitle>
          </CardHeader>
          <CardContent>
            {leadsData.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
                No leads yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={leadsData} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 30px -12px rgba(15,23,42,0.25)',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {leadsData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deals by status</CardTitle>
          </CardHeader>
          <CardContent>
            {dealsData.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
                No deals yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={dealsData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {dealsData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 30px -12px rgba(15,23,42,0.25)',
                      fontSize: 12,
                    }}
                  />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
