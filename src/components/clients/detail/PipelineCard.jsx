import { STAGES, formatDate } from "@/lib/clients";
import SectionCard from "./SectionCard";

export default function PipelineCard({ stage, updatedAt }) {
  const currentIndex = STAGES.findIndex((item) => item.key === stage);

  return (
    <SectionCard
      title="Production pipeline"
      delay={140}
      action={updatedAt ? <span className="text-[13px] text-muted-foreground">{formatDate(updatedAt)}</span> : null}
    >
      {currentIndex === -1 && (
        <p className="mb-3 text-[13px] text-muted-foreground">No production update recorded yet.</p>
      )}
      <ol className="relative">
        {STAGES.map((item, index) => {
          const done = currentIndex > -1 && index < currentIndex;
          const current = index === currentIndex;
          const color = current ? item.color : done ? "#30D158" : "var(--hairline)";
          return (
            <li key={item.key} className="relative flex gap-3 pb-3.5 last:pb-0">
              {index < STAGES.length - 1 && (
                <span
                  className="absolute left-[7px] top-4 h-full w-[1px]"
                  style={{ background: done ? "rgba(48,209,88,0.45)" : "var(--hairline)" }}
                />
              )}
              <span
                className="relative mt-[3px] h-[15px] w-[15px] shrink-0 rounded-full transition-all"
                style={{
                  background: current ? item.color : done ? "transparent" : "transparent",
                  border: `1.5px solid ${color}`,
                  boxShadow: current ? `0 0 0 4px ${item.color}22` : "none",
                }}
              />
              <div className="min-w-0">
                <p
                  className="text-[15px] leading-tight"
                  style={{
                    fontWeight: current ? 500 : 400,
                    color: current ? "inherit" : done ? "inherit" : "var(--nav-fg)",
                    opacity: done ? 0.75 : 1,
                  }}
                >
                  {item.label}
                </p>
                {current && <p className="mt-0.5 text-[13px]" style={{ color: item.color }}>In progress</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
}