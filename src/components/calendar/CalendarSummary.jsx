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

export default function CalendarSummary({ collected, collectedCount, outstanding, outstandingCount }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Stat
        label="Cash collected"
        value={formatMoney(collected)}
        hint={`${collectedCount} payment${collectedCount === 1 ? "" : "s"} marked green`}
        tone="#30D158"
        delay={0}
      />
      <Stat
        label="Still to collect"
        value={formatMoney(outstanding)}
        hint={`${outstandingCount} payment${outstandingCount === 1 ? "" : "s"} this month`}
        tone={outstanding > 0 ? "#FF9F0A" : undefined}
        delay={60}
      />
      <Stat
        label="Total due this month"
        value={formatMoney(collected + outstanding)}
        hint="Setup fees and retainers"
        delay={120}
      />
    </div>
  );
}