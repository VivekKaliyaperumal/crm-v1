import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOrg } from "./crm-helpers";

const channel = z.enum(["facebook", "google", "instagram", "whatsapp", "email", "sms", "referral", "event", "other"]);
const status = z.enum(["draft", "active", "paused", "completed"]);

export const listCampaigns = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const campaignInput = z.object({
  name: z.string().trim().min(1).max(120),
  channel: channel.optional(),
  status: status.optional(),
  budget: z.number().nonnegative().default(0),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const createCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => campaignInput.parse(d))
  .handler(async ({ data, context }) => {
    const orgId = await requireOrg(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("campaigns")
      .insert({ ...data, org_id: orgId, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });
