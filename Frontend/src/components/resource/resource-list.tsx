'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Inbox } from 'lucide-react';
import { useResourceList, type Row } from '@/lib/resource';
import { useMe, can } from '@/lib/me';
import type { ColumnDef, ResourceConfig } from '@/lib/resource-registry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/resource/pill';
import { formatINR, formatDate } from '@/lib/format';

const selectCls =
  'h-10 rounded-xl border border-slate-200 bg-white/90 px-3 text-sm text-slate-700 shadow-sm transition-all hover:border-slate-300 focus-visible:border-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15';

function renderCell(row: Row, col: ColumnDef) {
  const value = row[col.key];
  if (col.type === 'status') return <Pill value={value as string} />;
  if (col.type === 'money') return formatINR(value as string);
  if (col.type === 'date') return formatDate(value as string);
  if (value === null || value === undefined || value === '') return <span className="text-slate-400">—</span>;
  return String(value);
}

export function ResourceList({ config }: { config: ResourceConfig }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data: me } = useMe();
  const canCreate = can(me, config.slug, 'create');

  const { data, isLoading, isError, error } = useResourceList(config.apiPath, {
    ...(config.searchable && search ? { search } : {}),
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    page,
    pageSize,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;
  const colCount = config.columns.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{config.title}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {data ? `${data.total} ${data.total === 1 ? 'record' : 'records'}` : 'Loading…'}
          </p>
        </div>
        {canCreate && (
          <Link href={`/app/${config.slug}/new`}>
            <Button>
              <Plus className="size-4" /> New {config.singular.toLowerCase()}
            </Button>
          </Link>
        )}
      </div>

      {(config.searchable || config.filters?.length) && (
        <div className="flex flex-wrap items-center gap-2">
          {config.searchable && (
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={`Search ${config.title.toLowerCase()}…`}
                className="pl-10"
              />
            </div>
          )}
          {config.filters?.map((f) => (
            <select
              key={f.key}
              value={filters[f.key] ?? ''}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, [f.key]: e.target.value }));
                setPage(1);
              }}
              className={selectCls}
            >
              <option value="">All {f.label.toLowerCase()}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/70 text-left text-[11px] uppercase tracking-wider text-slate-500">
                {config.columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-semibold">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={colCount} className="px-4 py-3.5">
                      <div className="shimmer h-5 w-full rounded" />
                    </td>
                  </tr>
                ))}

              {isError && (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center text-sm text-rose-600">
                    {error instanceof Error ? error.message : 'Failed to load'}
                  </td>
                </tr>
              )}

              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={colCount} className="px-4 py-16 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                        <Inbox className="size-6" />
                      </div>
                      <div className="text-sm font-medium text-slate-600">
                        No {config.title.toLowerCase()} yet
                      </div>
                      {canCreate && (
                        <Link href={`/app/${config.slug}/new`}>
                          <Button size="sm" variant="outline">
                            <Plus className="size-4" /> Add the first one
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {data?.data.map((row) => (
                <tr key={row.id} className="group transition-colors hover:bg-emerald-50/40">
                  {config.columns.map((c, idx) => (
                    <td key={c.key} className="px-4 py-3.5 text-slate-600">
                      {idx === 0 ? (
                        <Link
                          href={`/app/${config.slug}/${row.id}`}
                          className="font-medium text-slate-800 transition-colors group-hover:text-emerald-700"
                        >
                          {renderCell(row, c)}
                        </Link>
                      ) : (
                        <>
                          {renderCell(row, c)}
                          {c.sub && row[c.sub] ? (
                            <div className="text-xs text-slate-400">{String(row[c.sub])}</div>
                          ) : null}
                        </>
                      )}
                    </td>
                  ))}
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
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
