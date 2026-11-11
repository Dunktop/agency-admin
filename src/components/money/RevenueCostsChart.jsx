import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SectionCard from "@/components/clients/detail/SectionCard";
import { formatMoney } from "@/lib/clients";
import { AXIS_PROPS, MONEY_COLORS, TOOLTIP_STYLE, moneyTick } from "./chart-theme";

export default function RevenueCostsChart({ data }) {
  const empty = !data.some((point) => point.revenue > 0 || point.cost > 0);

  return (
    <SectionCard title="Revenue vs costs" delay={240} action={<span className="text-[13px] text-muted-foreground">Last 6 months</span>}>
      {empty ? (
        <p className="text-[15px] text-muted-foreground">Collected payments and team costs will chart here.</p>
      ) : (
        <>
          <div className="-ml-1">
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={data} margin={{ top: 6, right: 6, left: 0, bottom: 0 }} barGap={3}>
                <CartesianGrid stroke="var(--hairline)" vertical={false} />
                <XAxis dataKey="label" {...AXIS_PROPS} />
                <YAxis {...AXIS_PROPS} width={48} tickFormatter={moneyTick} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatMoney(value)} />
                <Bar dataKey="revenue" name="Revenue" fill={MONEY_COLORS.revenue} radius={[5, 5, 0, 0]} maxBarSize={18} />
                <Bar dataKey="cost" name="Team cost" fill={MONEY_COLORS.cost} radius={[5, 5, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-4 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: MONEY_COLORS.revenue }} />
              Revenue
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: MONEY_COLORS.cost }} />
              Team cost
            </span>
          </div>
        </>
      )}
    </SectionCard>
  );
}