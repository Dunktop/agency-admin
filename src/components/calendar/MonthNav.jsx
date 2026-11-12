import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthLabel } from "./calendar-dates";

export default function MonthNav({ year, month, onStep, onToday }) {
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => onStep(-1)}>
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </button>
      <p className="min-w-[132px] text-center text-[14px] font-medium tabular-nums">{monthLabel(year, month)}</p>
      <button type="button" className="icon-btn" aria-label="Next month" onClick={() => onStep(1)}>
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={onToday}
        className="ml-1 h-8 rounded-[9px] px-2.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
      >
        Today
      </button>
    </div>
  );
}