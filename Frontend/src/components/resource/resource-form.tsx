'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useResourceCreate, useResourceList } from '@/lib/resource';
import type { FieldDef, ResourceConfig } from '@/lib/resource-registry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const selectCls =
  'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40';

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

export function ResourceForm({ config }: { config: ResourceConfig }) {
  const router = useRouter();
  const create = useResourceCreate(config.apiPath);
  const [values, setValues] = useState<Record<string, string>>({});
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
      await create.mutateAsync(payload);
      router.push(`/app/${config.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href={`/app/${config.slug}`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" /> Back to {config.title.toLowerCase()}
      </Link>
      <h1 className="text-xl font-semibold text-slate-800">New {config.singular.toLowerCase()}</h1>

      <Card>
        <CardContent className="pt-5">
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {config.fields.map((f) => {
              const full = f.type === 'textarea';
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
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
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
              <Link href={`/app/${config.slug}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Saving…' : `Create ${config.singular.toLowerCase()}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
