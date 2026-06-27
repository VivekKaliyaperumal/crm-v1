import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOrg } from "./crm-helpers";

const kycStatus = z.enum(["pending", "verified", "rejected"]);

export const listCustomers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ search: z.string().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("customers").select("*").order("created_at", { ascending: false });
    if (data.search) {
      const s = `%${data.search}%`;
      q = q.or(`full_name.ilike.${s},phone.ilike.${s},email.ilike.${s}`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const customerInput = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().trim().min(1).max(40),
  pan: z.string().trim().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  state: z.string().max(80).optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  kyc_status: kycStatus.optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export const createCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => customerInput.parse(d))
  .handler(async ({ data, context }) => {
    const orgId = await requireOrg(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("customers")
      .insert({ ...data, email: data.email || null, org_id: orgId, owner_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });
