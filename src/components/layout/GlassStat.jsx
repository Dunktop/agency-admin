export default function GlassStat({ label, value, hint, tone, delay = 0 }) {
  return (
    <div className="glass animate-rise rounded-2xl p-4 md:p-5" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p
        className="mt-2 text-[24px] font-semibold leading-none tracking-[-0.03em] tabular-nums md:text-[30px]"
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </p>
      {hint && <p className="mt-2 text-[12px] text-muted-foreground md:text-[13px]">{hint}</p>}
    </div>
  );
}