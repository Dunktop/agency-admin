import { Check } from "lucide-react";

export default function ObjectiveRow({ objective, busy, onToggle }) {
  return (
    <li className="flex items-start gap-2.5 py-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={objective.done}
        aria-label={objective.title}
        disabled={busy}
        onClick={() => onToggle(objective)}
        className="mt-[2px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] transition-colors disabled:opacity-50"
        style={{
          background: objective.done ? "#30D158" : "transparent",
          border: `1.5px solid ${objective.done ? "#30D158" : "var(--input)"}`,
        }}
      >
        {objective.done && <Check className="h-3 w-3" strokeWidth={3} style={{ color: "#06240F" }} />}
      </button>
      <p
        className="min-w-0 flex-1 text-[14px] leading-relaxed"
        style={{
          color: objective.done ? "var(--nav-fg)" : "inherit",
          textDecoration: objective.done ? "line-through" : "none",
        }}
      >
        {objective.title}
      </p>
    </li>
  );
}