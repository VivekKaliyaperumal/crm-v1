import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const visitStatus = z.enum([
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
] as const);

async function requireOrg(supabase: any, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", userId)
    .maybeSingle();
  if (!data?.org_id) throw new Error("No organization.");
  return data.org_id as string;
}

export const listVisits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({ scope: z.enum(["upcoming", "past", "all"]).default("upcoming") })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("site_visits")
      .select("*, leads(full_name, phone, status)")
      .order("scheduled_at", { ascending: data.scope !== "past" })
      .limit(200);
    const nowIso = new Date().toISOString();
    if (data.scope === "upcoming") q = q.gte("scheduled_at", nowIso);
    if (data.scope === "past") q = q.lt("scheduled_at", nowIso);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const scheduleVisit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        lead_id: z.string().uuid(),
        scheduled_at: z.string(),
        location: z.string().trim().min(1).max(200),
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
    const { error } = await supabase.from("site_visits").insert({
      org_id: orgId,
      lead_id: data.lead_id,
      scheduled_at: data.scheduled_at,
      location: data.location,
      notes: data.notes ?? null,
      assigned_to: data.assigned_to ?? lead?.assigned_to ?? userId,
      created_by: userId,
      pre_checklist: ["ID proof", "Brochure", "Site map", "Drinking water"],
    });
    if (error) throw new Error(error.message);
    // Auto-bump lead status
    await supabase
      .from("leads")
      .update({
        status: "site_visit_scheduled",
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", data.lead_id);
    return { ok: true };
  });

export const completeVisit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        feedback: z.string().max(1000).optional(),
        next_step: z.string().max(300).optional(),
        status: visitStatus.default("completed"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: v } = await supabase
      .from("site_visits")
      .select("lead_id")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await supabase
      .from("site_visits")
      .update({
        status: data.status,
        post_report: {
          feedback: data.feedback ?? null,
          next_step: data.next_step ?? null,
        },
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    if (v?.lead_id && data.status === "completed") {
      await supabase
        .from("leads")
        .update({
          status: "site_visit_completed",
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", v.lead_id);
    }
    return { ok: true };
  });