import { useMe } from "@/hooks/use-me";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Sprout } from "lucide-react";

export function MobileTopbar() {
  const { data: me } = useMe();
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <header className="md:hidden flex items-center justify-between border-b px-4 py-3 bg-background/80 backdrop-blur sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground grid place-items-center">
          <Sprout className="size-3.5" />
        </div>
        <div className="font-display font-semibold text-sm tracking-tight">{me.orgName ?? "CRM"}</div>
      </div>
      <Button size="icon" variant="ghost" onClick={signOut} aria-label="Sign out">
        <LogOut className="size-4" />
      </Button>
    </header>
  );
}