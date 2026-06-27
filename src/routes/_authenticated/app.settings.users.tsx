import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  queryOptions,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  listOrgUsers,
  inviteUser,
  setUserActive,
  setUserRole,
} from "@/lib/users.functions";
import { meQueryOptions } from "@/hooks/use-me";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABEL, type AppRole, isManager } from "@/lib/permissions";
import { toast } from "sonner";

const usersOptions = queryOptions({
  queryKey: ["users"],
  queryFn: () => listOrgUsers(),
});

export const Route = createFileRoute("/_authenticated/app/settings/users")({
  loader: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQueryOptions);
    if (!isManager(me.roles)) throw redirect({ to: "/app/dashboard" });
    await context.queryClient.ensureQueryData(usersOptions);
    return null;
  },
  component: UsersPage,
  errorComponent: ({ error }) => (
    <div className="text-destructive text-sm">{error.message}</div>
  ),
  notFoundComponent: () => <div>Not found</div>,
});

function UsersPage() {
  const { data: users } = useSuspenseQuery(usersOptions);
  const qc = useQueryClient();
  const invite = useServerFn(inviteUser);
  const setActive = useServerFn(setUserActive);
  const setRole = useServerFn(setUserRole);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-sm text-muted-foreground">
          Add team members and manage roles.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite a user</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid sm:grid-cols-5 gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setLoading(true);
              try {
                await invite({
                  data: {
                    email: String(fd.get("email")),
                    full_name: String(fd.get("full_name")),
                    password: String(fd.get("password")),
                    role: String(fd.get("role")) as AppRole,
                  },
                });
                (e.currentTarget as HTMLFormElement).reset();
                qc.invalidateQueries({ queryKey: ["users"] });
                toast.success("User created.");
              } catch (err) {
                toast.error((err as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <Label>Full name</Label>
              <Input name="full_name" required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" name="email" required />
            </div>
            <div>
              <Label>Temp password</Label>
              <Input name="password" minLength={8} required />
            </div>
            <div>
              <Label>Role</Label>
              <Select name="role" defaultValue="sales_executive">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "admin",
                      "sales_manager",
                      "sales_executive",
                      "telecaller",
                    ] as AppRole[]
                  ).map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "…" : "Add"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team members</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="text-left py-2">Name</th>
                <th className="text-left">Email</th>
                <th className="text-left">Role</th>
                <th className="text-left">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="py-2 font-medium">{u.full_name ?? "—"}</td>
                  <td className="text-muted-foreground">{u.email}</td>
                  <td>
                    <Select
                      value={u.roles[0] ?? "sales_executive"}
                      onValueChange={async (v) => {
                        await setRole({
                          data: { user_id: u.id, role: v as AppRole },
                        });
                        qc.invalidateQueries({ queryKey: ["users"] });
                      }}
                    >
                      <SelectTrigger className="w-[170px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            "admin",
                            "sales_manager",
                            "sales_executive",
                            "telecaller",
                          ] as AppRole[]
                        ).map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td>
                    <span
                      className={
                        u.is_active
                          ? "text-emerald-600 text-xs"
                          : "text-muted-foreground text-xs"
                      }
                    >
                      {u.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await setActive({
                          data: { user_id: u.id, active: !u.is_active },
                        });
                        qc.invalidateQueries({ queryKey: ["users"] });
                      }}
                    >
                      {u.is_active ? "Disable" : "Enable"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}