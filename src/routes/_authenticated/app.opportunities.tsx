import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listOpportunities } from "@/lib/opportunities.functions";
import { PageHeader } from "@/components/crm/PageHeader";
import { KpiStrip } from "@/components/crm/KpiStrip";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";

const opts = queryOptions({ queryKey: ["opps"], queryFn: () => listOpportunities() });

export const Route = createFileRoute("/_authenticated/app/opportunities")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: OppsPage,
  errorComponent: ({ error }) => <div className="text-destructive text-sm">{error.message}</div>,
});

const STAGES = [
  { key: "qualification", label: "Qualification", tone: "border-t-slate-400" },
  { key: "proposal", label: "Proposal", tone: "border-t-blue-500" },
  { key: "negotiation", label: "Negotiation", tone: "border-t-amber-500" },
  { key: "closed_won", label: "Closed Won", tone: "border-t-emerald-500" },
  { key: "closed_lost", label: "Closed Lost", tone: "border-t-rose-500" },
];

function OppsPage() {
  const { data: opps } = useSuspenseQuery(opts);
  const total = opps.reduce((s: number, o: any) => s + Number(o.value), 0);
  const won = opps.filter((o: any) => o.stage === "closed_won").reduce((s: number, o: any) => s + Number(o.value), 0);
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sales" title="Opportunities"
        description="Pipeline of qualified deals across your team."
        actions={<Button size="lg"><Plus className="size-4 mr-1.5" />New opportunity</Button>}
      />
      <KpiStrip items={[
        { label: "In pipeline", value: opps.length, tone: "slate" },
        { label: "Pipeline value", value: inr(total), tone: "blue" },
        { label: "Won value", value: inr(won), tone: "emerald" },
        { label: "Win rate", value: opps.length ? `${Math.round((opps.filter((o:any)=>o.stage==="closed_won").length / opps.length) * 100)}%` : "0%", tone: "violet" },
      ]} />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAGES.map((s) => {
          const items = opps.filter((o: any) => o.stage === s.key);
          const subtotal = items.reduce((sum: number, o: any) => sum + Number(o.value), 0);
          return (
            <div key={s.key} className={`rounded-xl border-t-4 ${s.tone} bg-card border shadow-sm flex flex-col min-h-[200px]`}>
              <div className="p-3 border-b">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-sm font-medium tabular-nums">{items.length}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{inr(subtotal)}</span>
                </div>
              </div>
              <div className="p-2 space-y-2 flex-1 max-h-[60vh] overflow-y-auto">
                {items.length === 0 && <div className="text-[11px] text-muted-foreground/60 px-2 py-4 text-center">No deals</div>}
                {items.map((o: any) => (
                  <div key={o.id} className="rounded-lg border bg-background p-3 hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="text-sm font-medium truncate">{o.title}</div>
                    {o.leads?.full_name && <div className="text-xs text-muted-foreground truncate mt-0.5">{o.leads.full_name}</div>}
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-semibold tabular-nums">{inr(Number(o.value))}</span>
                      <span className="text-muted-foreground tabular-nums">{o.probability}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
