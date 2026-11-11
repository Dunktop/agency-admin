import { PlanBadge } from "@/components/clients/Badges";
import SectionCard from "@/components/clients/detail/SectionCard";
import { formatMoney } from "@/lib/clients";

const SETUP_META = {
  PAID: { label: "Setup paid", color: "#30D158" },
  OUTSTANDING: { label: "Setup due", color: "#FF9F0A" },
  NONE: { label: "Not invoiced", color: "#8E8E93" },
};

function SetupPill({ status }) {
  const meta = SETUP_META[status] || SETUP_META.NONE;
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[13px] font-medium"
      style={{ background: `${meta.color}1f`, color: meta.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

export default function MrrBreakdown({ clients, totals }) {
  return (
    <SectionCard
      title="MRR breakdown"
      delay={80}
      action={<span className="text-[13px] tabular-nums text-muted-foreground">{formatMoney(totals.mrr)} / month</span>}
    >
      {clients.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">No active clients yet. Add a client to start tracking MRR.</p>
      ) : (
        <ul className="divide-y" style={{ borderColor: "var(--hairline)" }}>
          {clients.map((client) => (
            <li key={client.id} className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium">{client.name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <PlanBadge planType={client.planType} customPlanLabel={client.customPlanLabel} />
                  <SetupPill status={client.setupStatus} />
                </div>
              </div>
              <span className="text-[15px] font-semibold tabular-nums">{formatMoney(client.monthlyFee)}</span>
            </li>
          ))}
        </ul>
      )}

      {totals.setupOutstanding > 0 && (
        <p className="mt-3 border-t pt-3 text-[13px] text-muted-foreground" style={{ borderColor: "var(--hairline)" }}>
          Setup fees still outstanding:{" "}
          <span className="font-medium tabular-nums" style={{ color: "#FF9F0A" }}>
            {formatMoney(totals.setupOutstanding)}
          </span>
        </p>
      )}
    </SectionCard>
  );
}