import type { SupabaseClient } from "@supabase/supabase-js";

export async function requireOrg(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", userId)
    .maybeSingle();
  if (!data?.org_id) throw new Error("No organization");
  return data.org_id as string;
}