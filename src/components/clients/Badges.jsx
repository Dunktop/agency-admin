import { PAYMENT_COLORS, PAYMENT_LABELS, PLAN_COLORS, PLAN_LABELS, STAGE_BY_KEY } from "@/lib/clients";

function Pill({ color, children }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[13px] font-medium"
      style={{ background: `${color}1f`, color }}
    >
      {children}
    </span>
  );
}

export function PlanBadge({ planType, customPlanLabel }) {
  const color = PLAN_COLORS[planType] || "#8E8E93";
  const label = planType === "CUSTOM" && customPlanLabel ? customPlanLabel : PLAN_LABELS[planType] || "No plan";
  return (
    <Pill color={color}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      <span className="max-w-[220px] truncate">{label}</span>
    </Pill>
  );
}

export function StagePill({ stage }) {
  const meta = STAGE_BY_KEY[stage];
  if (!meta) {
    return (
      <span
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[13px] font-medium text-muted-foreground"
        style={{ background: "var(--nav-hover)" }}
      >
        No stage set
      </span>
    );
  }
  return (
    <Pill color={meta.color}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </Pill>
  );
}

export function StatusPill({ status }) {
  const color = status === "CHURNED" ? "#8E8E93" : "#30D158";
  return <Pill color={color}>{status === "CHURNED" ? "Churned" : "Active"}</Pill>;
}

export function PaymentPill({ status }) {
  return <Pill color={PAYMENT_COLORS[status] || "#8E8E93"}>{PAYMENT_LABELS[status] ? status.toLowerCase() : status}</Pill>;
}

export function FormatPill({ format }) {
  const longForm = format === "LONG_FORM";
  return <Pill color={longForm ? "#BF5AF2" : "#64D2FF"}>{longForm ? "Long-form" : "Short-form"}</Pill>;
}