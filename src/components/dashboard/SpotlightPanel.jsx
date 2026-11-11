export default function SpotlightPanel() {
  return (
    <section
      className="glass animate-rise relative overflow-hidden rounded-2xl px-6 py-7 md:px-8 md:py-8"
      style={{ animationDelay: "60ms" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-[70px]"
        style={{ background: "radial-gradient(circle,#0A84FF 0%,rgba(10,132,255,0) 70%)", opacity: 0.35 }}
      />
      <div className="relative flex flex-col gap-1.5">
        <span className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Workspace ready</span>
        <h2 className="text-[22px] font-semibold tracking-[-0.02em] md:text-[22px]">Everything starts here</h2>
        <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
          The data model, navigation and design system are in place. Money, clients and progress fill in module by module.
        </p>
      </div>
      <div className="relative mt-6 flex flex-wrap gap-2">
        {["Money", "Clients", "Calendar", "Leads"].map((label) => (
          <span
            key={label}
            className="rounded-full px-3 py-1 text-[13px] text-muted-foreground"
            style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}