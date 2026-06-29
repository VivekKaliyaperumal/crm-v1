import { cn } from '@/lib/utils';

const GREEN = ['won', 'closed_won', 'active', 'paid', 'confirmed', 'completed', 'verified', 'accepted', 'available', 'done'];
const AMBER = ['negotiation', 'booking', 'proposal', 'partial', 'pending', 'in_progress', 'sent', 'blocked', 'on_hold', 'due', 'scheduled', 'planning', 'draft', 'paused'];
const ROSE = ['lost', 'closed_lost', 'cancelled', 'rejected', 'overdue', 'not_interested', 'no_show', 'expired', 'sold', 'archived'];

function tone(value: string): { chip: string; dot: string } {
  const v = value.toLowerCase();
  if (GREEN.includes(v))
    return { chip: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' };
  if (AMBER.includes(v))
    return { chip: 'bg-amber-50 text-amber-800 ring-amber-600/20', dot: 'bg-amber-500' };
  if (ROSE.includes(v))
    return { chip: 'bg-rose-50 text-rose-700 ring-rose-600/20', dot: 'bg-rose-500' };
  return { chip: 'bg-slate-100 text-slate-600 ring-slate-500/20', dot: 'bg-slate-400' };
}

function label(value: string): string {
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function Pill({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-slate-400">—</span>;
  const t = tone(value);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        t.chip,
      )}
    >
      <span className={cn('size-1.5 rounded-full', t.dot)} />
      {label(value)}
    </span>
  );
}
