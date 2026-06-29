'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { relativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';

interface NotificationItem {
  type: string;
  title: string;
  date: string | null;
  href: string;
}

interface NotificationsResponse {
  count: number;
  items: NotificationItem[];
}

export function NotificationsBell({
  className,
  tone = 'dark',
}: {
  className?: string;
  /** 'dark' = light icon for dark backgrounds (sidebar); 'light' = dark icon for light bars (mobile top bar). */
  tone?: 'dark' | 'light';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiFetch<NotificationsResponse>('notifications'),
    refetchInterval: 60000,
  });

  const count = data?.count ?? 0;
  const items = data?.items ?? [];

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'relative grid size-8 shrink-0 place-items-center rounded-lg transition-colors',
          tone === 'dark'
            ? 'text-white/60 hover:bg-white/10 hover:text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )}
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {count > 0 && (
          <span
            className={cn(
              'absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-4 text-white ring-2',
              tone === 'dark' ? 'ring-brand-ink' : 'ring-white',
            )}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Notifications
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              You&apos;re all caught up.
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {items.map((item, i) => (
                <li key={`${item.href}-${i}`}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition-colors hover:bg-emerald-50/50"
                  >
                    <div className="text-sm font-medium text-slate-800">{item.title}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{relativeTime(item.date)}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
