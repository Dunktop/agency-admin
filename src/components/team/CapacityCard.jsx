import SectionCard from "@/components/clients/detail/SectionCard";
import { ROLE_LABELS } from "@/lib/clients";

const OVERLOAD = 3;

export default function CapacityCard({ capacity, delay = 0 }) {
  return (
    <SectionCard
      title="Capacity tracker"
      delay={delay}
      action={<span className="text-[12.5px] text-muted-foreground">Flagged at {OVERLOAD}+ clients</span>}
    >
      {capacity.length === 0 ? (
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          Assign people to clients and their workload shows up here.
        </p>
      ) : (
        <ul className="space-y-1">
          {capacity.map((person) => {
            const overloaded = person.clients >= OVERLOAD;
            return (
              <li
                key={person.name}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
                style={{ background: overloaded ? "rgba(255,69,58,0.12)" : "var(--nav-hover)" }}
              >
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium">{person.name}</p>
                  <p className="truncate text-[11.5px] text-muted-foreground">
                    {person.roles.map((role) => ROLE_LABELS[role] || role).join(" · ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[13px] tabular-nums text-muted-foreground">
                    {person.clients} {person.clients === 1 ? "client" : "clients"}
                  </span>
                  <span
                    className="rounded-full px-2 py-[2px] text-[11px] font-medium"
                    style={
                      overloaded
                        ? { background: "rgba(255,69,58,0.18)", color: "#FF8A80" }
                        : { background: "rgba(48,209,88,0.16)", color: "#30D158" }
                    }
                  >
                    {overloaded ? "Overloaded" : "Available"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}