import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Plus } from "lucide-react";
import SectionCard from "@/components/clients/detail/SectionCard";
import { addObjective, toggleObjective } from "@/lib/dashboard-fns";
import GuaranteeTracker from "./GuaranteeTracker";
import ObjectiveRow from "./ObjectiveRow";

export default function DailyObjectives({ objectives, clients }) {
  const router = useRouter();
  const toggle = useServerFn(toggleObjective);
  const add = useServerFn(addObjective);

  const [busyId, setBusyId] = useState(null);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);

  const handleToggle = async (objective) => {
    setBusyId(objective.id);
    try {
      await toggle({ data: { id: objective.id, done: !objective.done } });
      await router.invalidate();
    } finally {
      setBusyId(null);
    }
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title || adding) return;
    setAdding(true);
    try {
      await add({ data: { title } });
      setDraft("");
      await router.invalidate();
    } finally {
      setAdding(false);
    }
  };

  const open = objectives.filter((objective) => !objective.done);
  const done = objectives.filter((objective) => objective.done);

  return (
    <SectionCard
      title="Daily objectives"
      delay={220}
      action={
        <span className="text-[12.5px] text-muted-foreground tabular-nums">
          {done.length}/{objectives.length} done
        </span>
      }
    >
      {objectives.length === 0 ? (
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          Nothing on the list. Add the first objective below.
        </p>
      ) : (
        <ul className="divide-y" style={{ borderColor: "var(--hairline)" }}>
          {[...open, ...done].map((objective) => (
            <ObjectiveRow
              key={objective.id}
              objective={objective}
              busy={busyId === objective.id}
              onToggle={handleToggle}
            />
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add an objective…"
          aria-label="New objective"
          className="h-9 w-full min-w-0 rounded-[10px] px-3 text-[13.5px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
        />
        <button
          type="submit"
          disabled={adding || !draft.trim()}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white transition-opacity disabled:opacity-40"
          style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
          aria-label="Add objective"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </form>

      <GuaranteeTracker clients={clients} />
    </SectionCard>
  );
}