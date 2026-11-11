import { Sparkles } from "lucide-react";

export default function ComingSoon({ description }) {
  return (
    <div
      className="glass animate-rise flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center"
      style={{ animationDelay: "80ms" }}
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[14px]" style={{ background: "var(--nav-active)" }}>
        <Sparkles className="h-5 w-5" strokeWidth={1.6} style={{ color: "#64D2FF" }} />
      </div>
      <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Coming soon</h2>
      <p className="mt-1.5 max-w-sm text-[15px] leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}