import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Loader2 } from "lucide-react";
import { saveYouTubeKey } from "@/lib/analytics-fns";

const STEPS = [
  "Open console.cloud.google.com and pick (or create) a project.",
  "APIs & Services → Library → enable YouTube Data API v3.",
  "Credentials → Create credentials → API key, restricted to YouTube Data API v3.",
  "Paste the key here. It's stored for this app and only used for server-side pulls.",
];

export default function ApiKeyCard({ onSaved }) {
  const save = useServerFn(saveYouTubeKey);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!value.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      await save({ data: { apiKey: value.trim() } });
      setValue("");
      onSaved();
    } catch (requestError) {
      setError(requestError?.message || "That key couldn't be saved.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass animate-rise rounded-2xl p-5" style={{ borderColor: "rgba(255,159,10,0.35)" }}>
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(255,159,10,0.16)", color: "#FF9F0A" }}
        >
          <KeyRound className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Connect your YouTube API key</h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
            Subscribers, views and video stats pull straight from YouTube. Watch time and CTR aren't exposed by the
            public API, so those stay on manual snapshots.
          </p>

          <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="password"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="AIza…"
              aria-label="YouTube Data API v3 key"
              className="h-9 w-full rounded-[10px] px-3 text-[13.5px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
            />
            <button
              type="submit"
              disabled={busy || !value.trim()}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[10px] px-4 text-[13px] font-medium text-white transition-opacity disabled:opacity-40"
              style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {busy ? "Checking…" : "Save key"}
            </button>
          </form>

          {error && <p className="mt-2 text-[12.5px] text-destructive">{error}</p>}

          <details className="mt-2">
            <summary className="cursor-pointer text-[12.5px] text-muted-foreground">Here's how to get a key</summary>
            <ol className="mt-2 space-y-1 pl-4 text-[12.5px] leading-relaxed text-muted-foreground">
              {STEPS.map((step) => (
                <li key={step} className="list-decimal">
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-2 text-[12px] text-muted-foreground">
              Until a key is saved you can still record numbers by hand on any client below.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}