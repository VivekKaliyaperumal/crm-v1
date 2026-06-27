import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sprout, Users, BarChart3, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Greenfield CRM — Farm Land Sales Platform" },
      {
        name: "description",
        content:
          "Multi-tenant CRM purpose-built for farm-land real estate teams — lead capture, follow-ups, site visits, dashboards.",
      },
      { property: "og:title", content: "Greenfield CRM" },
      {
        property: "og:description",
        content: "Run your farm-land sales operation end to end.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.62_0.19_256/0.12),transparent)]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(to_right,#0B1220_1px,transparent_1px),linear-gradient(to_bottom,#0B1220_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground grid place-items-center shadow-lg shadow-primary/20">
            <Sprout className="size-4" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Greenfield
          </span>
        </div>
        <div className="flex gap-2">
          <Link to="/auth">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link to="/auth" search={{ tab: "signup" }}>
            <Button>Get started</Button>
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Multi-tenant land CRM · live demo inside
          </div>
          <h1 className="mt-6 font-display text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            The CRM built for{" "}
            <em className="not-italic bg-gradient-to-br from-primary to-primary/50 bg-clip-text text-transparent">
              farm-land
            </em>{" "}
            sales teams.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
            Capture leads, assign executives, run site visits, and close more
            plots — with bullet-proof tenant isolation.
          </p>
          <div className="mt-9 flex gap-3 justify-center">
            <Link to="/auth" search={{ tab: "signup" }}>
              <Button size="lg" className="h-12 px-6">
                Start free
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="h-12 px-6">
                Try the demo
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Demo: <code className="font-mono">admin@demo.test</code> /{" "}
            <code className="font-mono">Demo!2345</code>
          </p>
        </section>
        <section className="mt-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Sprout, title: "Lead lifecycle", desc: "From first call to closed-won with status timelines." },
            { icon: Users, title: "Role-based access", desc: "Admin, Manager, Executive, Telecaller — enforced server-side." },
            { icon: BarChart3, title: "Live dashboards", desc: "Funnel, sources, leaderboard, follow-ups due today." },
            { icon: ShieldCheck, title: "Tenant isolation", desc: "Row-level security keeps every org's data sealed off." },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border bg-card/70 backdrop-blur p-5 hover:shadow-md hover:-translate-y-px transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <f.icon className="size-4" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
