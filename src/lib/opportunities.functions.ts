import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOrg } from "./crm-helpers";

const oppStage = z.enum(["qualification", "proposal", "negotiation", "closed_won", "closed_lost"]);

export const listOpportunities = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("opportunities")
      .select("*, leads(full_name, phone), projects(name), plots(plot_number)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const oppInput = z.object({
  title: z.string().trim().min(1).max(160),
  lead_id: z.string().uuid().optional().nullable(),
  customer_id: z.string().uuid().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  plot_id: z.string().uuid().optional().nullable(),
  stage: oppStage.optional(),
  value: z.number().nonnegative().default(0),
  probability: z.number().int().min(0).max(100).default(20),
  expected_close: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const createOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => oppInput.parse(d))
  .handler(async ({ data, context }) => {
    const orgId = await requireOrg(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("opportunities")
      .insert({ ...data, org_id: orgId, owner_id: context.userId, stage: data.stage ?? "qualification" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const updateOpportunityStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), stage: oppStage }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("opportunities").update({ stage: data.stage }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
