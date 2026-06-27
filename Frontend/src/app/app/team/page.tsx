'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/format';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'sales_manager', label: 'Sales Manager' },
  { value: 'sales_executive', label: 'Sales Executive' },
  { value: 'telecaller', label: 'Telecaller' },
] as const;

interface TeamUser {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  roles: string[];
}

function TeamRow({ user }: { user: TeamUser }) {
  const qc = useQueryClient();
  const [roles, setRoles] = useState<string[]>(user.roles);
  const [isActive, setIsActive] = useState(user.isActive);

  const dirty =
    isActive !== user.isActive ||
    roles.length !== user.roles.length ||
    roles.some((r) => !user.roles.includes(r));

  const save = useMutation({
    mutationFn: () =>
      apiFetch(`users/${user.id}`, { method: 'PATCH', body: JSON.stringify({ roles, isActive }) }),
    onSuccess: () => {
      toast.success('Member updated');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed'),
  });

  function toggleRole(role: string) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  return (
    <tr className="border-b border-slate-50 align-top">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-800">{user.fullName ?? '—'}</div>
        <div className="text-xs text-slate-400">{user.email}</div>
        <div className="mt-1 text-[11px] text-slate-400">Joined {formatDate(user.createdAt)}</div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <label
              key={r.value}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-700"
            >
              <input
                type="checkbox"
                checked={roles.includes(r.value)}
                onChange={() => toggleRole(r.value)}
                className="accent-emerald-600"
              />
              {r.label}
            </label>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-emerald-600"
          />
          {isActive ? 'Active' : 'Inactive'}
        </label>
      </td>
      <td className="px-4 py-3 text-right">
        <Button size="sm" disabled={!dirty || save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? 'Saving…' : 'Save'}
        </Button>
      </td>
    </tr>
  );
}

function InviteForm() {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<string[]>(['sales_executive']);

  const invite = useMutation({
    mutationFn: () =>
      apiFetch('users/invite', { method: 'POST', body: JSON.stringify({ email, roles }) }),
    onSuccess: () => {
      toast.success('Invitation sent');
      setEmail('');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Invite failed'),
  });

  function toggleRole(role: string) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-3 pt-5">
        <div className="min-w-[220px] flex-1 space-y-1">
          <label className="text-sm font-medium text-slate-700">Invite by email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="newteammate@company.com"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <label
              key={r.value}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-700"
            >
              <input
                type="checkbox"
                checked={roles.includes(r.value)}
                onChange={() => toggleRole(r.value)}
                className="accent-emerald-600"
              />
              {r.label}
            </label>
          ))}
        </div>
        <Button
          onClick={() => invite.mutate()}
          disabled={invite.isPending || !email.trim() || roles.length === 0}
        >
          <UserPlus className="size-4" /> {invite.isPending ? 'Inviting…' : 'Invite'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function TeamPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<TeamUser[]>('users'),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Team</h1>
        <p className="text-sm text-slate-500">Invite members and manage their roles and access.</p>
      </div>

      <InviteForm />

      {isError && (
        <p className="text-sm text-rose-600">
          {error instanceof Error ? error.message : 'Failed to load team'}
        </p>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Roles</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
                    Loading…
                  </td>
                </tr>
              )}
              {data?.map((u) => (
                <TeamRow key={u.id} user={u} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
