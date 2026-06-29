'use client';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useMe, can } from '@/lib/me';
import { formatINR } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const STAGES = ['qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;

/** "closed_won" → "Closed Won" */
function humanize(value: string): string {
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface Opportunity {
  id: string;
  title: string;
  value: string;
  stage: string;
}

export default function OpportunitiesBoardPage() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const canCreate = can(me, 'opportunities', 'create');

  const { data, isLoading } = useQuery({
    queryKey: ['opportunities', 'board'],
    queryFn: () => apiFetch<{ data: Opportunity[] }>('opportunities?pageSize=100'),
  });

  const rows = data?.data ?? [];

  async function moveStage(id: string, stage: string) {
    try {
      await apiFetch('opportunities/' + id, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      });
      toast.success(`Moved to ${humanize(stage)}`);
      qc.invalidateQueries({ queryKey: ['opportunities'] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to move opportunity');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Opportunities</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {isLoading ? 'Loading…' : `${rows.length} on the board`}
          </p>
        </div>
        {canCreate && (
          <Link href="/app/opportunities/new">
            <Button>
              <Plus className="size-4" /> New opportunity
            </Button>
          </Link>
        )}
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4">
          {STAGES.map((stage) => {
            const cards = rows.filter((r) => r.stage === stage);
            return (
              <div key={stage} className="w-[280px] shrink-0">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="text-sm font-semibold text-slate-700">{humanize(stage)}</span>
                  <span className="grid min-w-6 place-items-center rounded-full bg-slate-100 px-2 text-xs font-medium text-slate-500">
                    {cards.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {cards.length === 0 && !isLoading && (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
                      No opportunities
                    </div>
                  )}

                  {cards.map((opp) => (
                    <Card key={opp.id} className="p-4">
                      <Link
                        href={`/app/opportunities/${opp.id}`}
                        className="block text-sm font-medium text-slate-800 transition-colors hover:text-emerald-700"
                      >
                        {opp.title}
                      </Link>
                      <div className="mt-1 text-sm font-semibold text-emerald-700">
                        {formatINR(opp.value)}
                      </div>
                      <select
                        value={opp.stage}
                        onChange={(e) => moveStage(opp.id, e.target.value)}
                        className="mt-3 h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600 shadow-sm transition-all hover:border-slate-300 focus-visible:border-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15"
                        aria-label="Move stage"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {humanize(s)}
                          </option>
                        ))}
                      </select>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
