'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useMe } from '@/lib/me';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const qc = useQueryClient();
  const { data: me, isLoading } = useMe();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (me) {
      setFullName(me.fullName ?? '');
      setPhone(me.phone ?? '');
    }
  }, [me]);

  const save = useMutation({
    mutationFn: () =>
      apiFetch('me', { method: 'PATCH', body: JSON.stringify({ fullName, phone }) }),
    onSuccess: () => {
      toast.success('Profile updated');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed'),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">My profile</h1>
        <p className="text-sm text-slate-500">Update your personal details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input value={me?.email ?? ''} disabled className="bg-slate-50 text-slate-400" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Full name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-…" />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => save.mutate()} disabled={save.isPending}>
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
