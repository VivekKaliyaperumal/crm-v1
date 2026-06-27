import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { listVisits, completeVisit } from "@/lib/visits.functions";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { MapPin, CalendarDays, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const opts = (scope: "upcoming" | "past" | "all") =>
  queryOptions({
    queryKey: ["visits", scope],
    queryFn: () => listVisits({ data: { scope } }),
  });

export const Route = createFileRoute("/_authenticated/app/site-visits")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts("upcoming")),
  component: VisitsPage,
  errorComponent: ({ error }) => (
    <div className="text-destructive text-sm">{error.message}</div>
  ),
  notFoundComponent: () => <div>Not found</div>,
});

function VisitsPage() {
  const [scope, setScope] = useState<"upcoming" | "past" | "all">("upcoming");
  const { data } = useSuspenseQuery(opts(scope));
  const qc = useQueryClient();
  const complete = useServerFn(completeVisit);
  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Field
        </div>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Site Visits
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Scheduled walk-throughs and completed inspections.
        </p>
      </header>
      <Tabs value={scope} onValueChange={(v) => setScope(v as any)}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value={scope} className="mt-5 rounded-2xl border bg-card overflow-hidden shadow-sm">
          {data.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto size-12 rounded-full bg-muted grid place-items-center text-muted-foreground">
                <MapPin className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">No visits yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Visits scheduled with leads will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {data.map((v: any) => {
                const done = v.status !== "scheduled";
                return (
                  <li
                    key={v.id}
                    className="px-5 py-4 flex flex-wrap items-start justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex gap-3 min-w-0">
                      <div
                        className={cn(
                          "size-9 shrink-0 rounded-full grid place-items-center",
                          done
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <CalendarDays className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to="/app/leads/$leadId"
                          params={{ leadId: v.lead_id }}
                          className="font-medium hover:underline"
                        >
                          {v.leads?.full_name ?? "Lead"}
                        </Link>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {v.leads?.phone}
                        </div>
                        <div className="text-xs mt-1 text-foreground tabular-nums">
                          {new Date(v.scheduled_at).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3" />
                          {v.location}
                        </div>
                        <div className="mt-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground capitalize">
                          {v.status.replace(/_/g, " ")}
                        </div>
                      </div>
                    </div>
                    {v.status === "scheduled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const fb = window.prompt("Feedback?", "") ?? "";
                          const next = window.prompt("Next step?", "") ?? "";
                          await complete({
                            data: { id: v.id, feedback: fb, next_step: next },
                          });
                          qc.invalidateQueries({ queryKey: ["visits"] });
                          qc.invalidateQueries({ queryKey: ["dashboard"] });
                        }}
                      >
                        <CheckCircle2 className="size-4 mr-1" />
                        Mark completed
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}