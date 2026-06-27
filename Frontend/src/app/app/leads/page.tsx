'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useLeads, LEAD_STATUSES, STATUS_LABEL, type LeadStatus } from '@/lib/leads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatINR, relativeTime } from '@/lib/format';

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, isLoading, isError, error } = useLeads({
    search: search || undefined,
    status: status || undefined,
    page,
    pageSize,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Leads</h1>
          <p className="text-sm text-slate-500">
            {data ? `${data.total} total` : 'Loading…'}
          </p>
        </div>
        <Link href="/app/leads/new">
          <Button>
            <Plus className="size-4" /> New lead
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, phone…"
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as LeadStatus | '');
            setPage(1);
          }}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Interest</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))}

              {isError && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-rose-600">
                    {error instanceof Error ? error.message : 'Failed to load leads'}
                  </td>
                </tr>
              )}

              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                    No leads found. Create your first lead.
                  </td>
                </tr>
              )}

              {data?.data.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/leads/${lead.id}`}
                      className="font-medium text-slate-800 hover:text-emerald-700"
                    >
                      {lead.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    <div>{lead.phone ?? '—'}</div>
                    <div className="text-xs text-slate-400">{lead.email ?? ''}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{lead.propertyInterest ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {lead.budgetMin || lead.budgetMax
                      ? `${formatINR(lead.budgetMin)} – ${formatINR(lead.budgetMax)}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{relativeTime(lead.lastActivityAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {data && data.total > pageSize && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
