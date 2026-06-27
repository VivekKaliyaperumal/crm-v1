import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppRole } from "./permissions";

const role = z.enum([
  "admin",
  "sales_manager",
  "sales_executive",
  "telecaller",
] as const) satisfies z.ZodType<AppRole>;

async function requireOrgAndManager(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", userId)
    .maybeSingle();
  if (!profile?.org_id) throw new Error("No org");
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("org_id", profile.org_id);
  const rs = (roles ?? []).map((r: { role: AppRole }) => r.role);
  if (!rs.includes("admin") && !rs.includes("sales_manager"))
    throw new Error("Forbidden");
  return profile.org_id as string;
}

export const listOrgUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.org_id) return [];
    const { data: members } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, is_active")
      .eq("org_id", profile.org_id);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("org_id", profile.org_id);
    const byUser: Record<string, AppRole[]> = {};
    (roles ?? []).forEach((r: { user_id: string; role: AppRole }) => {
      byUser[r.user_id] = [...(byUser[r.user_id] ?? []), r.role];
    });
    return (members ?? []).map((m: any) => ({
      ...m,
      roles: byUser[m.id] ?? [],
    }));
  });

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        email: z.string().email(),
        full_name: z.string().trim().min(1).max(120),
        password: z.string().min(8).max(72),
        role,
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const orgId = await requireOrgAndManager(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Create failed");

    await supabaseAdmin
      .from("profiles")
      .update({ org_id: orgId, full_name: data.full_name })
      .eq("id", created.user.id);
    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, org_id: orgId, role: data.role });
    return { id: created.user.id };
  });

export const setUserActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ user_id: z.string().uuid(), active: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await requireOrgAndManager(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("profiles")
      .update({ is_active: data.active })
      .eq("id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ user_id: z.string().uuid(), role }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const orgId = await requireOrgAndManager(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("org_id", orgId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.user_id, org_id: orgId, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });