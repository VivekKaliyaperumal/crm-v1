import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Target, Handshake, UserCheck,
  Building2, LandPlot, MapPin, PhoneCall, ListTodo, Calendar,
  FileText, BookCheck, Wallet, Receipt, Megaphone, BarChart3,
  Settings, Sprout, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMe } from "@/hooks/use-me";
import { isManager, isAdmin, ROLE_LABEL } from "@/lib/permissions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };
type NavGroup = { label: string; items: NavItem[]; admin?: boolean; manager?: boolean };

const groups: NavGroup[] = [
  {
    label: "Workspace",
    items: [{ to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [
      { to: "/app/leads", label: "Leads", icon: Users },
      { to: "/app/opportunities", label: "Opportunities", icon: Target },
      { to: "/app/deals", label: "Deals", icon: Handshake },
      { to: "/app/customers", label: "Customers", icon: UserCheck },
    ],
  },
  {
    label: "Inventory",
    items: [
      { to: "/app/projects", label: "Projects", icon: Building2 },
      { to: "/app/plots", label: "Plot Inventory", icon: LandPlot },
      { to: "/app/site-visits", label: "Site Visits", icon: MapPin },
    ],
  },
  {
    label: "Activities",
    items: [
      { to: "/app/follow-ups", label: "Follow-ups", icon: PhoneCall },
      { to: "/app/tasks", label: "Tasks", icon: ListTodo },
      { to: "/app/calendar", label: "Calendar", icon: Calendar },
    ],
  },
  {
    label: "Billing",
    items: [
      { to: "/app/quotations", label: "Quotations", icon: FileText },
      { to: "/app/bookings", label: "Bookings", icon: BookCheck },
      { to: "/app/payments", label: "Payments", icon: Wallet },
      { to: "/app/receipts", label: "Receipts", icon: Receipt },
    ],
  },
  {
    label: "Growth",
    items: [
      { to: "/app/campaigns", label: "Campaigns", icon: Megaphone },
      { to: "/app/reports", label: "Reports", icon: BarChart3 },
    ],
    manager: true,
  },
  {
    label: "Admin",
    items: [
      { to: "/app/settings/users", label: "Team", icon: Users },
      { to: "/app/settings/organization", label: "Organization", icon: Settings },
    ],
    admin: true,
  },
];

export function AppSidebar() {
  const { data: me } = useMe();
  const { location } = useRouterState();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" && localStorage.getItem("sidebar-collapsed");
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem("sidebar-collapsed", next ? "1" : "0"); } catch {}
      return next;
    });
  }

  const visibleGroups = groups.filter((g) =>
    (!g.admin || isAdmin(me.roles)) && (!g.manager || isManager(me.roles))
  );

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const primaryRole = me.roles[0];
  const initials = (me.fullName ?? me.email ?? "?")
    .split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <aside
      className={cn(
        "hidden md:flex md:flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "md:w-[72px]" : "md:w-64",
      )}
    >
      {/* Brand */}
      <div className={cn("flex items-center gap-3 px-5 pt-5 pb-4", collapsed && "px-3 justify-center")}>
        <div className="size-9 shrink-0 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground grid place-items-center shadow-lg shadow-primary/20">
          <Sprout className="size-4" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-display text-[15px] font-semibold tracking-tight truncate">
              {me.orgName ?? "Greenfield"}
            </div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/45">
              Land CRM
            </div>
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost" size="icon"
            className="size-7 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
            onClick={toggleCollapsed} aria-label="Collapse sidebar"
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}
      </div>
      {collapsed && (
        <button
          onClick={toggleCollapsed}
          className="mx-3 mb-2 grid place-items-center h-7 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-4 scrollbar-thin">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/35">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg text-sm font-medium transition-all relative",
                      collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/65 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
                    )}
                  >
                    {!collapsed && (
                      <span className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full transition-all",
                        active ? "bg-primary" : "bg-transparent",
                      )} />
                    )}
                    <Icon className={cn("size-[17px] shrink-0", active && "text-primary")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className={cn("m-3 rounded-xl bg-sidebar-accent/40", collapsed ? "p-2" : "p-3")}>
        <div className={cn("flex items-center gap-3", collapsed && "flex-col gap-2")}>
          <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 grid place-items-center text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-sidebar-foreground">
                {me.fullName ?? me.email}
              </div>
              <div className="text-[11px] truncate text-sidebar-foreground/55">
                {primaryRole ? ROLE_LABEL[primaryRole] : "Member"}
              </div>
            </div>
          )}
          <Button
            variant="ghost" size="icon"
            className="size-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
            onClick={signOut} aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
