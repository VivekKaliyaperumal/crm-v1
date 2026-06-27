import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { createLead } from "@/lib/leads.functions";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_SOURCES } from "@/lib/permissions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/app/leads/new")({
  component: NewLead,
});

function NewLead() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(createLead);
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link to="/app/leads" className="text-sm text-muted-foreground hover:underline">
          ← Back to leads
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid sm:grid-cols-2 gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setLoading(true);
              try {
                const res = await create({
                  data: {
                    full_name: String(fd.get("full_name")),
                    phone: String(fd.get("phone") || "") || null,
                    email: String(fd.get("email") || "") || null,
                    property_interest: String(fd.get("property_interest") || "") || null,
                    budget_min: fd.get("budget_min")
                      ? Number(fd.get("budget_min"))
                      : null,
                    budget_max: fd.get("budget_max")
                      ? Number(fd.get("budget_max"))
                      : null,
                    timeline: String(fd.get("timeline") || "") || null,
                    source: (String(fd.get("source") || "manual") as any) || "manual",
                    notes: String(fd.get("notes") || "") || null,
                  },
                });
                qc.invalidateQueries({ queryKey: ["leads"] });
                qc.invalidateQueries({ queryKey: ["dashboard"] });
                toast.success("Lead created and auto-assigned.");
                navigate({ to: "/app/leads/$leadId", params: { leadId: res.id } });
              } catch (err) {
                toast.error((err as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            <Field label="Full name" name="full_name" required />
            <Field label="Phone" name="phone" />
            <Field label="Email" name="email" type="email" />
            <Field label="Property interest" name="property_interest" />
            <Field label="Budget min" name="budget_min" type="number" />
            <Field label="Budget max" name="budget_max" type="number" />
            <Field label="Timeline" name="timeline" />
            <div>
              <Label>Source</Label>
              <Select name="source" defaultValue="manual">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create lead"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} />
    </div>
  );
}