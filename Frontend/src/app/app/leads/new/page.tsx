'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  useCreateLead, LEAD_SOURCES, LEAD_STATUSES, STATUS_LABEL, type CreateLeadInput,
} from '@/lib/leads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const schema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  propertyInterest: z.string().optional(),
  budgetMin: z.coerce.number().nonnegative().optional(),
  budgetMax: z.coerce.number().nonnegative().optional(),
  timeline: z.string().optional(),
  source: z.enum(LEAD_SOURCES),
  status: z.enum(LEAD_STATUSES),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const fieldLabel = 'text-sm font-medium text-slate-700';

export default function NewLeadPage() {
  const router = useRouter();
  const create = useCreateLead();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { source: 'manual', status: 'new' },
  });

  async function onSubmit(values: FormValues) {
    const payload: CreateLeadInput = {
      ...values,
      email: values.email || undefined,
    };
    await create.mutateAsync(payload);
    router.push('/app/leads');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/app/leads" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Back to leads
      </Link>
      <h1 className="text-xl font-semibold text-slate-800">New lead</h1>

      <Card>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className={fieldLabel}>Full name *</label>
              <Input {...register('fullName')} placeholder="e.g. Anil Kumar" />
              {errors.fullName && <p className="text-xs text-rose-600">{errors.fullName.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className={fieldLabel}>Phone</label>
                <Input {...register('phone')} placeholder="+91-…" />
              </div>
              <div className="space-y-1">
                <label className={fieldLabel}>Email</label>
                <Input {...register('email')} placeholder="name@example.com" />
                {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className={fieldLabel}>Property interest</label>
              <Input {...register('propertyInterest')} placeholder="e.g. 5-acre orchard land" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className={fieldLabel}>Budget min (₹)</label>
                <Input type="number" {...register('budgetMin')} />
              </div>
              <div className="space-y-1">
                <label className={fieldLabel}>Budget max (₹)</label>
                <Input type="number" {...register('budgetMax')} />
              </div>
              <div className="space-y-1">
                <label className={fieldLabel}>Timeline</label>
                <Input {...register('timeline')} placeholder="e.g. 1-3 months" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className={fieldLabel}>Source</label>
                <select
                  {...register('source')}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                >
                  {LEAD_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={fieldLabel}>Status</label>
                <select
                  {...register('status')}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={fieldLabel}>Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                placeholder="Any context about this lead…"
              />
            </div>

            {create.isError && (
              <p className="text-sm text-rose-600">
                {create.error instanceof Error ? create.error.message : 'Could not create lead'}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Link href="/app/leads">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Saving…' : 'Create lead'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
