import { Minus, Plus } from "lucide-react";
import { formatMoney } from "@/lib/clients";

export default function MonthlyFeeStepper({ value, onChange, min = 1000, max = 20000, step = 1000 }) {
  const current = Number(value) || min;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(String(Math.max(min, current - step)))}
        disabled={current <= min}
        aria-label="Decrease monthly fee"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] transition-colors disabled:opacity-30"
        style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
      >
        <Minus className="h-4 w-4" strokeWidth={2} />
      </button>

      <div className="flex-1 text-center">
        <p className="text-[22px] font-semibold tabular-nums tracking-[-0.02em]">{formatMoney(current)}</p>
        <p className="text-[13px] text-muted-foreground">per month · {formatMoney(step)} steps</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(String(Math.min(max, current + step)))}
        disabled={current >= max}
        aria-label="Increase monthly fee"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] transition-colors disabled:opacity-30"
        style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}