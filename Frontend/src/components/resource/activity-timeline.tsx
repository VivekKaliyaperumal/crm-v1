'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { relativeTime } from '@/lib/format';

interface ActivityEntry {
  id: string;
  action: string;
  at: string;
  actor: string;
}

const VERBS: Record<string, string> = {
  POST: 'created',
  PATCH: 'updated',
  DELETE: 'deleted',
};

function verb(action: string): string {
  return VERBS[action] ?? action;
}

export function ActivityTimeline({
  entityType,
  entityId,
}: {
  entityType: string;
  entityId: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['activity', entityType, entityId],
    queryFn: () =>
      apiFetch<ActivityEntry[]>(`activity?entityType=${entityType}&entityId=${entityId}`),
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        {isLoading ? (
          <div className="space-y-3">
            <div className="shimmer h-5 rounded-lg" />
            <div className="shimmer h-5 w-3/4 rounded-lg" />
            <div className="shimmer h-5 w-1/2 rounded-lg" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No activity yet.</p>
        ) : (
          <ol className="relative space-y-4 border-l border-slate-100 pl-5">
            {data.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[23px] top-1.5 size-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-700">
                    <span className="font-medium">{a.actor}</span> {verb(a.action)} this
                  </span>
                  <span className="text-xs text-slate-400">{relativeTime(a.at)}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
