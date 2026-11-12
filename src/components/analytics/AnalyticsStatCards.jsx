import { formatCompact } from "@/lib/clients";
import { ctrLabel } from "./analytics-format";

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

export default function AnalyticsStatCards({ metrics }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Total views"
        value={formatCompact(metrics.views)}
        hint={metrics.viewsHint || "Channel lifetime views"}
        delay={0}
      />
      <StatCard
        label="Subscribers"
        value={formatCompact(metrics.subscribers)}
        hint={metrics.subscribersHint || "Current subscriber count"}
        delay={60}
      />
      <StatCard
        label="Avg CTR"
        value={ctrLabel(metrics.ctr)}
        hint={metrics.ctrHint || "Manual entry on snapshots"}
        delay={120}
        tone={metrics.ctr ? "#0A84FF" : undefined}
      />
      <StatCard
        label="Watch time"
        value={metrics.watchHours ? `${formatCompact(metrics.watchHours)}h` : "—"}
        hint={metrics.watchHint || "Manual entry on snapshots"}
        delay={180}
        tone={metrics.watchHours ? "#BF5AF2" : undefined}
      />
    </div>
  );
}