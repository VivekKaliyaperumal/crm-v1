import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { LeadSource, LeadStatus } from "./permissions";

const leadStatus = z.enum([
  "new",
  "contacted",
  "interested",
  "site_visit_scheduled",
  "site_visit_completed",
  "negotiation",
  "booking",
  "closed_won",
  "closed_lost",
  "not_interested",
  "future_follow_up",
] as const) satisfies z.ZodType<LeadStatus>;
const leadSource = z.enum([
  "manual",
  "web_form",
  "import",
  "referral",
  "walk_in",
  "other",
] as const) satisfies z.ZodType<LeadSource>;

async function requireOrg(supabase: any, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", userId)
    .maybeSingle();
  if (!data?.org_id) throw new Error("No organization.");
  return data.org_id as string;
}

export const listLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        search: z.string().optional(),
        status: z.array(leadStatus).optional(),
        source: z.array(leadSource).optional(),
        assignedTo: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(200).default(100),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("leads")
      .select(
        "id, full_name, phone, email, property_interest, budget_min, budget_max, source, status, assigned_to, created_by, last_activity_at, created_at",
      )
      .order("last_activity_at", { ascending: false })
      .limit(data.limit);

    if (data.search) {
      const s = `%${data.search}%`;
      q = q.or(
        `full_name.ilike.${s},phone.ilike.${s},email.ilike.${s},property_interest.ilike.${s}`,
      );
    }
    if (data.status?.length) q = q.in("status", data.status);
    if (data.source?.length) q = q.in("source", data.source);
    if (data.assignedTo) q = q.eq("assigned_to", data.assignedTo);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!lead) throw new Error("Lead not found");

    const [{ data: activities }, { data: followups }, { data: visits }] =
      await Promise.all([
        supabase
          .from("lead_activities")
          .select("id, type, payload, actor_id, occurred_at")
          .eq("lead_id", data.id)
          .order("occurred_at", { ascending: false }),
        supabase
          .from("follow_ups")
          .select("*")
          .eq("lead_id", data.id)
          .order("due_at", { ascending: true }),
        supabase
          .from("site_visits")
          .select("*")
          .eq("lead_id", data.id)
          .order("scheduled_at", { ascending: false }),
      ]);

    return {
      lead,
      activities: activities ?? [],
      followups: followups ?? [],
      visits: visits ?? [],
    };
  });

const leadInput = z.object({
  full_name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional().nullable(),
  email: z.string().trim().email().max(160).optional().or(z.literal("")).nullable(),
  property_interest: z.string().trim().max(200).optional().nullable(),
  budget_min: z.number().nonnegative().optional().nullable(),
  budget_max: z.number().nonnegative().optional().nullable(),
  timeline: z.string().max(80).optional().nullable(),
  source: leadSource.optional(),
  notes: z.string().max(2000).optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
});

export const createLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => leadInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const orgId = await requireOrg(supabase, userId);
    let assigned = data.assigned_to ?? null;
    if (!assigned) {
      assigned = await pickNextAssignee(supabase, orgId, userId);
    }
    const payload = {
      ...data,
      email: data.email || null,
      org_id: orgId,
      created_by: userId,
      assigned_to: assigned,
      source: data.source ?? "manual",
      status: "new" as const,
    };
    const { data: lead, error } = await supabase
      .from("leads")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("lead_activities").insert({
      org_id: orgId,
      lead_id: lead.id,
      type: "note",
      payload: { text: "Lead created" },
      actor_id: userId,
    });
    if (assigned) {
      await supabase.from("lead_activities").insert({
        org_id: orgId,
        lead_id: lead.id,
        type: "assignment",
        payload: { to: assigned },
        actor_id: userId,
      });
    }
    return { id: lead.id };
  });

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({ id: z.string().uuid() })
      .merge(leadInput.partial())
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const cleaned: Record<string, unknown> = { ...patch };
    if (cleaned.email === "") cleaned.email = null;
    const { error } = await context.supabase
      .from("leads")
      .update({ ...cleaned, last_activity_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const changeLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        status: leadStatus,
        note: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prev } = await supabase
      .from("leads")
      .select("status, org_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!prev) throw new Error("Lead not found");
    const { error } = await supabase
      .from("leads")
      .update({ status: data.status, last_activity_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabase.from("lead_activities").insert({
      org_id: prev.org_id,
      lead_id: data.id,
      type: "status_change",
      payload: { from: prev.status, to: data.status, note: data.note ?? null },
      actor_id: userId,
    });
    return { ok: true };
  });

export const assignLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        user_id: z.string().uuid().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: lead } = await supabase
      .from("leads")
      .select("org_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!lead) throw new Error("Lead not found");
    const { error } = await supabase
      .from("leads")
      .update({
        assigned_to: data.user_id,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabase.from("lead_activities").insert({
      org_id: lead.org_id,
      lead_id: data.id,
      type: "assignment",
      payload: { to: data.user_id },
      actor_id: userId,
    });
    return { ok: true };
  });

export const autoAssignLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: lead } = await supabase
      .from("leads")
      .select("org_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!lead) throw new Error("Lead not found");
    const next = await pickNextAssignee(supabase, lead.org_id, userId);
    const { error } = await supabase
      .from("leads")
      .update({ assigned_to: next, last_activity_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabase.from("lead_activities").insert({
      org_id: lead.org_id,
      lead_id: data.id,
      type: "assignment",
      payload: { to: next, mode: "round_robin" },
      actor_id: userId,
    });
    return { assigned_to: next };
  });

export const addLeadNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        lead_id: z.string().uuid(),
        text: z.string().trim().min(1).max(2000),
        kind: z.enum(["note", "call", "email"]).default("note"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: lead } = await supabase
      .from("leads")
      .select("org_id")
      .eq("id", data.lead_id)
      .maybeSingle();
    if (!lead) throw new Error("Lead not found");
    await supabase.from("lead_activities").insert({
      org_id: lead.org_id,
      lead_id: data.lead_id,
      type: data.kind,
      payload: { text: data.text },
      actor_id: userId,
    });
    await supabase
      .from("leads")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", data.lead_id);
    return { ok: true };
  });

async function pickNextAssignee(
  supabase: any,
  orgId: string,
  fallbackUserId: string,
): Promise<string> {
  // Round-robin among active sales_executives in the org
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("org_id", orgId)
    .eq("role", "sales_executive");
  const executiveIds = (roleRows ?? []).map((r: { user_id: string }) => r.user_id);
  if (executiveIds.length === 0) return fallbackUserId;

  const { data: actives } = await supabase
    .from("profiles")
    .select("id")
    .eq("org_id", orgId)
    .eq("is_active", true)
    .in("id", executiveIds);
  const ids = (actives ?? []).map((r: { id: string }) => r.id).sort();
  if (ids.length === 0) return fallbackUserId;

  const { data: ptr } = await supabase
    .from("assignment_pointer")
    .select("last_assigned_user_id")
    .eq("org_id", orgId)
    .maybeSingle();
  const last = ptr?.last_assigned_user_id as string | undefined;
  const idx = last ? ids.indexOf(last) : -1;
  const next = ids[(idx + 1) % ids.length];
  await supabase
    .from("assignment_pointer")
    .upsert({ org_id: orgId, last_assigned_user_id: next });
  return next;
}