'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './api';

export const LEAD_STATUSES = [
  'new',
  'contacted',
  'interested',
  'site_visit_scheduled',
  'site_visit_completed',
  'negotiation',
  'booking',
  'closed_won',
  'closed_lost',
  'not_interested',
  'future_follow_up',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  'manual',
  'web_form',
  'import',
  'referral',
  'walk_in',
  'other',
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  site_visit_scheduled: 'Site Visit Scheduled',
  site_visit_completed: 'Site Visit Completed',
  negotiation: 'Negotiation',
  booking: 'Booking',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
  not_interested: 'Not Interested',
  future_follow_up: 'Future Follow-up',
};

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
