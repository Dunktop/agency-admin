export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="animate-rise flex flex-wrap items-end justify-between gap-3 pb-1">
      <div>
        <h1 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}