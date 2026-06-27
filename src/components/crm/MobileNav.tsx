import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, PhoneCall, MapPin, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/app/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/app/leads", label: "Leads", icon: Users },
  { to: "/app/follow-ups", label: "Follow", icon: PhoneCall },
  { to: "/app/site-visits", label: "Visits", icon: MapPin },
  { to: "/app/reports", label: "Reports", icon: BarChart3 },
];

export function MobileNav() {
  const { location } = useRouterState();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 border-t bg-background/95 backdrop-blur">
      {items.map((i) => {
        const active = location.pathname.startsWith(i.to);
        const Icon = i.icon;
        return (
          <Link
            key={i.to}
            to={i.to}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium relative",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {active && (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
            )}
            <Icon className="size-5" />
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}