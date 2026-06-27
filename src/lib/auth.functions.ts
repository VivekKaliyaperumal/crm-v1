import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppRole } from "./permissions";

export type Me = {
  userId: string;
  email: string | null;
  fullName: string | null;
  orgId: string | null;
  orgName: string | null;
  roles: AppRole[];
};

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Me> => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, org_id, organizations(name)")
      .eq("id", userId)
      .maybeSingle();

    let roles: AppRole[] = [];
    if (profile?.org_id) {
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("org_id", profile.org_id);
      roles = (roleRows ?? []).map((r) => r.role as AppRole);
    }

    return {
      userId,
      email: profile?.email ?? null,
      fullName: profile?.full_name ?? null,
      orgId: profile?.org_id ?? null,
      orgName:
        (profile?.organizations as { name?: string } | null)?.name ?? null,
      roles,
    };
  });