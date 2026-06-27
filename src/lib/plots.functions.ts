import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOrg } from "./crm-helpers";

const plotStatus = z.enum(["available", "blocked", "booked", "sold"]);
const plotFacing = z.enum(["north", "south", "east", "west", "north_east", "north_west", "south_east", "south_west"]);

export const listPlots = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ project_id: z.string().uuid().optional(), status: plotStatus.optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("plots").select("*, projects(name)").order("plot_number");
    if (data.project_id) q = q.eq("project_id", data.project_id);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const plotInput = z.object({
  project_id: z.string().uuid(),
  plot_number: z.string().trim().min(1).max(40),
  area_sqft: z.number().positive(),
  price_per_sqft: z.number().nonnegative().optional().nullable(),
  total_price: z.number().nonnegative(),
  facing: plotFacing.optional().nullable(),
  status: plotStatus.optional(),
  block: z.string().max(40).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const createPlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => plotInput.parse(d))
  .handler(async ({ data, context }) => {
    const orgId = await requireOrg(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("plots")
      .insert({ ...data, org_id: orgId, status: data.status ?? "available" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const updatePlotStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: plotStatus }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("plots").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
