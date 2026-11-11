import { Search, Plus, SlidersHorizontal } from "lucide-react";
import { PLAN_OPTIONS } from "@/lib/clients";

export default function ClientsToolbar({ query, onQuery, plan, onPlan, editMode, onToggleEdit, onAdd }) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <div
        className="relative flex h-10 flex-1 items-center rounded-[10px] px-3"
        style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
      >
        <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.9} />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search clients"
          className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-2.5">
        <div
          className="relative flex h-10 items-center rounded-[10px] pl-3"
          style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.9} />
          <select
            value={plan}
            onChange={(event) => onPlan(event.target.value)}
            aria-label="Filter by plan type"
            className="h-full appearance-none bg-transparent pl-2 pr-7 text-[15px] outline-none"
            style={{ color: "inherit" }}
          >
            <option value="ALL" style={{ background: "#1c1c1e" }}>
              All plans
            </option>
            {PLAN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} style={{ background: "#1c1c1e" }}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onToggleEdit}
          aria-pressed={editMode}
          className="inline-flex h-10 items-center rounded-[10px] px-3.5 text-[15px] font-medium transition-colors"
          style={{
            background: editMode ? "rgba(10,132,255,0.16)" : "var(--nav-hover)",
            color: editMode ? "#0A84FF" : "inherit",
            border: "0.5px solid var(--glass-border)",
          }}
        >
          {editMode ? "Done" : "Edit"}
        </button>

        <button
          type="button"
          onClick={onAdd}
          className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-[10px] px-4 text-[15px] font-medium text-white transition-opacity hover:opacity-90 sm:ml-0"
          style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Add Client
        </button>
      </div>
    </div>
  );
}