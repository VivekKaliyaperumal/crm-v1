import { cn } from '@/lib/utils';

const GREEN = ['won', 'closed_won', 'active', 'paid', 'confirmed', 'completed', 'verified', 'accepted', 'available', 'done'];
const AMBER = ['negotiation', 'booking', 'proposal', 'partial', 'pending', 'in_progress', 'sent', 'blocked', 'on_hold', 'due', 'scheduled', 'planning', 'draft', 'paused'];
const ROSE = ['lost', 'closed_lost', 'cancelled', 'rejected', 'overdue', 'not_interested', 'no_show', 'expired', 'sold', 'archived'];

function tone(value: string): string {
  const v = value.toLowerCase();
  if (GREEN.includes(v)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (AMBER.includes(v)) return 'bg-amber-50 text-amber-800 border-amber-200';
  if (ROSE.includes(v)) return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function label(value: string): string {
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function Pill({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-slate-400">—</span>;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tone(value),
      )}
    >
      {label(value)}
    </span>
  );
}
