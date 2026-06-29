import { cn } from '@/lib/utils';
import { STATUS_LABEL, type LeadStatus } from '@/lib/leads';

const TONE: Record<LeadStatus, { chip: string; dot: string }> = {
  closed_won: { chip: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  booking: { chip: 'bg-amber-50 text-amber-800 ring-amber-600/20', dot: 'bg-amber-500' },
  negotiation: { chip: 'bg-amber-50 text-amber-800 ring-amber-600/20', dot: 'bg-amber-500' },
  closed_lost: { chip: 'bg-rose-50 text-rose-700 ring-rose-600/20', dot: 'bg-rose-500' },
  not_interested: { chip: 'bg-rose-50 text-rose-700 ring-rose-600/20', dot: 'bg-rose-500' },
  site_visit_scheduled: { chip: 'bg-sky-50 text-sky-700 ring-sky-600/20', dot: 'bg-sky-500' },
  site_visit_completed: { chip: 'bg-sky-50 text-sky-700 ring-sky-600/20', dot: 'bg-sky-500' },
  interested: { chip: 'bg-blue-50 text-blue-700 ring-blue-600/20', dot: 'bg-blue-500' },
  contacted: { chip: 'bg-blue-50 text-blue-700 ring-blue-600/20', dot: 'bg-blue-500' },
  future_follow_up: { chip: 'bg-slate-100 text-slate-700 ring-slate-500/20', dot: 'bg-slate-400' },
  new: { chip: 'bg-slate-100 text-slate-600 ring-slate-500/20', dot: 'bg-slate-400' },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const t = TONE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        t.chip,
      )}
    >
      <span className={cn('size-1.5 rounded-full', t.dot)} />
      {STATUS_LABEL[status]}
    </span>
  );
}
