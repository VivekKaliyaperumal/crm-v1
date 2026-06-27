'use client';
import { useParams } from 'next/navigation';
import { getResource } from '@/lib/resource-registry';
import { ResourceForm } from '@/components/resource/resource-form';
import { useResourceItem } from '@/lib/resource';

export default function ResourceEditPage() {
  const { resource, id } = useParams<{ resource: string; id: string }>();
  const config = getResource(resource);
  const { data, isLoading, isError, error } = useResourceItem(config?.apiPath ?? '', id);

  if (!config) {
    return <div className="text-sm text-slate-500">Unknown module: {resource}</div>;
  }
  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;
  if (isError || !data) {
    return (
      <div className="text-sm text-rose-600">
        {error instanceof Error ? error.message : 'Not found'}
      </div>
    );
  }
  return <ResourceForm config={config} recordId={id} initial={data} />;
}
