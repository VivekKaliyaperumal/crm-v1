import { cn } from '@/lib/utils';
import { STATUS_LABEL, type LeadStatus } from '@/lib/leads';

const TONE: Record<LeadStatus, string> = {
  closed_won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  booking: 'bg-amber-50 text-amber-800 border-amber-200',
  negotiation: 'bg-amber-50 text-amber-800 border-amber-200',
  closed_lost: 'bg-rose-50 text-rose-700 border-rose-200',
  not_interested: 'bg-rose-50 text-rose-700 border-rose-200',
  site_visit_scheduled: 'bg-sky-50 text-sky-700 border-sky-200',
  site_visit_completed: 'bg-sky-50 text-sky-700 border-sky-200',
  interested: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  future_follow_up: 'bg-slate-100 text-slate-700 border-slate-200',
  new: 'bg-slate-50 text-slate-700 border-slate-200',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TONE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
