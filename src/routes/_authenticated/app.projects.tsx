import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listProjects } from "@/lib/projects.functions";
import { PageHeader } from "@/components/crm/PageHeader";
import { KpiStrip } from "@/components/crm/KpiStrip";
import { EmptyState } from "@/components/crm/EmptyState";
import { Building2, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const opts = queryOptions({ queryKey: ["projects"], queryFn: () => listProjects() });

export const Route = createFileRoute("/_authenticated/app/projects")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: ProjectsPage,
  errorComponent: ({ error }) => <div className="text-destructive text-sm">{error.message}</div>,
});

const STATUS_TONE: Record<string, string> = {
  planning: "bg-slate-100 text-slate-700 border-slate-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  on_hold: "bg-amber-50 text-amber-800 border-amber-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  archived: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

function ProjectsPage() {
  const { data: projects } = useSuspenseQuery(opts);
  const active = projects.filter((p: any) => p.status === "active").length;
  const planning = projects.filter((p: any) => p.status === "planning").length;
  const totalArea = projects.reduce((s: number, p: any) => s + Number(p.total_area_sqft ?? 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Inventory"
        title="Projects"
        description="Farm land developments across your portfolio."
        actions={<Button size="lg"><Plus className="size-4 mr-1.5" />New project</Button>}
      />
      <KpiStrip items={[
        { label: "Total projects", value: projects.length, tone: "slate" },
        { label: "Active", value: active, tone: "emerald" },
        { label: "Planning", value: planning, tone: "blue" },
        { label: "Total area", value: `${(totalArea / 43560).toFixed(1)} ac`, tone: "violet" },
      ]} />
      {projects.length === 0 ? (
        <div className="rounded-2xl border bg-card">
          <EmptyState icon={<Building2 className="size-5" />} title="No projects yet" description="Create your first project to start tracking plots and inventory." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p: any) => {
            const plotCount = p.plots?.[0]?.count ?? 0;
            return (
              <div key={p.id} className="rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative">
                  {p.cover_image_url && (
                    <img src={p.cover_image_url} alt="" className="w-full h-full object-cover" />
                  )}
                  <span className={`absolute top-3 right-3 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${STATUS_TONE[p.status] ?? STATUS_TONE.planning}`}>
                    {p.status?.replace("_", " ")}
                  </span>
                </div>
                <div className="p-4">
                  <div className="font-display text-lg font-semibold tracking-tight truncate">{p.name}</div>
                  {p.location && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground truncate">
                      <MapPin className="size-3" />{p.location}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span><span className="font-semibold text-foreground tabular-nums">{plotCount}</span> plots</span>
                    {p.total_area_sqft && (
                      <span><span className="font-semibold text-foreground tabular-nums">{Number(p.total_area_sqft).toLocaleString("en-IN")}</span> sqft</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
