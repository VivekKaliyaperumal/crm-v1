import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type LeadStatus = Database["public"]["Enums"]["lead_status"];
export type LeadSource = Database["public"]["Enums"]["lead_source"];

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Admin",
  sales_manager: "Sales Manager",
  sales_executive: "Sales Executive",
  telecaller: "Telecaller",
};

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  site_visit_scheduled: "Site Visit Scheduled",
  site_visit_completed: "Site Visit Completed",
  negotiation: "Negotiation",
  booking: "Booking",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
  not_interested: "Not Interested",
  future_follow_up: "Future Follow-up",
};

export const ALL_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "interested",
  "site_visit_scheduled",
  "site_visit_completed",
  "negotiation",
  "booking",
  "closed_won",
  "closed_lost",
  "not_interested",
  "future_follow_up",
];

export const ALL_SOURCES: LeadSource[] = [
  "manual",
  "web_form",
  "import",
  "referral",
  "walk_in",
  "other",
];

export function isManager(roles: AppRole[]): boolean {
  return roles.includes("admin") || roles.includes("sales_manager");
}

export function isAdmin(roles: AppRole[]): boolean {
  return roles.includes("admin");
}

export function statusTone(status: LeadStatus): string {
  switch (status) {
    case "closed_won":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "booking":
    case "negotiation":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "closed_lost":
    case "not_interested":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "site_visit_scheduled":
    case "site_visit_completed":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "interested":
    case "contacted":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "future_follow_up":
      return "bg-slate-100 text-slate-800 border-slate-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}