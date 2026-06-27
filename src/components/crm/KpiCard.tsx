import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="group relative rounded-2xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-px overflow-hidden">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "size-8 rounded-lg bg-muted/70 text-muted-foreground grid place-items-center",
              accent,
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </div>
      {hint && (
        <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>
      )}
    </div>
  );
}