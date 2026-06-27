import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getDashboard } from "@/lib/dashboard.functions";
import { STATUS_LABEL, type LeadStatus } from "@/lib/permissions";

const dashOptions = queryOptions({
  queryKey: ["dashboard"],
  queryFn: () => getDashboard(),
});

export const Route = createFileRoute("/_authenticated/app/reports")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashOptions),
  component: ReportsPage,
  errorComponent: ({ error }) => (
    <div className="text-destructive text-sm">{error.message}</div>
  ),
  notFoundComponent: () => <div>Not found</div>,
});

function ReportsPage() {
  const { data } = useSuspenseQuery(dashOptions);
  const statusMax = Math.max(
    ...Object.values(data.statusCounts).map((n) => Number(n) || 0),
    1,
  );
  const sourceMax = Math.max(
    ...Object.values(data.sourceCounts).map((n) => Number(n) || 0),
    1,
  );
  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Analytics
        </div>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Reports
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Pipeline, source mix, and executive performance at a glance.
        </p>
      </header>
      <div className="grid md:grid-cols-2 gap-5">
        <ReportPanel title="Status funnel">
          <BarList
            items={Object.entries(data.statusCounts).map(([k, v]) => ({
              label: STATUS_LABEL[k as LeadStatus] ?? k,
              value: Number(v),
            }))}
            max={statusMax}
          />
        </ReportPanel>
        <ReportPanel title="Source mix">
          <BarList
            items={Object.entries(data.sourceCounts).map(([k, v]) => ({
              label: k.replace(/_/g, " "),
              value: Number(v),
            }))}
            max={sourceMax}
            capitalize
          />
        </ReportPanel>
        <ReportPanel title="Executive leaderboard" className="md:col-span-2">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-1 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <div>Executive</div>
            <div className="text-right">Total leads</div>
            <div className="text-right">Closed won</div>
            <div className="text-right">Conversion</div>
          </div>
          <ul className="divide-y">
            {data.leaderboard.map((r) => {
              const pct = r.total ? Math.round((r.won / r.total) * 100) : 0;
              return (
                <li
                  key={r.user_id}
                  className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 py-3 items-center text-sm"
                >
                  <div className="font-medium col-span-2 md:col-span-1">{r.name}</div>
                  <div className="text-right tabular-nums text-muted-foreground">
                    {r.total}
                  </div>
                  <div className="text-right tabular-nums font-medium">{r.won}</div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium tabular-nums">
                      {pct}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </ReportPanel>
      </div>
    </div>
  );
}

function ReportPanel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border bg-card p-6 shadow-sm ${className}`}
    >
      <h2 className="font-display text-lg font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}

function BarList({
  items,
  max,
  capitalize = false,
}: {
  items: { label: string; value: number }[];
  max: number;
  capitalize?: boolean;
}) {
  if (items.length === 0)
    return <p className="text-sm text-muted-foreground">No data.</p>;
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className={capitalize ? "capitalize" : ""}>{it.label}</span>
            <span className="tabular-nums font-medium">{it.value}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary/70 to-primary/30"
              style={{ width: `${(it.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}