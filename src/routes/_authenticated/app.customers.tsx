import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listCustomers } from "@/lib/customers.functions";
import { PageHeader } from "@/components/crm/PageHeader";
import { KpiStrip } from "@/components/crm/KpiStrip";
import { EmptyState } from "@/components/crm/EmptyState";
import { UserCheck, Phone, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const opts = queryOptions({ queryKey: ["customers"], queryFn: () => listCustomers({ data: {} }) });

export const Route = createFileRoute("/_authenticated/app/customers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: CustomersPage,
  errorComponent: ({ error }) => <div className="text-destructive text-sm">{error.message}</div>,
});

function CustomersPage() {
  const { data: customers } = useSuspenseQuery(opts);
  const verified = customers.filter((c: any) => c.kyc_status === "verified").length;
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sales"
        title="Customers"
        description="Converted leads now part of your customer book."
        actions={<Button size="lg"><Plus className="size-4 mr-1.5" />New customer</Button>}
      />
      <KpiStrip items={[
        { label: "Total customers", value: customers.length, tone: "slate" },
        { label: "KYC verified", value: verified, tone: "emerald" },
        { label: "Pending KYC", value: customers.length - verified, tone: "amber" },
        { label: "This month", value: customers.filter((c: any) => new Date(c.created_at) > new Date(Date.now() - 30 * 86400_000)).length, tone: "blue" },
      ]} />
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        {customers.length === 0 ? (
          <EmptyState icon={<UserCheck className="size-5" />} title="No customers yet" description="Convert leads or add customers directly." />
        ) : (
          <ul className="divide-y">
            {customers.map((c: any) => {
              const initials = c.full_name.split(/\s+/).map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();
              return (
                <li key={c.id} className="px-5 py-4 flex items-center gap-4 hover:bg-muted/30">
                  <div className="size-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 grid place-items-center text-sm font-semibold text-primary shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{c.full_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1"><Phone className="size-3" />{c.phone}</span>
                      {c.email && <span className="flex items-center gap-1 truncate"><Mail className="size-3" />{c.email}</span>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${c.kyc_status === "verified" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : c.kyc_status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
                    {c.kyc_status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
