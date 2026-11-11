import SectionCard from "@/components/clients/detail/SectionCard";
import { formatMoney } from "@/lib/clients";

function Tile({ label, value, tone }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: "var(--nav-hover)" }}>
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[16px] font-semibold tabular-nums tracking-[-0.02em]" style={tone ? { color: tone } : undefined}>
        {value}
      </p>
    </div>
  );
}

export default function CostBreakdown({ clients, totals }) {
  const rows = clients.filter((client) => client.monthlyFee > 0 || client.cost > 0);
  const marginTone = totals.margin > 0 ? "#30D158" : totals.margin < 0 ? "#FF453A" : undefined;

  return (
    <SectionCard title="Cost tracking" delay={160} action={<span className="text-[13px] text-muted-foreground">Team cost vs retainer</span>}>
      <div className="grid grid-cols-3 gap-2">
        <Tile label="Team cost" value={formatMoney(totals.teamCost)} tone="#FF9F0A" />
        <Tile label="Gross profit" value={formatMoney(totals.margin)} tone={marginTone} />
        <Tile label="Margin" value={totals.mrr ? `${totals.marginPct}%` : "—"} tone={marginTone} />
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-[15px] text-muted-foreground">No active retainers to cost against yet.</p>
      ) : (
        <ul className="mt-4 divide-y" style={{ borderColor: "var(--hairline)" }}>
          {rows.map((client) => {
            const pct = client.monthlyFee ? Math.round((client.margin / client.monthlyFee) * 100) : null;
            const tone = client.margin > 0 ? "#30D158" : client.margin < 0 ? "#FF453A" : "var(--nav-fg)";
            return (
              <li key={client.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium">{client.name}</p>
                  <p className="text-[13px] tabular-nums text-muted-foreground">
                    {formatMoney(client.monthlyFee)} revenue · {formatMoney(client.cost)} team
                  </p>
                </div>
                <span className="text-[15px] font-semibold tabular-nums" style={{ color: tone }}>
                  {formatMoney(client.margin)}
                  {pct !== null && <span className="ml-1.5 text-[13px] font-normal text-muted-foreground">{pct}%</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}