export default function ModuleCard({ title, subtitle, glyph, note, delay = 0 }) {
  return (
    <section className="glass animate-rise flex flex-col gap-5 rounded-2xl p-5" style={{ animationDelay: `${delay}ms` }}>
      <div>
        <h3 className="text-[17px] font-semibold tracking-[-0.01em]">{title}</h3>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="text-foreground">{glyph}</div>
      <p className="text-[13px] text-muted-foreground">{note}</p>
    </section>
  );
}