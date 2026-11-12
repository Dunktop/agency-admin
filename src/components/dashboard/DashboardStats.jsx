import { formatMoney } from "@/lib/clients";

function Stat({ label, value, hint, tone, delay }) {
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

export default function DashboardStats({ totals }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat
        label="Total MRR"
        value={formatMoney(totals.mrr)}
        hint={`${formatMoney(totals.mrr * 12)} a year at this rate`}
        delay={0}
      />
      <Stat
        label="Total clients"
        value={String(totals.clients)}
        hint={totals.clients === 1 ? "1 active account" : `${totals.clients} active accounts`}
        delay={60}
      />
      <Stat
        label="Revenue this month"
        value={formatMoney(totals.revenueThisMonth)}
        hint="Payments marked collected this month"
        tone={totals.revenueThisMonth > 0 ? "#30D158" : undefined}
        delay={120}
      />
      <Stat
        label="Outstanding"
        value={formatMoney(totals.outstanding)}
        hint="Everything still unpaid"
        tone={totals.outstanding > 0 ? "#FF9F0A" : undefined}
        delay={180}
      />
    </div>
  );
}