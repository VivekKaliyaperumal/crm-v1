import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  getLead,
  addLeadNote,
  changeLeadStatus,
  assignLead,
  autoAssignLead,
} from "@/lib/leads.functions";
import { listOrgUsers } from "@/lib/users.functions";
import { createFollowUp, completeFollowUp } from "@/lib/followups.functions";
import { scheduleVisit, completeVisit } from "@/lib/visits.functions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/crm/StatusBadge";
import {
  ALL_STATUSES,
  STATUS_LABEL,
  isManager,
  type LeadStatus,
} from "@/lib/permissions";
import { useMe } from "@/hooks/use-me";
import { toast } from "sonner";

const leadOptions = (id: string) =>
  queryOptions({
    queryKey: ["lead", id],
    queryFn: () => getLead({ data: { id } }),
  });

const usersOptions = queryOptions({
  queryKey: ["users"],
  queryFn: () => listOrgUsers(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/_authenticated/app/leads/$leadId")({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(leadOptions(params.leadId)),
      context.queryClient.ensureQueryData(usersOptions),
    ]),
  component: LeadDetail,
  errorComponent: ({ error }) => (
    <div className="text-destructive text-sm">{error.message}</div>
  ),
  notFoundComponent: () => <div>Lead not found.</div>,
});

function LeadDetail() {
  const { leadId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(leadOptions(leadId));
  const { data: users } = useSuspenseQuery(usersOptions);
  const { data: me } = useMe();

  const lead = data.lead;
  const userMap = Object.fromEntries(
    users.map((u) => [u.id, u.full_name ?? u.email ?? "User"]),
  );

  const addNote = useServerFn(addLeadNote);
  const changeStatus = useServerFn(changeLeadStatus);
  const assign = useServerFn(assignLead);
  const autoAssign = useServerFn(autoAssignLead);
  const createFu = useServerFn(createFollowUp);
  const completeFu = useServerFn(completeFollowUp);
  const scheduleV = useServerFn(scheduleVisit);
  const completeV = useServerFn(completeVisit);

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["lead", leadId] });
    qc.invalidateQueries({ queryKey: ["leads"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <Link
        to="/app/leads"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Back to leads
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{lead.full_name}</h1>
          <p className="text-sm text-muted-foreground">
            {lead.phone} {lead.email && `· ${lead.email}`}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <StatusBadge status={lead.status as LeadStatus} />
            <span className="text-xs text-muted-foreground">
              Source: {String(lead.source).replace(/_/g, " ")}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={lead.status as string}
            onValueChange={async (v) => {
              await changeStatus({ data: { id: leadId, status: v as any } });
              invalidate();
              toast.success("Status updated.");
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isManager(me.roles) && (
            <>
              <Select
                value={(lead.assigned_to as string) ?? ""}
                onValueChange={async (v) => {
                  await assign({
                    data: { id: leadId, user_id: v || null },
                  });
                  invalidate();
                  toast.success("Reassigned.");
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name ?? u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={async () => {
                  await autoAssign({ data: { id: leadId } });
                  invalidate();
                  toast.success("Auto-assigned via round-robin.");
                }}
              >
                Round-robin
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Lead info</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <Row label="Interest" value={lead.property_interest} />
            <Row
              label="Budget"
              value={
                lead.budget_min || lead.budget_max
                  ? `₹${Number(lead.budget_min ?? 0).toLocaleString()} – ₹${Number(lead.budget_max ?? 0).toLocaleString()}`
                  : "—"
              }
            />
            <Row label="Timeline" value={lead.timeline} />
            <Row
              label="Assigned to"
              value={userMap[lead.assigned_to as string] ?? "Unassigned"}
            />
            <Row
              label="Created"
              value={new Date(lead.created_at).toLocaleString()}
            />
            <Row label="Notes" value={lead.notes} />
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="followups">
                Follow-ups ({data.followups.length})
              </TabsTrigger>
              <TabsTrigger value="visits">
                Visits ({data.visits.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="timeline" className="space-y-3">
              <Card>
                <CardContent className="pt-4">
                  <form
                    className="flex gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const text = String(fd.get("text") || "").trim();
                      if (!text) return;
                      await addNote({
                        data: { lead_id: leadId, text, kind: "note" },
                      });
                      (e.currentTarget as HTMLFormElement).reset();
                      invalidate();
                    }}
                  >
                    <Input name="text" placeholder="Log a note or call summary…" />
                    <Button type="submit">Add</Button>
                  </form>
                </CardContent>
              </Card>
              <div className="space-y-2">
                {data.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No activity yet.
                  </p>
                ) : (
                  data.activities.map((a) => (
                    <Card key={a.id}>
                      <CardContent className="py-3 text-sm">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="capitalize">
                            {String(a.type).replace(/_/g, " ")} ·{" "}
                            {userMap[a.actor_id as string] ?? "System"}
                          </span>
                          <span>
                            {new Date(a.occurred_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-1">{renderActivity(a, userMap)}</div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="followups" className="space-y-3">
              <Card>
                <CardContent className="pt-4">
                  <form
                    className="grid sm:grid-cols-3 gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      await createFu({
                        data: {
                          lead_id: leadId,
                          due_at: new Date(
                            String(fd.get("due_at")),
                          ).toISOString(),
                          priority: String(fd.get("priority") || "medium") as any,
                          notes: String(fd.get("notes") || ""),
                        },
                      });
                      (e.currentTarget as HTMLFormElement).reset();
                      invalidate();
                      toast.success("Follow-up scheduled.");
                    }}
                  >
                    <Input
                      type="datetime-local"
                      name="due_at"
                      required
                      defaultValue={defaultLocalDt(1)}
                    />
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit">Schedule</Button>
                    <Input
                      name="notes"
                      placeholder="What to discuss…"
                      className="sm:col-span-3"
                    />
                  </form>
                </CardContent>
              </Card>
              {data.followups.map((f) => (
                <Card key={f.id}>
                  <CardContent className="py-3 text-sm flex justify-between items-center gap-3 flex-wrap">
                    <div>
                      <div className="font-medium">
                        {new Date(f.due_at).toLocaleString()} · {f.priority}
                      </div>
                      <div className="text-muted-foreground">{f.notes}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        Status: {f.status}
                      </div>
                    </div>
                    {f.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await completeFu({ data: { id: f.id } });
                          invalidate();
                        }}
                      >
                        Mark done
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="visits" className="space-y-3">
              <Card>
                <CardContent className="pt-4">
                  <form
                    className="grid sm:grid-cols-3 gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      await scheduleV({
                        data: {
                          lead_id: leadId,
                          scheduled_at: new Date(
                            String(fd.get("scheduled_at")),
                          ).toISOString(),
                          location: String(fd.get("location")),
                          notes: String(fd.get("notes") || ""),
                        },
                      });
                      (e.currentTarget as HTMLFormElement).reset();
                      invalidate();
                      toast.success("Site visit scheduled.");
                    }}
                  >
                    <Input
                      type="datetime-local"
                      name="scheduled_at"
                      required
                      defaultValue={defaultLocalDt(2)}
                    />
                    <Input name="location" placeholder="Location" required />
                    <Button type="submit">Schedule visit</Button>
                    <Input
                      name="notes"
                      placeholder="Notes"
                      className="sm:col-span-3"
                    />
                  </form>
                </CardContent>
              </Card>
              {data.visits.map((v) => (
                <Card key={v.id}>
                  <CardContent className="py-3 text-sm space-y-2">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div>
                        <div className="font-medium">
                          {new Date(v.scheduled_at).toLocaleString()}
                        </div>
                        <div className="text-muted-foreground">
                          {v.location}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          Status: {v.status}
                        </div>
                      </div>
                      {v.status === "scheduled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const fb = window.prompt("Feedback?", "") ?? "";
                            const next = window.prompt("Next step?", "") ?? "";
                            await completeV({
                              data: {
                                id: v.id,
                                feedback: fb,
                                next_step: next,
                              },
                            });
                            invalidate();
                          }}
                        >
                          Mark completed
                        </Button>
                      )}
                    </div>
                    {v.post_report &&
                      Object.keys(v.post_report as any).length > 0 && (
                        <pre className="text-xs bg-muted/50 rounded p-2 whitespace-pre-wrap">
                          {JSON.stringify(v.post_report, null, 2)}
                        </pre>
                      )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value ?? "—"}</span>
    </div>
  );
}

function defaultLocalDt(daysAhead: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(10, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

function renderActivity(a: any, userMap: Record<string, string>) {
  const p = a.payload ?? {};
  switch (a.type) {
    case "status_change":
      return (
        <span>
          Status changed from <b>{p.from}</b> to <b>{p.to}</b>
          {p.note ? ` — ${p.note}` : ""}
        </span>
      );
    case "assignment":
      return (
        <span>
          Assigned to <b>{userMap[p.to] ?? p.to ?? "—"}</b>
          {p.mode ? ` (${p.mode})` : ""}
        </span>
      );
    case "note":
    case "call":
    case "email":
      return <span>{p.text ?? p.summary ?? ""}</span>;
    default:
      return <span>{JSON.stringify(p)}</span>;
  }
}