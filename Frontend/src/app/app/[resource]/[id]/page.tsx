'use client';
import { useParams } from 'next/navigation';
import { getResource } from '@/lib/resource-registry';
import { ResourceDetail } from '@/components/resource/resource-detail';

export default function ResourceDetailPage() {
  const { resource, id } = useParams<{ resource: string; id: string }>();
  const config = getResource(resource);
  if (!config) {
    return <div className="text-sm text-slate-500">Unknown module: {resource}</div>;
  }
  return <ResourceDetail config={config} id={id} />;
}
