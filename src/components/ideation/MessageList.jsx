import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import MessageBubble from "./MessageBubble";

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

export default function MessageList({ messages, pending, sending }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length, pending, sending]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-1 py-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {pending && <MessageBubble message={{ role: "user", content: pending }} />}
      {sending && <ThinkingBubble />}
      <div ref={endRef} />
    </div>
  );
}