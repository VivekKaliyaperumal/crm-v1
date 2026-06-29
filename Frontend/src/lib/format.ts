import { formatDistanceToNow } from 'date-fns';

/** ₹ with Indian lakh/crore grouping. Accepts number | string | null. */
export function formatINR(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

/** dd-MMM-yyyy (org standard), always rendered in Asia/Kolkata regardless of
 * the viewer's timezone — the app targets NRI users abroad. */
const kolkataDate = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  // en-IN yields "07 Jun 2026"; reformat to dd-MMM-yyyy → "07-Jun-2026".
  return kolkataDate.format(d).replace(/\s+/g, '-');
}

export function relativeTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return formatDistanceToNow(d, { addSuffix: true });
}
