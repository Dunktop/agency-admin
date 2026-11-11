import { Sparkles } from "lucide-react";
import MarkdownMessage from "./MarkdownMessage";

export default function MessageBubble({ message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[86%] whitespace-pre-wrap break-words rounded-[18px] px-4 py-2.5 text-[15px] leading-[1.55] text-white"
          style={{ background: "linear-gradient(145deg,#0A84FF,#0060DF)" }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        style={{ background: "linear-gradient(145deg,#0A84FF,#BF5AF2)" }}
      >
        <Sparkles className="h-3 w-3 text-white" strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <MarkdownMessage>{message.content}</MarkdownMessage>
      </div>
    </div>
  );
}