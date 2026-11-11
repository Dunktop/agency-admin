import { Tag } from "lucide-react";

function dayLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" });
}

export default function ThreadRow({ thread, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(thread.id)}
      data-active={active ? "true" : "false"}
      className="nav-item w-full rounded-[10px] px-2.5 py-2 text-left"
    >
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1 truncate text-[13.5px] leading-snug text-foreground">{thread.title}</span>
        <span className="shrink-0 pt-[1px] text-[11px] tabular-nums text-muted-foreground">{dayLabel(thread.createdAt)}</span>
      </div>
      {thread.clientName && (
        <span
          className="mt-1 inline-flex max-w-full items-center gap-1 truncate rounded-full px-1.5 py-[1px] text-[10.5px] font-medium"
          style={{ background: "rgba(10,132,255,0.14)", color: "#64D2FF" }}
        >
          <Tag className="h-2.5 w-2.5 shrink-0" strokeWidth={2.2} />
          <span className="truncate">{thread.clientName}</span>
        </span>
      )}
    </button>
  );
}