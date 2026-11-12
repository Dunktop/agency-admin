import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SectionCard from "@/components/clients/detail/SectionCard";
import { formatCompact } from "@/lib/clients";
import { AXIS_PROPS, TOOLTIP_STYLE } from "@/components/money/chart-theme";
import { numberTick } from "./analytics-format";

export default function ViewsByClientChart({ rows, delay = 0 }) {
  return (
    <SectionCard title="Views by client" delay={delay}>
      {rows.length === 0 ? (
        <p className="text-[14.5px] leading-relaxed text-muted-foreground">
          No snapshots yet. Open a client and pull their channel stats to start the comparison.
        </p>
      ) : (
        <div className="-ml-2">
          <ResponsiveContainer width="100%" height={Math.max(190, rows.length * 34)}>
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--hairline)" horizontal={false} />
              <XAxis type="number" {...AXIS_PROPS} tickFormatter={numberTick} />
              <YAxis type="category" dataKey="name" {...AXIS_PROPS} width={96} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => `${formatCompact(value)} views`} />
              <Bar dataKey="value" name="Views" fill="#0A84FF" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}