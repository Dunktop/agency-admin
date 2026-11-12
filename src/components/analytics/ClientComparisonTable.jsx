import { ChevronRight } from "lucide-react";
import SectionCard from "@/components/clients/detail/SectionCard";
import { formatCompact } from "@/lib/clients";
import { ctrLabel, shortDate } from "./analytics-format";

function Cell({ label, value }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-[0.07em] text-muted-foreground">{label}</p>
      <p className="text-[13.5px] font-medium tabular-nums">{value}</p>
    </div>
  );
}

export default function ClientComparisonTable({ rows, onSelect }) {
  const withData = rows.filter((row) => row.latest);

  return (
    <SectionCard title="Client comparison" delay={60}>
      {withData.length === 0 ? (
        <p className="text-[14.5px] leading-relaxed text-muted-foreground">
          Nothing pulled yet. Pick a client to connect their channel and sync the first snapshot.
        </p>
      ) : (
        <ul className="space-y-1">
          {withData.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onSelect(row.id)}
                className="w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[14px] font-medium">{row.name}</p>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.9} />
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  <Cell label="Views" value={formatCompact(row.latest.views)} />
                  <Cell label="Subs" value={formatCompact(row.latest.subscribers)} />
                  <Cell label="CTR" value={ctrLabel(row.latest.impressionsCTR)} />
                  <Cell label="Synced" value={shortDate(row.latest.date)} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}