'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLead } from '@/lib/leads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatINR, formatDate, relativeTime } from '@/lib/format';

interface Activity {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: lead, isLoading, isError, error } = useLead(params.id);

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />;
  }
  if (isError || !lead) {
    return (
      <div className="text-sm text-rose-600">
        {error instanceof Error ? error.message : 'Lead not found'}
      </div>
    );
  }

  const activities = (lead.activities as Activity[] | undefined) ?? [];

  return (
    <div className="space-y-5">
      <Link href="/app/leads" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Back to leads
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">{lead.fullName}</h1>
          <p className="text-sm text-slate-500">Added {formatDate(lead.createdAt)}</p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Contact & interest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Detail label="Phone" value={lead.phone} />
            <Detail label="Email" value={lead.email} />
            <Detail label="Interest" value={lead.propertyInterest} />
            <Detail
              label="Budget"
              value={
                lead.budgetMin || lead.budgetMax
                  ? `${formatINR(lead.budgetMin)} – ${formatINR(lead.budgetMax)}`
                  : null
              }
            />
            <Detail label="Timeline" value={lead.timeline} />
            <Detail label="Source" value={lead.source.replace('_', ' ')} />
            {lead.notes && <Detail label="Notes" value={lead.notes} />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No activity yet.</p>
            ) : (
              <ol className="relative space-y-4 border-l border-slate-100 pl-5">
                {activities.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[23px] top-1.5 size-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium capitalize text-slate-700">
                        {a.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">{relativeTime(a.occurredAt)}</span>
                    </div>
                    {renderPayload(a.payload)}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-slate-700">{value ?? '—'}</span>
    </div>
  );
}

function renderPayload(payload: Record<string, unknown>): React.ReactNode {
  const text = payload.text ?? payload.summary;
  if (typeof text === 'string') {
    return <p className="mt-0.5 text-sm text-slate-500">{text}</p>;
  }
  if (payload.from && payload.to) {
    return (
      <p className="mt-0.5 text-sm text-slate-500">
        {String(payload.from)} → {String(payload.to)}
      </p>
    );
  }
  return null;
}
