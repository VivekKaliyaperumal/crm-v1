import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listTasks, toggleTask } from "@/lib/tasks.functions";
import { PageHeader } from "@/components/crm/PageHeader";
import { KpiStrip } from "@/components/crm/KpiStrip";
import { EmptyState } from "@/components/crm/EmptyState";
import { ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const opts = queryOptions({ queryKey: ["tasks"], queryFn: () => listTasks({ data: {} }) });

export const Route = createFileRoute("/_authenticated/app/tasks")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: TasksPage,
  errorComponent: ({ error }) => <div className="text-destructive text-sm">{error.message}</div>,
});

const PRIORITY: Record<string, string> = {
  urgent: "bg-rose-50 text-rose-700 border-rose-200",
  high: "bg-amber-50 text-amber-800 border-amber-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  low: "bg-slate-100 text-slate-700 border-slate-200",
};

function TasksPage() {
  const { data: tasks } = useSuspenseQuery(opts);
  const qc = useQueryClient();
  const toggle = useServerFn(toggleTask);
  const m = useMutation({ mutationFn: toggle, onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }) });
  const open = tasks.filter((t: any) => t.status === "open" || t.status === "in_progress");
  const overdue = open.filter((t: any) => t.due_at && new Date(t.due_at) < new Date()).length;
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Activities" title="Tasks"
        description="Everything that needs doing today, this week, and beyond."
        actions={<Button size="lg"><Plus className="size-4 mr-1.5" />New task</Button>} />
      <KpiStrip items={[
        { label: "Open", value: open.length, tone: "blue" },
        { label: "Overdue", value: overdue, tone: "rose" },
        { label: "Done this week", value: tasks.filter((t: any) => t.status === "done" && t.completed_at && new Date(t.completed_at) > new Date(Date.now() - 7 * 86400_000)).length, tone: "emerald" },
        { label: "Total", value: tasks.length, tone: "slate" },
      ]} />
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        {tasks.length === 0 ? (
          <EmptyState icon={<ListTodo className="size-5" />} title="No tasks yet" description="Create your first task to start tracking work." />
        ) : (
          <ul className="divide-y">
            {tasks.map((t: any) => {
              const done = t.status === "done";
              return (
                <li key={t.id} className="px-5 py-4 flex items-start gap-4 hover:bg-muted/30">
                  <Checkbox checked={done} onCheckedChange={(v) => m.mutate({ data: { id: t.id, done: !!v } })} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${done ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                    {t.description && <div className="text-xs text-muted-foreground mt-0.5 truncate">{t.description}</div>}
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                      {t.due_at && <span className="tabular-nums">Due {new Date(t.due_at).toLocaleDateString()}</span>}
                      {}
                      {t.leads?.full_name && <span>· {t.leads.full_name}</span>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${PRIORITY[t.priority]}`}>{t.priority}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
