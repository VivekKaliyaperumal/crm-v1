type Tone = "slate" | "blue" | "amber" | "emerald" | "rose" | "violet";

export function KpiStrip({ items }: { items: { label: string; value: string | number; tone?: Tone; hint?: string }[] }) {
  const toneMap: Record<Tone, string> = {
    slate: "from-slate-500/10 to-slate-500/0 text-slate-700",
    blue: "from-blue-500/15 to-blue-500/0 text-blue-700",
    amber: "from-amber-500/15 to-amber-500/0 text-amber-700",
    emerald: "from-emerald-500/15 to-emerald-500/0 text-emerald-700",
    rose: "from-rose-500/15 to-rose-500/0 text-rose-700",
    violet: "from-violet-500/15 to-violet-500/0 text-violet-700",
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it) => (
        <div key={it.label} className={`rounded-xl border bg-gradient-to-br ${toneMap[it.tone ?? "slate"]} p-4`}>
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] opacity-70">{it.label}</div>
          <div className="mt-1 font-display text-2xl font-semibold tabular-nums">{it.value}</div>
          {it.hint && <div className="text-[11px] mt-1 opacity-60">{it.hint}</div>}
        </div>
      ))}
    </div>
  );
}
