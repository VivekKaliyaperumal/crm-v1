import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const priority = z.enum(["low", "medium", "high"] as const);
const status = z.enum(["pending", "completed", "cancelled"] as const);

async function requireOrg(supabase: any, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", userId)
    .maybeSingle();
  if (!data?.org_id) throw new Error("No organization.");
  return data.org_id as string;
}

export const listFollowUps = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        scope: z.enum(["today", "week", "overdue", "all"]).default("all"),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("follow_ups")
      .select("*, leads(full_name, phone, status)")
      .eq("status", "pending")
      .order("due_at", { ascending: true })
      .limit(200);
    const now = new Date();
    if (data.scope === "today") {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      q = q.lte("due_at", end.toISOString()).gte(
        "due_at",
        new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
      );
    } else if (data.scope === "week") {
      const end = new Date(now);
      end.setDate(now.getDate() + 7);
      q = q.lte("due_at", end.toISOString());
    } else if (data.scope === "overdue") {
      q = q.lt("due_at", now.toISOString());
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        lead_id: z.string().uuid(),
        due_at: z.string(),
        priority: priority.default("medium"),
        notes: z.string().max(500).optional(),
        assigned_to: z.string().uuid().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const orgId = await requireOrg(supabase, userId);
    const { data: lead } = await supabase
      .from("leads")
      .select("assigned_to")
      .eq("id", data.lead_id)
      .maybeSingle();
    const { error } = await supabase.from("follow_ups").insert({
      org_id: orgId,
      lead_id: data.lead_id,
      due_at: data.due_at,
      priority: data.priority,
      notes: data.notes ?? null,
      assigned_to: data.assigned_to ?? lead?.assigned_to ?? userId,
      created_by: userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const completeFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        outcome: z.string().max(500).optional(),
        next_status: status.default("completed"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("follow_ups")
      .update({
        status: data.next_status,
        outcome: data.outcome ?? null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });