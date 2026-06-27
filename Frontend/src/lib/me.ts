'use client';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  branding: Record<string, unknown>;
}

export interface Me {
  id: string;
  email: string | null;
  fullName: string | null;
  roles: string[];
  orgId: string;
  org: Organization | null;
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<Me>('me'),
    staleTime: 5 * 60 * 1000,
  });
}
