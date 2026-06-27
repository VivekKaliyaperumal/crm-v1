import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfWeek = new Date(startOfDay);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [
      totalLeads,
      newWeek,
      newMonth,
      followupsToday,
      followupsWeek,
      visitsUpcoming,
      closedWon,
      negotiationPlus,
      leadsByStatus,
      leadsBySource,
      leadsByExec,
      leadsByDay,
    ] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfWeek.toISOString()),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString()),
      supabase
        .from("follow_ups")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .gte("due_at", startOfDay.toISOString())
        .lt("due_at", endOfDay.toISOString()),
      supabase
        .from("follow_ups")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .gte("due_at", startOfDay.toISOString())
        .lt("due_at", endOfWeek.toISOString()),
      supabase
        .from("site_visits")
        .select("id", { count: "exact", head: true })
        .eq("status", "scheduled")
        .gte("scheduled_at", now.toISOString())
        .lt("scheduled_at", endOfWeek.toISOString()),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "closed_won"),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .in("status", ["negotiation", "booking", "closed_won", "closed_lost"]),
      supabase.from("leads").select("status"),
      supabase.from("leads").select("source"),
      supabase.from("leads").select("assigned_to, status"),
      supabase
        .from("leads")
        .select("created_at")
        .gte("created_at", new Date(now.getTime() - 30 * 86400000).toISOString()),
    ]);

    // Aggregate
    const statusCounts: Record<string, number> = {};
    (leadsByStatus.data ?? []).forEach((r: { status: string }) => {
      statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
    });
    const sourceCounts: Record<string, number> = {};
    (leadsBySource.data ?? []).forEach((r: { source: string }) => {
      sourceCounts[r.source] = (sourceCounts[r.source] ?? 0) + 1;
    });
    const execMap: Record<string, { total: number; won: number }> = {};
    (leadsByExec.data ?? []).forEach(
      (r: { assigned_to: string | null; status: string }) => {
        if (!r.assigned_to) return;
        execMap[r.assigned_to] = execMap[r.assigned_to] ?? { total: 0, won: 0 };
        execMap[r.assigned_to].total++;
        if (r.status === "closed_won") execMap[r.assigned_to].won++;
      },
    );
    const execIds = Object.keys(execMap);
    let execNames: Record<string, string> = {};
    if (execIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", execIds);
      (profs ?? []).forEach((p: any) => {
        execNames[p.id] = p.full_name ?? p.email ?? "User";
      });
    }
    const leaderboard = execIds
      .map((id) => ({
        user_id: id,
        name: execNames[id] ?? "User",
        total: execMap[id].total,
        won: execMap[id].won,
      }))
      .sort((a, b) => b.total - a.total);

    // Leads-per-day for last 30 days
    const dayMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      dayMap[k] = 0;
    }
    (leadsByDay.data ?? []).forEach((r: { created_at: string }) => {
      const k = r.created_at.slice(0, 10);
      if (k in dayMap) dayMap[k]++;
    });
    const overTime = Object.entries(dayMap).map(([date, count]) => ({
      date,
      count,
    }));

    const total = totalLeads.count ?? 0;
    const negPlus = negotiationPlus.count ?? 0;
    const won = closedWon.count ?? 0;
    const conversion = negPlus > 0 ? Math.round((won / negPlus) * 100) : 0;

    return {
      kpis: {
        totalLeads: total,
        newThisWeek: newWeek.count ?? 0,
        newThisMonth: newMonth.count ?? 0,
        followupsToday: followupsToday.count ?? 0,
        followupsThisWeek: followupsWeek.count ?? 0,
        visitsNext7Days: visitsUpcoming.count ?? 0,
        closedWon: won,
        conversionPct: conversion,
      },
      statusCounts,
      sourceCounts,
      leaderboard,
      overTime,
    };
  });