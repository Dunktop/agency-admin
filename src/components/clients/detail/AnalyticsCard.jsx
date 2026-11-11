import { formatCompact, formatDate } from "@/lib/clients";
import SectionCard from "./SectionCard";

function Metric({ label, value }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: "var(--nav-hover)" }}>
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[20px] font-semibold tabular-nums tracking-[-0.02em]">{value}</p>
    </div>
  );
}

export default function AnalyticsCard({ snapshots }) {
  const latest = snapshots[0];

  return (
    <SectionCard
      title="Performance"
      delay={260}
      action={latest ? <span className="text-[13px] text-muted-foreground">{formatDate(latest.date)}</span> : null}
    >
      {!latest ? (
        <p className="text-[15px] text-muted-foreground">No analytics recorded for this client yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Views" value={formatCompact(latest.views)} />
          <Metric label="Subscribers" value={formatCompact(latest.subscribers)} />
          <Metric label="Watch hours" value={formatCompact(latest.watchHours)} />
          <Metric
            label="Impressions CTR"
            value={latest.impressionsCTR ? `${Number(latest.impressionsCTR).toFixed(1)}%` : "—"}
          />
        </div>
      )}
    </SectionCard>
  );
}