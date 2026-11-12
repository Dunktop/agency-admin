import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="group mt-2 flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2 text-left font-mono text-[12px] transition-colors"
      style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
      aria-label="Copy to clipboard"
    >
      <span className="min-w-0 break-all text-muted-foreground">{code}</span>
      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground group-hover:text-foreground">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}