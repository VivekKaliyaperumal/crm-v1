import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPlots } from "@/lib/plots.functions";
import { PageHeader } from "@/components/crm/PageHeader";
import { KpiStrip } from "@/components/crm/KpiStrip";
import { EmptyState } from "@/components/crm/EmptyState";
import { LandPlot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";

const opts = queryOptions({ queryKey: ["plots"], queryFn: () => listPlots({ data: {} }) });

export const Route = createFileRoute("/_authenticated/app/plots")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: PlotsPage,
  errorComponent: ({ error }) => <div className="text-destructive text-sm">{error.message}</div>,
});

const STATUS_TONE: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blocked: "bg-amber-50 text-amber-800 border-amber-200",
  booked: "bg-blue-50 text-blue-700 border-blue-200",
  sold: "bg-violet-50 text-violet-700 border-violet-200",
};

function PlotsPage() {
  const { data: plots } = useSuspenseQuery(opts);
  const by = (s: string) => plots.filter((p: any) => p.status === s).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Inventory"
        title="Plot Inventory"
        description="Every plot across projects with live availability."
        actions={<Button size="lg"><Plus className="size-4 mr-1.5" />Add plot</Button>}
      />
      <KpiStrip items={[
        { label: "Available", value: by("available"), tone: "emerald" },
        { label: "Blocked", value: by("blocked"), tone: "amber" },
        { label: "Booked", value: by("booked"), tone: "blue" },
        { label: "Sold", value: by("sold"), tone: "violet" },
      ]} />
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="hidden md:grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b bg-muted/40 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <div>Plot #</div><div>Project</div><div>Area</div><div>Price</div><div>Facing</div><div>Status</div>
        </div>
        {plots.length === 0 ? (
          <EmptyState icon={<LandPlot className="size-5" />} title="No plots yet" description="Add plots to a project to start managing inventory." />
        ) : (
          <ul className="divide-y">
            {plots.map((p: any) => (
              <li key={p.id} className="px-5 py-3 md:grid md:grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_1fr] md:gap-4 md:items-center flex flex-col gap-1 hover:bg-muted/30">
                <div className="font-medium tabular-nums">{p.plot_number}</div>
                <div className="text-sm text-muted-foreground truncate">{p.projects?.name ?? "—"}</div>
                <div className="text-sm tabular-nums">{Number(p.area_sqft).toLocaleString("en-IN")} sqft</div>
                <div className="text-sm tabular-nums font-medium">{inr(Number(p.total_price))}</div>
                <div className="text-xs capitalize text-muted-foreground">{p.facing?.replace("_", "-") ?? "—"}</div>
                <div>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${STATUS_TONE[p.status]}`}>
                    {p.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
