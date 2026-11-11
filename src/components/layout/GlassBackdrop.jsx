export default function GlassBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <div
        className="animate-drift absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, #0A84FF 0%, rgba(10,132,255,0) 70%)", opacity: "var(--orb-opacity)" }}
      />
      <div
        className="animate-drift absolute -right-32 top-1/4 h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, #BF5AF2 0%, rgba(191,90,242,0) 70%)",
          opacity: "var(--orb-opacity)",
          animationDelay: "-9s",
        }}
      />
      <div
        className="animate-drift absolute bottom-[-160px] left-1/3 h-[480px] w-[480px] rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(circle, #64D2FF 0%, rgba(100,210,255,0) 70%)",
          opacity: "var(--orb-opacity)",
          animationDelay: "-16s",
        }}
      />
    </div>
  );
}