'use client';
import Link from 'next/link';
import { useResourceList } from '@/lib/resource';
import { useLeads } from '@/lib/leads';
import { Card, CardContent } from '@/components/ui/card';

function Kpi({ label, value, href }: { label: string; value: number | string; href: string }) {
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
  const leads = useLeads({ page: 1, pageSize: 1 });
  const customers = useResourceList('customers', { page: 1, pageSize: 1 });
  const opportunities = useResourceList('opportunities', { page: 1, pageSize: 1 });
  const deals = useResourceList('deals', { page: 1, pageSize: 1 });
  const plots = useResourceList('plots', { page: 1, pageSize: 1 });
  const bookings = useResourceList('bookings', { page: 1, pageSize: 1 });

  const n = (q: { data?: { total: number } }) => q.data?.total ?? '—';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Workspace overview</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Leads" value={n(leads)} href="/app/leads" />
        <Kpi label="Customers" value={n(customers)} href="/app/customers" />
        <Kpi label="Opportunities" value={n(opportunities)} href="/app/opportunities" />
        <Kpi label="Deals" value={n(deals)} href="/app/deals" />
        <Kpi label="Plots" value={n(plots)} href="/app/plots" />
        <Kpi label="Bookings" value={n(bookings)} href="/app/bookings" />
      </div>
    </div>
  );
}
