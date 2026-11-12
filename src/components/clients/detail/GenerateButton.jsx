import { Loader2, RefreshCw, Sparkles } from "lucide-react";

export default function GenerateButton({ hasResult, busy, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[9px] px-3 text-[12.5px] font-medium transition-opacity disabled:opacity-40"
      style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : hasResult ? (
        <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.9} />
      ) : (
        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
      )}
      {busy ? "Generating…" : hasResult ? "Regenerate" : "Generate"}
    </button>
  );
}