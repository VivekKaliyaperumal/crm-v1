'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill } from '@/components/resource/pill';
import { formatINR } from '@/lib/format';

interface RelatedData {
  opportunities: any[];
  deals: any[];
  quotations: any[];
  bookings: any[];
  payments: any[];
  receipts: any[];
  documents: any[];
}

type GroupKey = keyof RelatedData;

const GROUPS: { key: GroupKey; label: string }[] = [
  { key: 'opportunities', label: 'Opportunities' },
  { key: 'deals', label: 'Deals' },
  { key: 'quotations', label: 'Quotations' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'payments', label: 'Payments' },
  { key: 'receipts', label: 'Receipts' },
  { key: 'documents', label: 'Documents' },
];

function renderRow(key: GroupKey, row: any): { primary: React.ReactNode; secondary: React.ReactNode } {
  switch (key) {
    case 'opportunities':
      return { primary: row.title, secondary: <Pill value={row.stage} /> };
    case 'deals':
      return {
        primary: row.title,
        secondary: (
          <span className="flex items-center gap-2">
            <span className="text-slate-600">{formatINR(row.amount)}</span>
            <Pill value={row.status} />
          </span>
        ),
      };
    case 'quotations':
      return {
        primary: row.quotationNumber,
        secondary: (
          <span className="flex items-center gap-2">
            <span className="text-slate-600">{formatINR(row.total)}</span>
            <Pill value={row.status} />
          </span>
        ),
      };
    case 'bookings':
      return {
        primary: row.bookingNumber,
        secondary: (
          <span className="flex items-center gap-2">
            <span className="text-slate-600">{formatINR(row.totalAmount)}</span>
            <Pill value={row.status} />
          </span>
        ),
      };
    case 'payments':
      return {
        primary: formatINR(row.amount),
        secondary: <Pill value={row.status} />,
      };
    case 'receipts':
      return { primary: row.receiptNumber, secondary: <span className="text-slate-600">{formatINR(row.amount)}</span> };
    case 'documents':
      return { primary: row.name, secondary: null };
    default:
      return { primary: row.id, secondary: null };
  }
}

export function RelatedRecords({ customerId }: { customerId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['customer-related', customerId],
    queryFn: () => apiFetch<RelatedData>(`customers/${customerId}/related`),
  });

  if (isLoading) return <div className="shimmer h-32 rounded-2xl" />;
  if (!data) return null;

  const nonEmpty = GROUPS.filter((g) => Array.isArray(data[g.key]) && data[g.key].length > 0);

  if (nonEmpty.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle>Related records</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <p className="py-2 text-center text-sm text-slate-400">No related records yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {nonEmpty.map((g) => {
        const rows = data[g.key];
        return (
          <Card key={g.key} className="overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle>
                {g.label} ({rows.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ul className="divide-y divide-slate-100/80">
                {rows.map((row: any) => {
                  const { primary, secondary } = renderRow(g.key, row);
                  return (
                    <li key={row.id}>
                      <Link
                        href={`/app/${g.key}/${row.id}`}
                        className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-emerald-700"
                      >
                        <span className="text-sm font-medium text-slate-700">{primary}</span>
                        <span className="text-sm">{secondary}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
