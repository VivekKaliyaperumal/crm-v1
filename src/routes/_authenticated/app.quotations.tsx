import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listQuotations } from "@/lib/quotations.functions";
import { PageHeader } from "@/components/crm/PageHeader";
import { EmptyState } from "@/components/crm/EmptyState";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";

const opts = queryOptions({ queryKey: ["quotations"], queryFn: () => listQuotations() });

export const Route = createFileRoute("/_authenticated/app/quotations")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: ListPage,
  errorComponent: ({ error }) => <div className="text-destructive text-sm">{error.message}</div>,
});

function ListPage() {
  const { data: rows } = useSuspenseQuery(opts);
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Billing" title="Quotations" description="Quote and proposals issued to customers."
        actions={<Button size="lg"><Plus className="size-4 mr-1.5" />New</Button>} />
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        {rows.length === 0 ? (
          <EmptyState icon={<FileText className="size-5" />} title="No quotations yet" />
        ) : (
          <ul className="divide-y">
            {rows.map((r: any) => (
              <li key={r.id} className="px-5 py-4 flex items-center gap-4 hover:bg-muted/30">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.name || r.title || r.quotation_number || r.booking_number || r.receipt_number || `#${r.id.slice(0,8)}`}</div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {r.customers?.full_name && `${r.customers.full_name} · `}
                    {r.plots?.plot_number && `Plot ${r.plots.plot_number} · `}
                    {r.bookings?.booking_number && `Booking ${r.bookings.booking_number} · `}
                    {r.status || r.channel || ``}
                  </div>
                </div>
                {(r.amount != null || r.total != null || r.budget != null) && (
                  <div className="text-sm font-semibold tabular-nums">{inr(Number(r.amount ?? r.total ?? r.budget))}</div>
                )}
                {r.status && <span className="text-xs px-2 py-0.5 rounded-full border capitalize bg-muted text-muted-foreground">{String(r.status).replace(/_/g, " ")}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
