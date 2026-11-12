import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MarkdownMessage from "@/components/ideation/MarkdownMessage";
import { summarizeKnowledge } from "@/lib/knowledge-fns";

export default function KnowledgeSummaryDialog({ open, onOpenChange, scope, title }) {
  const fetchSummary = useServerFn(summarizeKnowledge);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    setError("");
    setSummary("");
    fetchSummary({ data: { scope } })
      .then((result) => {
        if (!alive) return;
        setSummary(result.summary);
      })
      .catch(() => {
        if (alive) setError("Couldn't read the knowledge base just now. Close and try again.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, scope]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[62vh] overflow-y-auto pr-1">
          {loading && (
            <div className="flex items-center gap-2 py-6 text-[14px] text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Reading every saved rule…
            </div>
          )}
          {!loading && error && <p className="py-4 text-[14px] text-destructive">{error}</p>}
          {!loading && !error && !summary && (
            <p className="py-4 text-[14px] text-muted-foreground">
              No training saved for this track yet. Paste principles or examples in the chat and they'll show up here.
            </p>
          )}
          {!loading && !error && summary && <MarkdownMessage>{summary}</MarkdownMessage>}
        </div>
      </DialogContent>
    </Dialog>
  );
}