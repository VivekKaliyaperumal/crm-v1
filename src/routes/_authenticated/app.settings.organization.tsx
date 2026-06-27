import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { meQueryOptions, useMe } from "@/hooks/use-me";
import { updateOrg } from "@/lib/org.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/permissions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/app/settings/organization")({
  loader: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions);
    if (!isAdmin(me.roles)) throw redirect({ to: "/app/dashboard" });
    return null;
  },
  component: OrgSettings,
  errorComponent: ({ error }) => (
    <div className="text-destructive text-sm">{error.message}</div>
  ),
  notFoundComponent: () => <div>Not found</div>,
});

function OrgSettings() {
  const { data: me } = useMe();
  const [name, setName] = useState(me.orgName ?? "");
  const update = useServerFn(updateOrg);
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Organization</h1>
        <p className="text-sm text-muted-foreground">
          Admin-only settings for your tenant.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                await update({ data: { name } });
                qc.invalidateQueries({ queryKey: ["me"] });
                toast.success("Saved.");
              } catch (err) {
                toast.error((err as Error).message);
              } finally {
                setSaving(false);
              }
            }}
          >
            <div>
              <Label htmlFor="name">Organization name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}