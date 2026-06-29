'use client';
import Link from 'next/link';
import { Boxes, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-white to-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 text-center shadow-[0_30px_60px_-20px_rgba(15,23,42,0.18)]">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-white/40">
          <Boxes className="size-7" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          An unexpected error occurred. You can try again, or head back to your dashboard.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-slate-400">Reference: {error.digest}</p>
        )}
        <div className="mt-7 flex items-center justify-center gap-3">
          <Button onClick={() => reset()}>
            <RotateCcw className="size-4" /> Try again
          </Button>
          <Link href="/app/dashboard">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
