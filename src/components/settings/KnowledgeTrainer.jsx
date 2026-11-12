import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listKnowledge, resetKnowledge, trainKnowledge } from "@/lib/knowledge-fns";
import TrainingTranscript from "./TrainingTranscript";
import TrainingComposer from "./TrainingComposer";
import KnowledgeSummaryDialog from "./KnowledgeSummaryDialog";
import ResetKnowledgeDialog from "./ResetKnowledgeDialog";

export default function KnowledgeTrainer({ scope, trackName, title, blurb, placeholder, emptyHint }) {
  const fetchKnowledge = useServerFn(listKnowledge);
  const train = useServerFn(trainKnowledge);
  const clearKnowledge = useServerFn(resetKnowledge);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    fetchKnowledge({ data: { scope } })
      .then((result) => {
        if (alive) setEntries(result.entries);
      })
      .catch(() => {
        if (alive) setError("Couldn't load the saved knowledge. Refresh the page to try again.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [scope]);

  const send = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setError("");
    setPending(content);
    setDraft("");
    try {
      const result = await train({ data: { scope, content } });
      setEntries((previous) => [...previous, ...result.entries]);
    } catch (requestError) {
      setError(requestError?.message || "That didn't save. Try sending it again.");
      setDraft(content);
    } finally {
      setPending("");
      setSending(false);
    }
  };

  const confirmReset = async () => {
    setResetting(true);
    try {
      await clearKnowledge({ data: { scope } });
      setEntries([]);
      setResetOpen(false);
    } catch {
      setError("Couldn't reset the knowledge. Try again.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="glass overflow-hidden rounded-[18px]">
      <div className="hairline-b flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[14.5px] font-medium">
            {title}
            <span
              className="rounded-full px-2 py-0.5 text-[11.5px] font-normal text-muted-foreground"
              style={{ background: "var(--nav-hover)" }}
            >
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </span>
          </p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{blurb}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-[9px] text-[12.5px]"
            onClick={() => setSummaryOpen(true)}
          >
            <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
            View Current Knowledge
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-[9px] text-[12.5px] text-destructive hover:text-destructive"
            onClick={() => setResetOpen(true)}
            disabled={!entries.length || loading}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
            Reset Knowledge
          </Button>
        </div>
      </div>

      <div className="h-[54vh] min-h-[340px] overflow-y-auto px-3 py-4 sm:px-4">
        <TrainingTranscript
          entries={entries}
          loading={loading}
          pending={pending}
          sending={sending}
          emptyHint={emptyHint}
        />
      </div>

      <div className="p-3" style={{ borderTop: "0.5px solid var(--hairline)" }}>
        <TrainingComposer
          value={draft}
          onChange={setDraft}
          onSend={send}
          sending={sending}
          placeholder={placeholder}
        />
        {error && <p className="mt-2 text-center text-[12.5px] text-destructive">{error}</p>}
      </div>

      <KnowledgeSummaryDialog
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        scope={scope}
        title={`Current ${trackName} knowledge`}
      />
      <ResetKnowledgeDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        onConfirm={confirmReset}
        busy={resetting}
        count={entries.length}
        trackName={trackName.toLowerCase()}
      />
    </div>
  );
}