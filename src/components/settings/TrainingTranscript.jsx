import { useEffect, useRef } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import MessageBubble from "@/components/ideation/MessageBubble";

const PREVIEW_CHARS = 2400;

function UserBubble({ text }) {
  const long = text.length > PREVIEW_CHARS;
  const shown = long ? `${text.slice(0, PREVIEW_CHARS).trimEnd()}…` : text;
  return (
    <div className="space-y-1.5">
      <MessageBubble message={{ role: "user", content: shown }} />
      {long && (
        <p className="pr-1 text-right text-[11.5px] text-muted-foreground">
          {text.length.toLocaleString("en-GB")} characters saved in full
        </p>
      )}
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex gap-3">
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        style={{ background: "linear-gradient(145deg,#0A84FF,#BF5AF2)" }}
      >
        <Sparkles className="h-3 w-3 animate-pulse text-white" strokeWidth={2.2} />
      </div>
      <div className="flex items-center gap-1.5 pt-1.5">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: "var(--nav-fg)", animationDelay: `${index * 160}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function TrainingTranscript({ entries, loading, pending, sending, emptyHint }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [entries.length, pending, sending]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4">
        {[0, 1, 2].map((row) => (
          <div key={row} className="space-y-3">
            <div className="ml-auto h-9 w-2/3 animate-pulse rounded-[18px]" style={{ background: "var(--nav-hover)" }} />
            <div className="h-4 w-full animate-pulse rounded" style={{ background: "var(--nav-hover)" }} />
            <div className="h-4 w-4/5 animate-pulse rounded" style={{ background: "var(--nav-hover)" }} />
          </div>
        ))}
      </div>
    );
  }

  if (!entries.length && !pending && !sending) {
    return (
      <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-3 py-10 text-center">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(145deg,#0A84FF,#BF5AF2)" }}
        >
          <Wand2 className="h-4 w-4 text-white" strokeWidth={2.2} />
        </div>
        <p className="text-[14px] text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {entries.map((entry) => (
        <div key={entry.id} className="space-y-3">
          <UserBubble text={entry.userInput} />
          <MessageBubble message={{ role: "assistant", content: entry.learnedPrinciple }} />
        </div>
      ))}
      {pending && <UserBubble text={pending} />}
      {sending && <ThinkingBubble />}
      <div ref={endRef} />
    </div>
  );
}