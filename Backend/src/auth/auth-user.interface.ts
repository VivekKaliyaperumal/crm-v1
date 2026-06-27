import type { AppRole } from '@prisma/client';

/** The authenticated principal attached to every request after AuthGuard runs. */
export interface AuthUser {
  /** auth.users.id (== profiles.id) */
  id: string;
  email: string | null;
  /** The organization this user belongs to. Guaranteed present (guard rejects users without one). */
  orgId: string;
  /** All roles the user holds within their organization. */
  roles: AppRole[];
}

export function isManager(roles: AppRole[]): boolean {
  return roles.includes('admin') || roles.includes('sales_manager');
}

export function isAdmin(roles: AppRole[]): boolean {
  return roles.includes('admin');
}
