'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Org {
  id: string;
  name: string;
  slug: string;
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['organization'],
    queryFn: () => apiFetch<Org>('organization'),
  });
  const [name, setName] = useState('');

  useEffect(() => {
    if (data) setName(data.name);
  }, [data]);

  const save = useMutation({
    mutationFn: () => apiFetch('organization', { method: 'PATCH', body: JSON.stringify({ name }) }),
    onSuccess: () => {
      toast.success('Organization updated');
      qc.invalidateQueries({ queryKey: ['organization'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed'),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Organization settings</h1>
        <p className="text-sm text-slate-500">Manage your organization profile.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Organization name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Slug</label>
                <Input value={data?.slug ?? ''} disabled className="bg-slate-50 text-slate-400" />
                <p className="text-xs text-slate-400">The slug cannot be changed.</p>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => save.mutate()}
                  disabled={save.isPending || !name.trim() || name === data?.name}
                >
                  {save.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
