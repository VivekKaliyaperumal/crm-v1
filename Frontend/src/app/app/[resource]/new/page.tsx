'use client';
import { useParams } from 'next/navigation';
import { getResource } from '@/lib/resource-registry';
import { ResourceForm } from '@/components/resource/resource-form';

export default function ResourceNewPage() {
  const { resource } = useParams<{ resource: string }>();
  const config = getResource(resource);
  if (!config) {
    return <div className="text-sm text-slate-500">Unknown module: {resource}</div>;
  }
  return <ResourceForm config={config} />;
}
