'use client';
import { useParams } from 'next/navigation';
import { useLead } from '@/lib/leads';
import { LeadForm } from '@/components/leads/lead-form';

export default function EditLeadPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lead, isLoading, isError, error } = useLead(id);

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;
  if (isError || !lead) {
    return (
      <div className="text-sm text-rose-600">
        {error instanceof Error ? error.message : 'Lead not found'}
      </div>
    );
  }
  return <LeadForm lead={lead} />;
}
