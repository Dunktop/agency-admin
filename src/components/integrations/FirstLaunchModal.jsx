import { ArrowRight, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { INTEGRATION_CATALOG } from "./integration-catalog";
import IntegrationIcon from "./IntegrationIcon";

const REQUIREMENT_STYLE = {
  Required: { color: "#0A84FF", background: "rgba(10,132,255,0.16)" },
  Recommended: { color: "#FF9F0A", background: "rgba(255,159,10,0.14)" },
  Optional: { color: "#9a9aa0", background: "rgba(120,120,128,0.18)" },
};

export default function FirstLaunchModal({ open, integrations, onGetStarted, onSkip }) {
  const connected = new Set(integrations.filter((entry) => entry.status === "CONNECTED").map((entry) => entry.id));

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onSkip?.()}>
      <DialogContent
        className="glass-strong max-h-[92vh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto border-0 p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <div className="p-6 md:p-8">
          <span
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: "rgba(10,132,255,0.16)", color: "#0A84FF" }}
          >
            <Sparkles className="h-5 w-5" strokeWidth={1.9} />
          </span>

          <DialogTitle className="mt-4 text-[26px] font-semibold leading-tight tracking-[-0.02em] md:text-[30px]">
            Welcome to Agency Admin
          </DialogTitle>
          <DialogDescription className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Nothing is connected yet. Work down the list in order — the AI comes first because it powers ideation,
            thumbnails, channel analysis and the Discord agent.
          </DialogDescription>

          <ul className="mt-5 space-y-2">
            {INTEGRATION_CATALOG.map((entry, index) => {
              const style = REQUIREMENT_STYLE[entry.requirement] || REQUIREMENT_STYLE.Optional;
              return (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: "var(--nav-hover)" }}
                >
                  <span className="mt-0.5 text-[12px] tabular-nums text-muted-foreground">{index + 1}</span>
                  <IntegrationIcon id={entry.id} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14px] font-medium leading-snug">{entry.name}</p>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.04em]"
                        style={style}
                      >
                        {entry.requirement}
                      </span>
                      {connected.has(entry.id) && (
                        <span className="text-[10.5px] uppercase tracking-[0.04em]" style={{ color: "#30D158" }}>
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{entry.blurb}</p>
                  </div>
                  <span className="shrink-0 text-[11.5px] text-muted-foreground">{entry.minutes}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] px-5 text-[14px] font-medium text-white"
              style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="h-11 shrink-0 px-4 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}