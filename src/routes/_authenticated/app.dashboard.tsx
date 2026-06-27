import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getDashboard } from "@/lib/dashboard.functions";
import { KpiCard } from "@/components/crm/KpiCard";
import {
  Users,
  Calendar,
  PhoneCall,
  MapPin,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { STATUS_LABEL, type LeadStatus } from "@/lib/permissions";

const dashOptions = queryOptions({
  queryKey: ["dashboard"],
  queryFn: () => getDashboard(),
  refetchInterval: 30_000,
});

export const Route = createFileRoute("/_authenticated/app/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashOptions),
  component: Dashboard,
  errorComponent: ({ error }) => (
    <div className="text-destructive text-sm">{error.message}</div>
  ),
  notFoundComponent: () => <div>Not found</div>,
});

const PIE_COLORS = [
  "#3b82f6",
  "#1e40af",
  "#0ea5e9",
  "#6366f1",
  "#0891b2",
  "#94a3b8",
];

function Dashboard() {
  const { data } = useSuspenseQuery(dashOptions);
  const k = data.kpis;
  const statusData = Object.entries(data.statusCounts).map(([k, v]) => ({
    name: STATUS_LABEL[k as LeadStatus] ?? k,
    value: v,
  }));
  const sourceData = Object.entries(data.sourceCounts).map(([k, v]) => ({
    name: k.replace(/_/g, " "),
    value: v,
  }));
  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Overview
        </div>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Live across your organization · auto-refreshes every 30 seconds.
        </p>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="Total leads"
          value={k.totalLeads}
          icon={<Users className="size-4" />}
        />
        <KpiCard
          label="New this week"
          value={k.newThisWeek}
          hint={`${k.newThisMonth} this month`}
          icon={<TrendingUp className="size-4" />}
        />
        <KpiCard
          label="Follow-ups today"
          value={k.followupsToday}
          hint={`${k.followupsThisWeek} this week`}
          icon={<PhoneCall className="size-4" />}
        />
        <KpiCard
          label="Visits next 7 days"
          value={k.visitsNext7Days}
          icon={<MapPin className="size-4" />}
        />
        <KpiCard
          label="Closed won"
          value={k.closedWon}
          icon={<Trophy className="size-4" />}
        />
        <KpiCard
          label="Conversion"
          value={`${k.conversionPct}%`}
          hint="Closed won / advanced funnel"
          icon={<Calendar className="size-4" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-lg">Leads · last 30 days</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.overTime}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(d) => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-lg">Status funnel</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10 }}
                  width={130}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-lg">Lead sources</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                  label
                >
                  {sourceData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-lg">Executive leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            {data.leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.leaderboard.map((row, i) => {
                  const max = Math.max(...data.leaderboard.map((r) => r.total), 1);
                  const pct = (row.total / max) * 100;
                  return (
                    <li key={row.user_id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="size-5 rounded-full bg-muted grid place-items-center text-[10px] font-semibold text-muted-foreground tabular-nums">
                            {i + 1}
                          </span>
                          <span className="font-medium">{row.name}</span>
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {row.won}<span className="opacity-50">/{row.total}</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/60"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}