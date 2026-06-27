'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
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
import { apiFetch } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

function labelStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function withLabels(rows: StatusCount[]) {
  return rows.map((r) => ({ ...r, label: labelStatus(r.status) }));
}

function Kpi({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="pt-5">
          <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-slate-800">{value}</div>
        </CardContent>
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
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Workspace overview</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5">
                <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-7 w-10 animate-pulse rounded bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>Loading…</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full animate-pulse rounded-xl bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Workspace overview</p>
        </div>
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
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Workspace overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Leads" value={totals.leads} href="/app/leads" />
        <Kpi label="Customers" value={totals.customers} href="/app/customers" />
        <Kpi label="Opportunities" value={totals.opportunities} href="/app/opportunities" />
        <Kpi label="Deals" value={totals.deals} href="/app/deals" />
        <Kpi label="Plots" value={totals.plots} href="/app/plots" />
        <Kpi label="Bookings" value={totals.bookings} href="/app/bookings" />
      </div>

      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="pt-5">
          <div className="text-xs uppercase tracking-wide text-emerald-700">
            Won deal value
          </div>
          <div className="mt-1 text-3xl font-semibold text-emerald-900">
            {formatINR(wonDealValue)}
          </div>
        </CardContent>
      </Card>

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
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
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
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
