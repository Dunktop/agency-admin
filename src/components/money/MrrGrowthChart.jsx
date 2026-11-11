import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SectionCard from "@/components/clients/detail/SectionCard";
import { formatMoney } from "@/lib/clients";
import { AXIS_PROPS, MONEY_COLORS, TOOLTIP_STYLE, moneyTick } from "./chart-theme";

export default function MrrGrowthChart({ data }) {
  const empty = !data.some((point) => point.value > 0);

  return (
    <SectionCard title="MRR growth" delay={200} action={<span className="text-[13px] text-muted-foreground">Last 12 months</span>}>
      {empty ? (
        <p className="text-[15px] text-muted-foreground">MRR appears once a client has a monthly fee and a start date.</p>
      ) : (
        <div className="-ml-1">
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={data} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={MONEY_COLORS.mrr} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={MONEY_COLORS.mrr} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--hairline)" vertical={false} />
              <XAxis dataKey="label" {...AXIS_PROPS} interval="preserveStartEnd" />
              <YAxis {...AXIS_PROPS} width={48} tickFormatter={moneyTick} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatMoney(value)} />
              <Area
                type="monotone"
                dataKey="value"
                name="MRR"
                stroke={MONEY_COLORS.mrr}
                strokeWidth={2}
                fill="url(#mrrFill)"
                dot={false}
                activeDot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}