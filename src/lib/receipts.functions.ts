import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listReceipts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("receipts")
      .select("*, customers(full_name)")
      .order("issued_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
