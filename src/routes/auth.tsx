import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createOrg } from "@/lib/org.functions";
import { getMe } from "@/lib/auth.functions";
import { useServerFn } from "@tanstack/react-start";

const searchSchema = z.object({ tab: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Sign in · Greenfield CRM" }],
  }),
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const [needsOrg, setNeedsOrg] = useState(false);
  const [loading, setLoading] = useState(false);
  const callCreateOrg = useServerFn(createOrg);

  // If already signed in, route to /app or org-creation
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active || !data.user) return;
      const me = await getMe();
      if (me.orgId) navigate({ to: "/app/dashboard", replace: true });
      else setNeedsOrg(true);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  if (needsOrg) {
    return (
      <Shell>
        <Card>
          <CardHeader>
            <CardTitle>Create your organization</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = String(fd.get("name") ?? "");
                if (!name.trim()) return;
                setLoading(true);
                try {
                  await callCreateOrg({ data: { name } });
                  navigate({ to: "/app/dashboard", replace: true });
                } catch (err) {
                  toast.error((err as Error).message);
                } finally {
                  setLoading(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <Label htmlFor="name">Organization name</Label>
                <Input id="name" name="name" placeholder="Acme Realty" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating…" : "Create organization"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Greenfield CRM</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={tab ?? "signin"}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInForm
                onDone={async () => {
                  const me = await getMe();
                  if (me.orgId) navigate({ to: "/app/dashboard", replace: true });
                  else setNeedsOrg(true);
                }}
              />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm onDone={() => setNeedsOrg(true)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground text-center mt-4">
        <Link to="/" className="underline">
          Back to home
        </Link>
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center relative overflow-hidden bg-background px-4 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.62_0.19_256/0.12),transparent)]" />
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

function SignInForm({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <form
      className="space-y-3 mt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
          email: String(fd.get("email")),
          password: String(fd.get("password")),
        });
        setLoading(false);
        if (error) return toast.error(error.message);
        onDone();
      }}
    >
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Try demo: <code className="font-mono">admin@demo.test</code> /{" "}
        <code className="font-mono">Demo!2345</code>
      </p>
    </form>
  );
}

function SignUpForm({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <form
      className="space-y-3 mt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setLoading(true);
        const { error } = await supabase.auth.signUp({
          email: String(fd.get("email")),
          password: String(fd.get("password")),
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: { full_name: String(fd.get("full_name")) },
          },
        });
        setLoading(false);
        if (error) return toast.error(error.message);
        toast.success("Account created. You're signed in.");
        onDone();
      }}
    >
      <div>
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" required />
      </div>
      <div>
        <Label htmlFor="email2">Email</Label>
        <Input id="email2" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password2">Password</Label>
        <Input id="password2" name="password" type="password" minLength={8} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}