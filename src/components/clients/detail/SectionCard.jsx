export default function SectionCard({ title, action, children, delay = 0 }) {
  return (
    <section className="glass animate-rise rounded-2xl p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}