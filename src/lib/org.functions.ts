import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "org"
  );
}

export const createOrg = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ name: z.string().trim().min(2).max(80) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Reject if already in an org
    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", userId)
      .maybeSingle();
    if (profile?.org_id) throw new Error("You are already in an organization.");

    const slugBase = slugify(data.name);
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: org, error: orgErr } = await supabaseAdmin
      .from("organizations")
      .insert({ name: data.name, slug })
      .select("id, name")
      .single();
    if (orgErr || !org) throw new Error(orgErr?.message ?? "Org create failed");

    await supabaseAdmin
      .from("profiles")
      .update({ org_id: org.id })
      .eq("id", userId);

    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, org_id: org.id, role: "admin" });

    await supabaseAdmin
      .from("assignment_pointer")
      .insert({ org_id: org.id, last_assigned_user_id: userId });

    return { orgId: org.id, name: org.name };
  });

export const updateOrg = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ name: z.string().trim().min(2).max(80) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", context.userId)
      .maybeSingle();
    if (!profile?.org_id) throw new Error("No org.");
    const { error } = await supabase
      .from("organizations")
      .update({ name: data.name })
      .eq("id", profile.org_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });