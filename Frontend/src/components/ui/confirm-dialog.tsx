'use client';
import { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={() => !loading && onCancel()}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-fade-in-up"
      >
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle className="size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
