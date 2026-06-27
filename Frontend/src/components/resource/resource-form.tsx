'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { useResourceCreate, useResourceUpdate, useResourceList } from '@/lib/resource';
import { apiFetch } from '@/lib/api';
import { supabaseBrowser } from '@/lib/supabase-browser';
import type { FieldDef, ResourceConfig } from '@/lib/resource-registry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface UploadedMeta {
  path: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
}

function FileField({
  apiPath,
  currentValue,
  onUploaded,
}: {
  apiPath: string;
  currentValue: string;
  onUploaded: (meta: UploadedMeta) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { bucket, path, token } = await apiFetch<{ bucket: string; path: string; token: string }>(
        `${apiPath}/upload-url`,
        { method: 'POST', body: JSON.stringify({ filename: file.name }) },
      );
      const { error } = await supabaseBrowser.storage.from(bucket).uploadToSignedUrl(path, token, file);
      if (error) throw new Error(error.message);
      onUploaded({ path, name: file.name, mimeType: file.type, sizeBytes: file.size });
      toast.success('File uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition-colors hover:border-emerald-400 hover:bg-emerald-50/40">
      {uploading ? (
        <Loader2 className="size-4 animate-spin text-emerald-600" />
      ) : currentValue ? (
        <CheckCircle2 className="size-4 text-emerald-600" />
      ) : (
        <Upload className="size-4 text-slate-400" />
      )}
      <span className="truncate">
        {uploading ? 'Uploading…' : currentValue ? 'File uploaded — choose another to replace' : 'Choose a file to upload'}
      </span>
      <input type="file" className="hidden" onChange={onChange} disabled={uploading} />
    </label>
  );
}

const selectCls =
  'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors focus-visible:border-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30';

function toFieldString(value: unknown, type: FieldDef['type']): string {
  if (value === null || value === undefined) return '';
  if (type === 'date') {
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  }
  return String(value);
}

function RefSelect({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const { data } = useResourceList(field.refPath!, { pageSize: 100 });
  return (
    <select className={selectCls} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">— select —</option>
      {data?.data.map((row) => (
        <option key={row.id} value={row.id}>
          {String(row[field.refLabel!] ?? row.id)}
        </option>
      ))}
    </select>
  );
}

export function ResourceForm({
  config,
  recordId,
  initial,
}: {
  config: ResourceConfig;
  recordId?: string;
  initial?: Record<string, unknown>;
}) {
  const router = useRouter();
  const isEdit = Boolean(recordId);
  const create = useResourceCreate(config.apiPath);
  const update = useResourceUpdate(config.apiPath);
  const pending = create.isPending || update.isPending;

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (initial) {
      for (const f of config.fields) init[f.key] = toFieldString(initial[f.key], f.type);
    }
    return init;
  });
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, v: string) => setValues((prev) => ({ ...prev, [key]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    for (const f of config.fields) {
      if (f.required && !values[f.key]) {
        setError(`${f.label} is required`);
        return;
      }
    }

    const payload: Record<string, unknown> = {};
    for (const f of config.fields) {
      const raw = values[f.key];
      if (raw === undefined || raw === '') continue;
      payload[f.key] = f.type === 'number' || f.type === 'money' ? Number(raw) : raw;
    }

    try {
      if (isEdit && recordId) {
        await update.mutateAsync({ id: recordId, body: payload });
        toast.success(`${config.singular} updated`);
        router.push(`/app/${config.slug}/${recordId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toast.success(`${config.singular} created`);
        router.push(`/app/${config.slug}/${created.id}`);
      }
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save';
      setError(message);
      toast.error(message);
    }
  }

  const backHref = isEdit ? `/app/${config.slug}/${recordId}` : `/app/${config.slug}`;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="size-4" /> Back
      </Link>
      <h1 className="text-xl font-semibold text-slate-800">
        {isEdit ? `Edit ${config.singular.toLowerCase()}` : `New ${config.singular.toLowerCase()}`}
      </h1>

      <Card>
        <CardContent className="pt-5">
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {config.fields.map((f) => {
              if (f.hidden) return null;
              const full = f.type === 'textarea' || f.type === 'file';
              return (
                <div key={f.key} className={`space-y-1 ${full ? 'sm:col-span-2' : ''}`}>
                  <label className="text-sm font-medium text-slate-700">
                    {f.label}
                    {f.required && <span className="text-rose-500"> *</span>}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={values[f.key] ?? ''}
                      onChange={(e) => set(f.key, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors focus-visible:border-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                    />
                  ) : f.type === 'select' ? (
                    <select
                      className={selectCls}
                      value={values[f.key] ?? ''}
                      onChange={(e) => set(f.key, e.target.value)}
                    >
                      <option value="">— select —</option>
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'ref' ? (
                    <RefSelect field={f} value={values[f.key] ?? ''} onChange={(v) => set(f.key, v)} />
                  ) : f.type === 'file' ? (
                    <FileField
                      apiPath={config.apiPath}
                      currentValue={values[f.key] ?? ''}
                      onUploaded={(m) =>
                        setValues((prev) => ({
                          ...prev,
                          [f.key]: m.path,
                          mimeType: m.mimeType,
                          sizeBytes: String(m.sizeBytes),
                          name: prev.name || m.name,
                        }))
                      }
                    />
                  ) : (
                    <Input
                      type={f.type === 'number' || f.type === 'money' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                      value={values[f.key] ?? ''}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  )}
                </div>
              );
            })}

            {error && <p className="text-sm text-rose-600 sm:col-span-2">{error}</p>}

            <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
              <Link href={backHref}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={pending}>
                {pending ? 'Saving…' : isEdit ? 'Save changes' : `Create ${config.singular.toLowerCase()}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
