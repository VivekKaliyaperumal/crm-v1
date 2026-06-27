import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listDeals } from "@/lib/deals.functions";
import { PageHeader } from "@/components/crm/PageHeader";
import { KpiStrip } from "@/components/crm/KpiStrip";
import { EmptyState } from "@/components/crm/EmptyState";
import { Handshake } from "lucide-react";
import { inr } from "@/lib/format";

const opts = queryOptions({ queryKey: ["deals"], queryFn: () => listDeals() });

export const Route = createFileRoute("/_authenticated/app/deals")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: DealsPage,
  errorComponent: ({ error }) => <div className="text-destructive text-sm">{error.message}</div>,
});

const TONE: Record<string, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost: "bg-rose-50 text-rose-700 border-rose-200",
  on_hold: "bg-amber-50 text-amber-800 border-amber-200",
};

function DealsPage() {
  const { data: deals } = useSuspenseQuery(opts);
  const sum = (s: string) => deals.filter((d: any) => d.status === s).reduce((a: number, d: any) => a + Number(d.amount), 0);
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Sales" title="Deals" description="Active and closed deals tied to plot inventory." />
      <KpiStrip items={[
        { label: "Total deals", value: deals.length, tone: "slate" },
        { label: "Open value", value: inr(sum("open")), tone: "blue" },
        { label: "Won value", value: inr(sum("won")), tone: "emerald" },
        { label: "Lost value", value: inr(sum("lost")), tone: "rose" },
      ]} />
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        {deals.length === 0 ? (
          <EmptyState icon={<Handshake className="size-5" />} title="No deals yet" description="Deals appear here when opportunities advance to close." />
        ) : (
          <ul className="divide-y">
            {deals.map((d: any) => (
              <li key={d.id} className="px-5 py-4 flex items-center gap-4 hover:bg-muted/30">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{d.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {d.customers?.full_name ?? "—"} · {d.plots?.projects?.name ?? "—"} {d.plots?.plot_number && `· Plot ${d.plots.plot_number}`}
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums">{inr(Number(d.amount))}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${TONE[d.status]}`}>{d.status.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
