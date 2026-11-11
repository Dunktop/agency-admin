import { formatMoney } from "@/lib/clients";

function StatCard({ label, value, hint, delay, tone }) {
  return (
    <div className="glass animate-rise rounded-2xl p-4 md:p-5" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p
        className="mt-2 text-[24px] font-semibold leading-none tracking-[-0.03em] tabular-nums md:text-[30px]"
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </p>
      {hint && <p className="mt-2 text-[12px] text-muted-foreground md:text-[13px]">{hint}</p>}
    </div>
  );
}

export default function MoneyStatCards({ totals }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatCard
        label="Total revenue"
        value={formatMoney(totals.totalRevenue)}
        hint={`${totals.paidCount} paid invoice${totals.paidCount === 1 ? "" : "s"}`}
        delay={0}
      />
      <StatCard
        label="Current MRR"
        value={formatMoney(totals.mrr)}
        hint={`${totals.activeCount} active client${totals.activeCount === 1 ? "" : "s"}`}
        delay={60}
      />
      <StatCard
        label="Projected annual"
        value={formatMoney(totals.annual)}
        hint="Current MRR × 12 months"
        delay={120}
        tone={totals.annual > 0 ? "#30D158" : undefined}
      />
      <StatCard
        label="Outstanding"
        value={formatMoney(totals.outstanding)}
        hint={`${totals.overdueCount} overdue · ${formatMoney(totals.setupOutstanding)} setup fees`}
        delay={180}
        tone={totals.overdueAmount > 0 ? "#FF453A" : totals.outstanding > 0 ? "#FF9F0A" : undefined}
      />
    </div>
  );
}