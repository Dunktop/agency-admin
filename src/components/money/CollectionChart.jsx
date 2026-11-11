import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import SectionCard from "@/components/clients/detail/SectionCard";
import { formatMoney } from "@/lib/clients";
import { MONEY_COLORS, TOOLTIP_STYLE } from "./chart-theme";

const SEGMENT_COLORS = {
  Collected: MONEY_COLORS.paid,
  Pending: MONEY_COLORS.pending,
  Overdue: MONEY_COLORS.overdue,
};

export default function CollectionChart({ segments, rate }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <SectionCard title="Collection rate" delay={280} action={<span className="text-[13px] text-muted-foreground">All invoices</span>}>
      {total === 0 ? (
        <p className="text-[15px] text-muted-foreground">Collection rate appears once invoices exist.</p>
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie
                  data={segments.filter((segment) => segment.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="none"
                >
                  {segments
                    .filter((segment) => segment.value > 0)
                    .map((segment) => (
                      <Cell key={segment.name} fill={SEGMENT_COLORS[segment.name] || MONEY_COLORS.paid} />
                    ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatMoney(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[24px] font-semibold tabular-nums tracking-[-0.02em]">{rate}%</span>
              <span className="text-[12px] text-muted-foreground">collected</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
            {segments.map((segment) => (
              <span key={segment.name} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: SEGMENT_COLORS[segment.name] }} />
                {segment.name}
                <span className="tabular-nums text-foreground">{formatMoney(segment.value)}</span>
              </span>
            ))}
          </div>
        </>
      )}
    </SectionCard>
  );
}