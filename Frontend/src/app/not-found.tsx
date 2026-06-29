import Link from 'next/link';
import { Boxes } from 'lucide-react';
import { APP_NAME } from '@/lib/app-config';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-white to-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 text-center shadow-[0_30px_60px_-20px_rgba(15,23,42,0.18)]">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-white/40">
          <Boxes className="size-7" />
        </div>
        <p className="mt-6 text-sm font-medium uppercase tracking-wider text-emerald-600">404</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          We couldn&apos;t find that page in {APP_NAME}. It may have been moved or no longer exists.
        </p>
        <Link
          href="/app/dashboard"
          className="mt-7 inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(5,150,105,0.6)] transition-all hover:from-emerald-500 hover:to-emerald-700 hover:-translate-y-0.5"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
