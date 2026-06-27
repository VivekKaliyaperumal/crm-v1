'use client';
import { useParams } from 'next/navigation';
import { getResource } from '@/lib/resource-registry';
import { ResourceList } from '@/components/resource/resource-list';

export default function ResourceListPage() {
  const { resource } = useParams<{ resource: string }>();
  const config = getResource(resource);
  if (!config) {
    return <div className="text-sm text-slate-500">Unknown module: {resource}</div>;
  }
  return <ResourceList config={config} />;
}
