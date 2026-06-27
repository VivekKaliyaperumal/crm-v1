'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';

type Action = 'view' | 'create' | 'edit' | 'delete';
const ACTIONS: { key: Action; short: string }[] = [
  { key: 'view', short: 'V' },
  { key: 'create', short: 'C' },
  { key: 'edit', short: 'E' },
  { key: 'delete', short: 'D' },
];

interface Matrix {
  roles: string[];
  modules: { key: string; label: string; perms: Record<Action, string[]> }[];
}

function roleLabel(r: string) {
  return r
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function PermissionsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => apiFetch<Matrix>('permissions'),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Permissions</h1>
        <p className="text-sm text-slate-500">
          What each role can do per module. <span className="font-medium">V</span>iew ·{' '}
          <span className="font-medium">C</span>reate · <span className="font-medium">E</span>dit ·{' '}
          <span className="font-medium">D</span>elete
        </p>
      </div>

      {isError && (
        <p className="text-sm text-rose-600">
          {error instanceof Error ? error.message : 'Failed to load permissions'}
        </p>
      )}
      {isLoading && <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />}

      {data && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-medium">Module</th>
                  {data.roles.map((r) => (
                    <th key={r} className="px-4 py-3 text-center font-medium">
                      {roleLabel(r)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.modules.map((m) => (
                  <tr key={m.key} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{m.label}</td>
                    {data.roles.map((role) => {
                      const allowed = ACTIONS.filter((a) => m.perms[a.key].includes(role));
                      return (
                        <td key={role} className="px-4 py-3 text-center">
                          {allowed.length === 0 ? (
                            <span className="text-slate-300">—</span>
                          ) : (
                            <div className="flex justify-center gap-1">
                              {allowed.map((a) => (
                                <span
                                  key={a.key}
                                  title={a.key}
                                  className="grid size-5 place-items-center rounded bg-emerald-50 text-[10px] font-semibold text-emerald-700"
                                >
                                  {a.short}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
