import { Sparkles } from "lucide-react";

export default function ChatEmptyState() {
  return (
    <div className="px-4 text-center">
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px]"
        style={{
          background: "linear-gradient(145deg,rgba(10,132,255,0.9),rgba(191,90,242,0.85))",
          boxShadow: "0 12px 30px -14px rgba(10,132,255,0.9)",
        }}
      >
        <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
      </div>
      <h2 className="mt-5 text-[26px] font-semibold tracking-[-0.02em] md:text-[29px]">What are we ideating?</h2>
      <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
        Titles, thumbnail concepts, hooks and growth angles — grounded in your clients' real channels.
      </p>
    </div>
  );
}