import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

export default function AiUnavailable({ instructions }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl px-4 py-3.5" style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}>
      <div className="flex items-start gap-2.5">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} style={{ color: "#64D2FF" }} />
        <div className="min-w-0">
          <p className="text-[15px] leading-relaxed">This tool will be available once you connect your API key</p>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium"
            style={{ color: "#0A84FF" }}
          >
            Here's how
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
          </button>
          {open && (
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {instructions ||
                "Open Settings, go to Integrations & API keys, and paste your key. Save it and this tool starts working automatically — no redeploy needed."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}