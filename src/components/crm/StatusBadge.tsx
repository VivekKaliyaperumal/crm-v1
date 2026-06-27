import { statusTone, STATUS_LABEL, type LeadStatus } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        statusTone(status),
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}