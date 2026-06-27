import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listLeads } from "@/lib/leads.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { ALL_STATUSES, STATUS_LABEL, type LeadStatus } from "@/lib/permissions";
import { Plus, Search, Phone, ChevronRight, Users, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const leadsOptions = (filters: {
  search?: string;
  status?: LeadStatus[];
}) =>
  queryOptions({
    queryKey: ["leads", filters],
    queryFn: () => listLeads({ data: filters }),
  });

export const Route = createFileRoute("/_authenticated/app/leads")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(leadsOptions({})),
  component: LeadsPage,
  errorComponent: ({ error }) => (
    <div className="text-destructive text-sm">{error.message}</div>
  ),
  notFoundComponent: () => <div>Not found</div>,
});

function LeadsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const filters = {
    search: search || undefined,
    status: status === "all" ? undefined : [status],
  };
  const { data: leads } = useSuspenseQuery(leadsOptions(filters));

  // Lightweight summary chips derived client-side from filtered set
  const summary = useMemo(() => {
    const total = leads.length;
    const hot = leads.filter((l) =>
      ["interested", "negotiation", "booking"].includes(l.status as string),
    ).length;
    const won = leads.filter((l) => l.status === "closed_won").length;
    const fresh = leads.filter((l) => l.status === "new").length;
    return { total, hot, won, fresh };
  }, [leads]);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Pipeline
          </div>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Leads
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Every prospect across your land portfolio, in one ledger.
          </p>
        </div>
        <Link to="/app/leads/new">
          <Button size="lg" className="shadow-sm">
            <Plus className="size-4 mr-1.5" />
            New lead
          </Button>
        </Link>
      </header>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryChip label="In view" value={summary.total} tone="slate" />
        <SummaryChip label="Fresh" value={summary.fresh} tone="blue" />
        <SummaryChip label="Hot" value={summary.hot} tone="amber" />
        <SummaryChip label="Won" value={summary.won} tone="emerald" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 bg-background"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus | "all")}>
          <SelectTrigger className="w-full sm:w-[220px] h-11">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="hidden md:grid grid-cols-[2fr_1.2fr_1.5fr_1.2fr_1fr_auto] gap-4 px-5 py-3 border-b bg-muted/40 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <div>Lead</div>
          <div>Phone</div>
          <div>Interest</div>
          <div>Status</div>
          <div>Source</div>
          <div className="text-right">Last activity</div>
        </div>
        {leads.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y">
            {leads.map((lead) => {
              const initials = lead.full_name
                .split(/\s+/)
                .map((s) => s[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <li key={lead.id}>
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/app/leads/$leadId",
                        params: { leadId: lead.id },
                      })
                    }
                    className="group w-full text-left px-5 py-4 md:grid md:grid-cols-[2fr_1.2fr_1.5fr_1.2fr_1fr_auto] md:gap-4 md:items-center flex flex-col gap-2 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 grid place-items-center text-xs font-semibold text-primary">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{lead.full_name}</div>
                        <div className="text-xs text-muted-foreground truncate md:hidden">
                          {lead.phone} · {lead.property_interest}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
                      <Phone className="size-3.5 shrink-0" />
                      <span className="truncate tabular-nums">{lead.phone}</span>
                    </div>
                    <div className="hidden md:block text-sm text-muted-foreground truncate">
                      {lead.property_interest}
                    </div>
                    <div className="md:block">
                      <StatusBadge status={lead.status as LeadStatus} />
                    </div>
                    <div className="hidden md:block text-xs capitalize text-muted-foreground">
                      {lead.source.replace(/_/g, " ")}
                    </div>
                    <div className="hidden md:flex items-center justify-end gap-2 text-xs text-muted-foreground tabular-nums">
                      {new Date(lead.last_activity_at).toLocaleDateString()}
                      <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Outlet />
    </div>
  );
}

function SummaryChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "blue" | "amber" | "emerald";
}) {
  const toneMap = {
    slate: "from-slate-500/10 to-slate-500/0 text-slate-700",
    blue: "from-blue-500/15 to-blue-500/0 text-blue-700",
    amber: "from-amber-500/15 to-amber-500/0 text-amber-700",
    emerald: "from-emerald-500/15 to-emerald-500/0 text-emerald-700",
  } as const;
  return (
    <div className={`rounded-xl border bg-gradient-to-br ${toneMap[tone]} p-4`}>
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] opacity-70">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-semibold tabular-nums">
        {value}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto size-12 rounded-full bg-muted grid place-items-center text-muted-foreground">
        <Users className="size-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">No leads match</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Try clearing filters, or capture a new lead to get rolling.
      </p>
      <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="size-3.5" />
        Tip: use search to find by phone or email
      </div>
    </div>
  );
}