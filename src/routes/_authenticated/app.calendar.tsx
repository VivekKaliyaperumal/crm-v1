import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listTasks } from "@/lib/tasks.functions";
import { PageHeader } from "@/components/crm/PageHeader";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const opts = queryOptions({ queryKey: ["tasks"], queryFn: () => listTasks({ data: {} }) });

export const Route = createFileRoute("/_authenticated/app/calendar")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: CalendarPage,
  errorComponent: ({ error }) => <div className="text-destructive text-sm">{error.message}</div>,
});

function CalendarPage() {
  const { data: tasks } = useSuspenseQuery(opts);
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7) cells.push(null);

  const tasksByDay: Record<number, any[]> = {};
  tasks.forEach((t: any) => {
    if (!t.due_at) return;
    const d = new Date(t.due_at);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      (tasksByDay[day] ??= []).push(t);
    }
  });

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Activities" title="Calendar" description="Tasks, follow-ups and site visits at a glance." />
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-display text-xl font-semibold">
            {cursor.toLocaleString("default", { month: "long" })} {year}
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="size-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); }}>Today</Button>
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="size-4" /></Button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="px-3 py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 auto-rows-[110px]">
          {cells.map((day, i) => {
            const today = day && new Date().getFullYear() === year && new Date().getMonth() === month && new Date().getDate() === day;
            const items = day ? tasksByDay[day] ?? [] : [];
            return (
              <div key={i} className="border-r border-b p-2 last:border-r-0 overflow-hidden">
                {day && (
                  <>
                    <div className={`text-xs font-medium tabular-nums ${today ? "size-6 grid place-items-center rounded-full bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{day}</div>
                    <div className="mt-1 space-y-0.5">
                      {items.slice(0, 3).map((t: any) => (
                        <div key={t.id} className="text-[10px] truncate rounded px-1 py-0.5 bg-primary/10 text-primary">{t.title}</div>
                      ))}
                      {items.length > 3 && <div className="text-[10px] text-muted-foreground">+{items.length - 3} more</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
