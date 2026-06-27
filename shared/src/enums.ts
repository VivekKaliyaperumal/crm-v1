// Canonical enum value lists — the single source of truth shared by the API and UI.
// (These mirror the PostgreSQL enums in supabase/migrations and Prisma schema.)

export const APP_ROLES = ['admin', 'sales_manager', 'sales_executive', 'telecaller'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const LEAD_STATUSES = [
  'new', 'contacted', 'interested', 'site_visit_scheduled', 'site_visit_completed',
  'negotiation', 'booking', 'closed_won', 'closed_lost', 'not_interested', 'future_follow_up',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = ['manual', 'web_form', 'import', 'referral', 'walk_in', 'other'] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const KYC_STATUSES = ['pending', 'verified', 'rejected'] as const;
export const OPPORTUNITY_STAGES = ['qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;
export const DEAL_STATUSES = ['open', 'won', 'lost', 'on_hold'] as const;
export const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed', 'archived'] as const;
export const PLOT_STATUSES = ['available', 'blocked', 'booked', 'sold'] as const;
export const PLOT_FACINGS = ['north', 'south', 'east', 'west', 'north_east', 'north_west', 'south_east', 'south_west'] as const;
export const CAMPAIGN_CHANNELS = ['facebook', 'google', 'instagram', 'whatsapp', 'email', 'sms', 'referral', 'event', 'other'] as const;
export const CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'completed'] as const;
export const QUOTATION_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'] as const;
export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const;
export const PAYMENT_STATUSES = ['scheduled', 'due', 'partial', 'paid', 'overdue', 'cancelled'] as const;
export const PAYMENT_MODES = ['cash', 'cheque', 'bank_transfer', 'upi', 'card', 'other'] as const;
export const TASK_STATUSES = ['open', 'in_progress', 'done', 'cancelled'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const VISIT_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;
export const FOLLOWUP_PRIORITIES = ['low', 'medium', 'high'] as const;
export const FOLLOWUP_STATUSES = ['pending', 'completed', 'cancelled'] as const;

/** Title-case an enum value: "site_visit_scheduled" → "Site Visit Scheduled". */
export function humanize(value: string): string {
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = Object.fromEntries(
  LEAD_STATUSES.map((s) => [s, humanize(s)]),
) as Record<LeadStatus, string>;

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: 'Admin',
  sales_manager: 'Sales Manager',
  sales_executive: 'Sales Executive',
  telecaller: 'Telecaller',
};
