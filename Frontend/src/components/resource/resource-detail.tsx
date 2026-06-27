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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatINR, formatDate } from '@/lib/format';

function display(value: unknown, type: FieldDef['type']) {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'money') return formatINR(value as string);
  if (type === 'date') return formatDate(value as string);
  return String(value);
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

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />;
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
          <h1 className="text-xl font-semibold text-slate-800">
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
