# Farm Land CRM — Full Build Plan

Building a complete enterprise CRM with all 18 modules + premium UI redesign across every page. This is large — I'll execute in 4 sequential phases, each ending in a working state.

## Phase 1 — Database schema (1 migration)

New tables (all multi-tenant via `org_id`, RLS on, GRANTs included):

- `projects` — name, location, total_area, status, cover_image
- `plots` — project_id, plot_number, area, price, facing, status (available/blocked/booked/sold)
- `opportunities` — lead_id, project_id, plot_id, stage, value, probability, expected_close
- `deals` — opportunity_id, plot_id, customer_id, amount, status
- `customers` — promoted from leads on conversion; pan, address, kyc_status
- `tasks` — title, due_at, priority, status, assigned_to, related_lead_id
- `quotations` — number, customer_id, plot_id, amount, valid_until, status
- `bookings` — quotation_id, customer_id, plot_id, booking_amount, agreement_date
- `payments` — booking_id, amount, mode, status, due_date, paid_at
- `receipts` — payment_id, receipt_number, amount, issued_at
- `campaigns` — name, channel, status, budget, spent, leads_count
- `documents` — entity_type, entity_id, name, storage_path, uploaded_by
- `activity_timeline` (view) — unified feed across leads/customers/deals

All with `tg_set_updated_at` triggers + indexes on `org_id`, FKs, and status columns.

## Phase 2 — Server functions

New `.functions.ts` modules: `projects`, `plots`, `opportunities`, `deals`, `customers`, `tasks`, `quotations`, `bookings`, `payments`, `receipts`, `campaigns`, `documents`. Each: `list`, `get`, `create`, `update`, `delete` with `requireSupabaseAuth` + RBAC.

## Phase 3 — UI redesign (every page + new modules)

**Design system updates** (`src/styles.css`):
- Add semantic tokens: `--success`, `--warning`, `--info`, `--surface-2`, `--surface-3`, soft shadow tokens (`--shadow-elegant`, `--shadow-card`), gradient tokens
- Refined OKLCH palette tuned for enterprise polish

**Collapsible shadcn sidebar** (`AppSidebar.tsx` rewrite using `Sidebar` primitive):
- Grouped nav: Workspace (Dashboard) · Sales (Leads, Opportunities, Deals, Customers) · Inventory (Projects, Plots, Site Visits) · Activities (Follow-ups, Tasks, Calendar) · Billing (Quotations, Bookings, Payments, Receipts) · Growth (Campaigns, Reports) · Admin (Team, Settings)
- Icon-only collapsed mode, hover tooltips, mobile sheet

**Premium redesigns:**
- **Leads list** — KPI strip (4 cards: Total, New this week, Conversion %, Pipeline value), avatar column, inline status pill, source badge, assigned-to chip, last-activity relative time, row hover quick-actions (Call/Email/Note/Convert), bulk-select toolbar, saved-view tabs, advanced filter popover, density toggle
- **Dashboard** — Hero KPIs · Sales pipeline funnel (Recharts) · Revenue trend area chart · Lead source donut · Recent activity timeline · Top performers leaderboard · Hot leads list
- **Lead detail** — Two-column: left timeline + tabs (Activity/Notes/Files/Tasks), right contact card + deal info + next action
- **New lead** — Stepper form with field-level validation
- **All other existing pages** (Follow-ups, Site Visits, Reports, Team, Org settings, Auth, Landing) — restyled to match
- **New module pages** — full CRUD UIs for Projects, Plots (with availability grid), Opportunities (kanban), Deals, Customers, Tasks, Calendar (month view), Quotations, Bookings, Payments, Receipts, Campaigns

**Reusable components:** `PageHeader`, `KpiStat`, `DataTable` (with sort/filter/select), `EmptyState`, `Avatar`, `StageBadge`, `MoneyCell`, `RelativeTime`, `QuickActions`.

## Phase 4 — Seed demo data

Insert demo Projects (3), Plots (~60), Customers (10), Opportunities (15), Deals (8), Tasks (20), Quotations (6), Bookings (3), Payments (8), Campaigns (4).

## Technical notes

- Stack stays: TanStack Start + Supabase + shadcn + Tailwind v4
- All money in paise (bigint) → format client-side as ₹
- Status enums via PG `CREATE TYPE` for type safety
- All new routes under `_authenticated/app.*` (file-based, dot convention)
- Sidebar uses shadcn `Sidebar` primitive with `collapsible="icon"`

## Scope acknowledgement

This is ~15-20 new tables, ~12 new server-function modules, ~14 new route files, full redesign of ~10 existing pages. I'll ship in the 4 phases above — after each phase the app stays working. Starting with the migration in the next turn.