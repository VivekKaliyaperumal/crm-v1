import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { listFollowUps, completeFollowUp } from "@/lib/followups.functions";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Clock, AlertTriangle, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";

const fuOptions = (scope: "today" | "week" | "overdue" | "all") =>
  queryOptions({
    queryKey: ["followups", scope],
    queryFn: () => listFollowUps({ data: { scope } }),
  });

export const Route = createFileRoute("/_authenticated/app/follow-ups")({
  loader: ({ context }) => context.queryClient.ensureQueryData(fuOptions("today")),
  component: FollowUpsPage,
  errorComponent: ({ error }) => (
    <div className="text-destructive text-sm">{error.message}</div>
  ),
  notFoundComponent: () => <div>Not found</div>,
});

function FollowUpsPage() {
  const [scope, setScope] = useState<"today" | "week" | "overdue" | "all">(
    "today",
  );
  const { data } = useSuspenseQuery(fuOptions(scope));
  const qc = useQueryClient();
  const complete = useServerFn(completeFollowUp);

  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Outreach
        </div>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Follow-ups
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Calls and check-ins assigned to your scope.
        </p>
      </header>
      <Tabs value={scope} onValueChange={(v) => setScope(v as any)}>
        <TabsList className="bg-muted/60">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This week</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value={scope} className="mt-5 rounded-2xl border bg-card overflow-hidden shadow-sm">
          {data.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto size-12 rounded-full bg-muted grid place-items-center text-muted-foreground">
                <PhoneCall className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">All clear</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No follow-ups in this view.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {data.map((f: any) => {
                const overdue = new Date(f.due_at) < new Date();
                return (
                  <li
                    key={f.id}
                    className="px-5 py-4 flex flex-wrap gap-4 items-start justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex gap-3 min-w-0">
                      <div
                        className={cn(
                          "size-9 shrink-0 rounded-full grid place-items-center",
                          overdue
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {overdue ? (
                          <AlertTriangle className="size-4" />
                        ) : (
                          <Clock className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to="/app/leads/$leadId"
                          params={{ leadId: f.lead_id }}
                          className="font-medium hover:underline"
                        >
                          {f.leads?.full_name ?? "Lead"}
                        </Link>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {f.leads?.phone}
                        </div>
                        <div className="text-xs mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="text-muted-foreground">Due</span>
                          <span
                            className={cn(
                              "tabular-nums",
                              overdue ? "text-destructive font-medium" : "text-foreground",
                            )}
                          >
                            {new Date(f.due_at).toLocaleString()}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            {f.priority}
                          </span>
                        </div>
                        {f.notes && (
                          <div className="text-xs text-muted-foreground mt-1.5 max-w-xl">
                            {f.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await complete({ data: { id: f.id } });
                        qc.invalidateQueries({ queryKey: ["followups"] });
                        qc.invalidateQueries({ queryKey: ["dashboard"] });
                        toast.success("Done.");
                      }}
                    >
                      <Check className="size-4 mr-1" />
                      Done
                    </Button>
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