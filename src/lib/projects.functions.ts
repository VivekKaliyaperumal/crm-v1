import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOrg } from "./crm-helpers";

const projectStatus = z.enum(["planning", "active", "on_hold", "completed", "archived"]);

export const listProjects = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select("*, plots(count)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const [{ data: project }, { data: plots }] = await Promise.all([
      context.supabase.from("projects").select("*").eq("id", data.id).maybeSingle(),
      context.supabase.from("plots").select("*").eq("project_id", data.id).order("plot_number"),
    ]);
    if (!project) throw new Error("Project not found");
    return { project, plots: plots ?? [] };
  });

const projectInput = z.object({
  name: z.string().trim().min(1).max(120),
  code: z.string().trim().max(40).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  total_area_sqft: z.number().nonnegative().optional().nullable(),
  status: projectStatus.optional(),
  cover_image_url: z.string().url().optional().nullable().or(z.literal("")),
  launch_date: z.string().optional().nullable(),
});

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => projectInput.parse(d))
  .handler(async ({ data, context }) => {
    const orgId = await requireOrg(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("projects")
      .insert({ ...data, org_id: orgId, created_by: context.userId, status: data.status ?? "planning" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const updateProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).merge(projectInput.partial()).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("projects").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
