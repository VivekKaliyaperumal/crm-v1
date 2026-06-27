'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './api';

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type Row = Record<string, unknown> & { id: string };

function toQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function useResourceList(apiPath: string, params: Record<string, unknown>) {
  return useQuery({
    queryKey: [apiPath, params],
    queryFn: () => apiFetch<ListResponse<Row>>(`${apiPath}${toQuery(params)}`),
  });
}

export function useResourceItem(apiPath: string, id: string) {
  return useQuery({
    queryKey: [apiPath, 'item', id],
    queryFn: () => apiFetch<Row>(`${apiPath}/${id}`),
    enabled: Boolean(id),
  });
}

export function useResourceCreate(apiPath: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<Row>(apiPath, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [apiPath] }),
  });
}
