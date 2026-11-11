import { ROLE_LABELS, formatMoney } from "@/lib/clients";
import SectionCard from "./SectionCard";

export default function TeamCard({ team }) {
  return (
    <SectionCard title="Assigned team" delay={180}>
      {team.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">No team members assigned yet.</p>
      ) : (
        <ul className="divide-y" style={{ borderColor: "var(--hairline)" }}>
          {team.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-[15px]">{member.name}</p>
                <p className="text-[13px] text-muted-foreground">{ROLE_LABELS[member.role] || member.role}</p>
              </div>
              <p className="shrink-0 text-[15px] tabular-nums text-muted-foreground">{formatMoney(member.cost)}</p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}