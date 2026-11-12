import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SectionCard from "@/components/clients/detail/SectionCard";
import { AXIS_PROPS, TOOLTIP_STYLE } from "@/components/money/chart-theme";

export default function MetricTrendChart({
  title,
  data,
  color = "#0A84FF",
  fillId,
  tickFormatter,
  valueFormatter,
  emptyHint,
  note,
  delay = 0,
}) {
  return (
    <SectionCard
      title={title}
      delay={delay}
      action={note ? <span className="text-[12.5px] text-muted-foreground">{note}</span> : null}
    >
      {data.length > 1 ? (
        <div className="-ml-1">
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={data} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--hairline)" vertical={false} />
              <XAxis dataKey="label" {...AXIS_PROPS} interval="preserveStartEnd" />
              <YAxis {...AXIS_PROPS} width={46} tickFormatter={tickFormatter} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => valueFormatter(value)} />
              <Area
                type="monotone"
                dataKey="value"
                name={title}
                stroke={color}
                strokeWidth={2}
                fill={`url(#${fillId})`}
                dot={false}
                activeDot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-[14.5px] leading-relaxed text-muted-foreground">{emptyHint}</p>
      )}
    </SectionCard>
  );
}