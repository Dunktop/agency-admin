import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { X } from "lucide-react";
import { ROLE_LABELS, formatMoney } from "@/lib/clients";
import { removeTeamMember } from "@/lib/team-fns";
import AddMemberForm from "./AddMemberForm";

export default function TeamLane({ lane, delay = 0 }) {
  const router = useRouter();
  const remove = useServerFn(removeTeamMember);
  const [busyId, setBusyId] = useState(null);

  const handleRemove = async (id) => {
    setBusyId(id);
    try {
      await remove({ data: { id } });
      await router.invalidate();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="glass animate-rise rounded-2xl p-4 md:p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="min-w-0 truncate text-[15.5px] font-semibold tracking-[-0.01em]">{lane.name}</h2>
        <div className="text-right">
          <p className="text-[14px] font-semibold tabular-nums">{formatMoney(lane.cost)}</p>
          <p className="text-[11px] text-muted-foreground">
            {lane.members.length} {lane.members.length === 1 ? "person" : "people"} / month
          </p>
        </div>
      </div>

      {lane.members.length === 0 ? (
        <p className="mt-2 text-[13.5px] text-muted-foreground">Nobody assigned to this client yet.</p>
      ) : (
        <ul className="mt-2 divide-y" style={{ borderColor: "var(--hairline)" }}>
          {lane.members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium">{member.name}</p>
                <p className="text-[11.5px] text-muted-foreground">{ROLE_LABELS[member.role] || member.role}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-[13px] tabular-nums text-muted-foreground">{formatMoney(member.cost)}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(member.id)}
                  disabled={busyId === member.id}
                  aria-label={`Remove ${member.name} from ${lane.name}`}
                  className="icon-btn h-7 w-7 disabled:opacity-40"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddMemberForm clientId={lane.id} onAdded={() => router.invalidate()} />
    </section>
  );
}