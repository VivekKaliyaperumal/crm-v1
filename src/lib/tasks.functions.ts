import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOrg } from "./crm-helpers";

const taskStatus = z.enum(["open", "in_progress", "done", "cancelled"]);
const taskPriority = z.enum(["low", "medium", "high", "urgent"]);

export const listTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ status: taskStatus.optional(), mine: z.boolean().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("tasks")
      .select("*, leads(full_name)")
      .order("due_at", { ascending: true, nullsFirst: false });
    if (data.status) q = q.eq("status", data.status);
    if (data.mine) q = q.eq("assigned_to", context.userId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const taskInput = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  status: taskStatus.optional(),
  priority: taskPriority.optional(),
  due_at: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  related_lead_id: z.string().uuid().optional().nullable(),
});

export const createTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => taskInput.parse(d))
  .handler(async ({ data, context }) => {
    const orgId = await requireOrg(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("tasks")
      .insert({
        ...data,
        org_id: orgId,
        created_by: context.userId,
        assigned_to: data.assigned_to ?? context.userId,
        status: data.status ?? "open",
        priority: data.priority ?? "medium",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const toggleTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), done: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("tasks")
      .update({ status: data.done ? "done" : "open", completed_at: data.done ? new Date().toISOString() : null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
