'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LEAD_STATUSES,
  LEAD_SOURCES,
  LEAD_STATUS_LABEL,
  type LeadStatus,
  type LeadSource,
} from '@smartagro-crm/shared';
import { apiFetch } from './api';

// Re-exported from the shared package so existing imports keep working.
export { LEAD_STATUSES, LEAD_SOURCES };
export type { LeadStatus, LeadSource };
export const STATUS_LABEL = LEAD_STATUS_LABEL;

export interface Lead {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  propertyInterest: string | null;
  budgetMin: string | null;
  budgetMax: string | null;
  timeline: string | null;
  source: LeadSource;
  status: LeadStatus;
  assignedTo: string | null;
  createdBy: string | null;
  notes: string | null;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadListResponse {
  data: Lead[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LeadListParams {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateLeadInput {
  fullName: string;
  phone?: string;
  email?: string;
  propertyInterest?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  source?: LeadSource;
  status?: LeadStatus;
  notes?: string;
}

function toQuery(params: LeadListParams): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function useLeads(params: LeadListParams) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => apiFetch<LeadListResponse>(`leads${toQuery(params)}`),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => apiFetch<Lead & Record<string, unknown>>(`leads/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeadInput) =>
      apiFetch<Lead>('leads', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useUpdateLead(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateLeadInput>) =>
      apiFetch<Lead>(`leads/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead', id] });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string; deleted: boolean }>(`leads/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}
