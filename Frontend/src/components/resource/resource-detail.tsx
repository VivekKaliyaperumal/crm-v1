'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useResourceItem } from '@/lib/resource';
import type { FieldDef, ResourceConfig } from '@/lib/resource-registry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill } from '@/components/resource/pill';
import { formatINR, formatDate } from '@/lib/format';

function display(value: unknown, type: FieldDef['type']) {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'money') return formatINR(value as string);
  if (type === 'date') return formatDate(value as string);
  return String(value);
}

export function ResourceDetail({ config, id }: { config: ResourceConfig; id: string }) {
  const { data, isLoading, isError, error } = useResourceItem(config.apiPath, id);

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />;
  if (isError || !data) {
    return (
      <div className="text-sm text-rose-600">
        {error instanceof Error ? error.message : 'Not found'}
      </div>
    );
  }

  // Title: first non-id meaningful field.
  const titleKey = config.columns[0]?.key ?? 'id';
  const statusField = config.fields.find((f) => f.key === 'status' || f.key === 'stage' || f.key === 'kycStatus');

  return (
    <div className="space-y-5">
      <Link
        href={`/app/${config.slug}`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" /> Back to {config.title.toLowerCase()}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-800">{String(data[titleKey] ?? config.singular)}</h1>
        {statusField && <Pill value={data[statusField.key] as string} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{config.singular} details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {config.fields.map((f) => (
              <div key={f.key} className="flex flex-col">
                <dt className="text-xs uppercase tracking-wide text-slate-400">{f.label}</dt>
                <dd className="text-sm text-slate-700">
                  {f.type === 'select' || f.key === 'channel' || f.key === 'mode' ? (
                    <Pill value={data[f.key] as string} />
                  ) : (
                    display(data[f.key], f.type)
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
