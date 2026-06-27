'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  branding: Record<string, unknown>;
}

export type PermAction = 'view' | 'create' | 'edit' | 'delete';
export type EffectivePermissions = Record<string, Record<PermAction, boolean>>;

export interface Me {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  roles: string[];
  orgId: string;
  org: Organization | null;
  permissions: EffectivePermissions;
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<Me>('me'),
    staleTime: 5 * 60 * 1000,
  });
}

export function can(me: Me | undefined, moduleKey: string, action: PermAction): boolean {
  return Boolean(me?.permissions?.[moduleKey]?.[action]);
}

export function isAdmin(me: Me | undefined): boolean {
  return Boolean(me?.roles?.includes('admin'));
}
