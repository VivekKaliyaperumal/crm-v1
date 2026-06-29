'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useResourceItem, useResourceDelete } from '@/lib/resource';
import { apiFetch } from '@/lib/api';
import { useMe, can } from '@/lib/me';
import type { FieldDef, ResourceConfig } from '@/lib/resource-registry';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill } from '@/components/resource/pill';
import { ActivityTimeline } from '@/components/resource/activity-timeline';
import { RelatedRecords } from '@/components/resource/related-records';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatINR, formatDate } from '@/lib/format';

function display(value: unknown, type: FieldDef['type']) {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'money') return formatINR(value as string);
  if (type === 'date') return formatDate(value as string);
  return String(value);
}

/** Resolves a ref field's id to the related row's label and links to it.
 * Falls back to the raw id while loading or if the label is missing. */
function RefValue({ field, id }: { field: FieldDef; id: string }) {
  const { data } = useResourceItem(field.refPath!, id);
  const label = (data?.[field.refLabel!] as string | undefined) ?? id;
  return (
    <Link
      href={`/app/${field.refPath}/${id}`}
      className="text-emerald-600 transition-colors hover:text-emerald-700 hover:underline"
    >
      {label}
    </Link>
  );
}

export function ResourceDetail({ config, id }: { config: ResourceConfig; id: string }) {
  const router = useRouter();
  const { data: me } = useMe();
  const { data, isLoading, isError, error } = useResourceItem(config.apiPath, id);
  const del = useResourceDelete(config.apiPath);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const canEdit = can(me, config.slug, 'edit');
  const canDelete = can(me, config.slug, 'delete');

  async function onDelete() {
    try {
      await del.mutateAsync(id);
      toast.success(`${config.singular} deleted`);
      router.push(`/app/${config.slug}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete');
      setConfirmOpen(false);
    }
  }

  if (isLoading) return <div className="shimmer h-48 rounded-2xl" />;
  if (isError || !data) {
    return (
      <div className="text-sm text-rose-600">
        {error instanceof Error ? error.message : 'Not found'}
      </div>
    );
  }

  const titleKey = config.columns[0]?.key ?? 'id';
  const statusField = config.fields.find(
    (f) => f.key === 'status' || f.key === 'stage' || f.key === 'kycStatus',
  );

  return (
    <div className="space-y-5">
      <Link
        href={`/app/${config.slug}`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="size-4" /> Back to {config.title.toLowerCase()}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {String(data[titleKey] ?? config.singular)}
          </h1>
          {statusField && <Pill value={data[statusField.key] as string} />}
        </div>
        <div className="flex gap-2">
          {config.slug === 'documents' && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const { url } = await apiFetch<{ url: string }>(`documents/${id}/download-url`);
                  window.open(url, '_blank', 'noopener');
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Could not get file');
                }
              }}
            >
              <Download className="size-4" /> Download
            </Button>
          )}
          {canEdit && (
            <Link href={`/app/${config.slug}/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="size-4" /> Edit
              </Button>
            </Link>
          )}
          {canDelete && (
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="size-4 text-rose-600" />
              <span className="text-rose-600">Delete</span>
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle>{config.singular} details</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <dl className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
            {config.fields.map((f) => (
              <div key={f.key} className="flex flex-col gap-1 border-b border-slate-100/80 pb-3 last:border-0">
                <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{f.label}</dt>
                <dd className="text-sm font-medium text-slate-700">
                  {f.type === 'select' || f.key === 'channel' || f.key === 'mode' ? (
                    <Pill value={data[f.key] as string} />
                  ) : f.type === 'ref' &&
                    data[f.key] !== null &&
                    data[f.key] !== undefined &&
                    data[f.key] !== '' ? (
                    <RefValue field={f} id={String(data[f.key])} />
                  ) : (
                    display(data[f.key], f.type)
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {config.slug === 'customers' && <RelatedRecords customerId={id} />}

      <ActivityTimeline entityType={config.apiPath} entityId={id} />

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete this ${config.singular.toLowerCase()}?`}
        description="This action cannot be undone."
        loading={del.isPending}
        onConfirm={onDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
