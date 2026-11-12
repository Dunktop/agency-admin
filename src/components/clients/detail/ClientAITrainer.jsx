import { useState } from "react";
import { ArrowUp, MessageSquarePlus } from "lucide-react";

export default function ClientAITrainer({ label, hint, placeholder, entries, onTrain, sending }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setError("");
    try {
      await onTrain(content);
      setDraft("");
    } catch (requestError) {
      setError(requestError?.message || "That didn't save. Try sending it again.");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="mt-4 pt-3.5" style={{ borderTop: "0.5px solid var(--hairline)" }}>
      <p className="flex items-center gap-1.5 text-[12.5px] font-medium">
        <MessageSquarePlus className="h-3.5 w-3.5" strokeWidth={1.9} style={{ color: "#64D2FF" }} />
        {label}
      </p>
      <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{hint}</p>

      <div
        className="mt-2 flex items-end gap-2 rounded-[14px] p-1.5"
        style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
      >
        <textarea
          rows={2}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={label}
          className="max-h-[170px] w-full resize-none bg-transparent px-2 py-1.5 text-[14px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={submit}
          disabled={sending || !draft.trim()}
          aria-label="Save training note"
          className="mb-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-30"
          style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </div>

      {error && <p className="mt-1.5 text-[12px] text-destructive">{error}</p>}
      {sending && <p className="mt-1.5 text-[12px] text-muted-foreground">Reading your feedback…</p>}

      {entries.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-[11.5px] text-muted-foreground">
            {entries.length} training {entries.length === 1 ? "note" : "notes"} saved for this client
          </summary>
          <ul className="mt-1.5 space-y-1">
            {entries.slice(-3).map((entry) => (
              <li key={entry.id} className="line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">
                • {entry.note}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}