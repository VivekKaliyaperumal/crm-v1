import { AppRole } from '@prisma/client';

/**
 * Single source of truth for role-based module permissions.
 * Mirrors the access rules enforced in the service layer, and drives both the
 * admin Permissions screen and the frontend UI gating (via /api/me).
 */
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

const ALL: AppRole[] = [
  AppRole.admin,
  AppRole.sales_manager,
  AppRole.sales_executive,
  AppRole.telecaller,
];
const MANAGERS: AppRole[] = [AppRole.admin, AppRole.sales_manager];
const ADMIN: AppRole[] = [AppRole.admin];

type ModulePerms = Record<PermissionAction, AppRole[]>;

export interface ModuleDef {
  key: string;
  label: string;
  perms: ModulePerms;
}

const p = (view: AppRole[], create: AppRole[], edit: AppRole[], del: AppRole[]): ModulePerms => ({
  view,
  create,
  edit,
  delete: del,
});

// "Role-scoped rows" + manager delete (leads/tasks/site-visits/follow-ups).
const ROLE_SCOPED = p(ALL, ALL, ALL, MANAGERS);
// "Org read, owner-or-manager write, manager delete" (customers/opportunities/deals).
const OWNER_WRITE = p(ALL, ALL, ALL, MANAGERS);
// "Org read, manager-only manage" (projects/plots/campaigns).
const MANAGER_MANAGE = p(ALL, MANAGERS, MANAGERS, MANAGERS);
// "Org read, any-member manage" (quotations/bookings/payments/receipts/documents).
const MEMBER_MANAGE = p(ALL, ALL, ALL, ALL);

export const MODULES: ModuleDef[] = [
  { key: 'dashboard', label: 'Dashboard', perms: p(ALL, [], [], []) },
  { key: 'leads', label: 'Leads', perms: ROLE_SCOPED },
  { key: 'opportunities', label: 'Opportunities', perms: OWNER_WRITE },
  { key: 'deals', label: 'Deals', perms: OWNER_WRITE },
  { key: 'customers', label: 'Customers', perms: OWNER_WRITE },
  { key: 'projects', label: 'Projects', perms: MANAGER_MANAGE },
  { key: 'plots', label: 'Plot Inventory', perms: MANAGER_MANAGE },
  { key: 'site-visits', label: 'Site Visits', perms: ROLE_SCOPED },
  { key: 'follow-ups', label: 'Follow-ups', perms: ROLE_SCOPED },
  { key: 'tasks', label: 'Tasks', perms: ROLE_SCOPED },
  { key: 'quotations', label: 'Quotations', perms: MEMBER_MANAGE },
  { key: 'bookings', label: 'Bookings', perms: MEMBER_MANAGE },
  { key: 'payments', label: 'Payments', perms: MEMBER_MANAGE },
  { key: 'receipts', label: 'Receipts', perms: MEMBER_MANAGE },
  { key: 'campaigns', label: 'Campaigns', perms: MANAGER_MANAGE },
  { key: 'documents', label: 'Documents', perms: MEMBER_MANAGE },
  { key: 'team', label: 'Team', perms: p(ADMIN, ADMIN, ADMIN, ADMIN) },
  { key: 'permissions', label: 'Permissions', perms: p(ADMIN, [], [], []) },
  { key: 'settings', label: 'Organization Settings', perms: p(ADMIN, [], ADMIN, []) },
];

const MODULE_BY_KEY = new Map(MODULES.map((m) => [m.key, m]));

export const ALL_ROLES = ALL;

export function can(roles: AppRole[], moduleKey: string, action: PermissionAction): boolean {
  const mod = MODULE_BY_KEY.get(moduleKey);
  if (!mod) return false;
  return mod.perms[action].some((r) => roles.includes(r));
}

export type EffectivePermissions = Record<string, Record<PermissionAction, boolean>>;

/** Capability map for a given set of roles — consumed by the frontend to gate UI. */
export function permissionsFor(roles: AppRole[]): EffectivePermissions {
  const out: EffectivePermissions = {};
  for (const mod of MODULES) {
    out[mod.key] = {
      view: can(roles, mod.key, 'view'),
      create: can(roles, mod.key, 'create'),
      edit: can(roles, mod.key, 'edit'),
      delete: can(roles, mod.key, 'delete'),
    };
  }
  return out;
}

/** Serialisable matrix for the admin Permissions screen. */
export function permissionMatrix() {
  return {
    roles: ALL,
    modules: MODULES.map((m) => ({ key: m.key, label: m.label, perms: m.perms })),
  };
}
