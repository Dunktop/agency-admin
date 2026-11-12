export default function GenerationSkeleton({ label = "Rendering thumbnail" }) {
  return (
    <div
      className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[14px]"
      style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
    >
      <div
        className="animate-shimmer absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, transparent 25%, rgba(255,255,255,0.10) 50%, transparent 75%)",
          backgroundSize: "200% 100%",
        }}
      />
      <span className="relative z-10 text-[13px] text-muted-foreground">{label}…</span>
    </div>
  );
}