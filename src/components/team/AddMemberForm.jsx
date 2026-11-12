import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus } from "lucide-react";
import { ROLE_LABELS } from "@/lib/clients";
import { addTeamMember } from "@/lib/team-fns";

const INPUT_STYLE = { background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" };
const ROLES = Object.keys(ROLE_LABELS);

export default function AddMemberForm({ clientId, onAdded }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("SHORT_FORM_EDITOR");
  const [cost, setCost] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const add = useServerFn(addTeamMember);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      await add({
        data: { clientId, name: name.trim(), role, cost: cost === "" ? 0 : Number(cost) },
      });
      setName("");
      setCost("");
      setOpen(false);
      await onAdded();
    } catch (requestError) {
      setError(requestError?.message || "That member couldn't be added.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1.5 rounded-[9px] px-2.5 py-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        style={INPUT_STYLE}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
        Add member
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 space-y-2">
      <div className="grid gap-2 sm:grid-cols-[1.2fr_1.2fr_0.7fr]">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          aria-label="Member name"
          className="h-9 min-w-0 rounded-[10px] px-3 text-[13px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          style={INPUT_STYLE}
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          aria-label="Role"
          className="h-9 min-w-0 rounded-[10px] px-2 text-[13px] outline-none focus:ring-2 focus:ring-ring"
          style={INPUT_STYLE}
        >
          {ROLES.map((value) => (
            <option key={value} value={value}>
              {ROLE_LABELS[value]}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          step="any"
          value={cost}
          onChange={(event) => setCost(event.target.value)}
          placeholder="Monthly cost"
          aria-label="Monthly cost"
          className="h-9 min-w-0 rounded-[10px] px-3 text-[13px] tabular-nums outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          style={INPUT_STYLE}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="inline-flex h-8 items-center gap-1.5 rounded-[9px] px-3 text-[12.5px] font-medium text-white transition-opacity disabled:opacity-40"
          style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
        >
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {busy ? "Adding…" : "Save member"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-8 rounded-[9px] px-3 text-[12.5px] font-medium text-muted-foreground"
          style={INPUT_STYLE}
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-[12px] text-destructive">{error}</p>}
    </form>
  );
}