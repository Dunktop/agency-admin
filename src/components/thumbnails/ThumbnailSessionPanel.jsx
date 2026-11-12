import { useMemo } from "react";
import { Search, SquarePen } from "lucide-react";
import SessionButton from "./SessionButton";

export default function ThumbnailSessionPanel({
  sessions,
  search,
  onSearch,
  activeId,
  onSelect,
  onNew,
  className = "",
}) {
  const groups = useMemo(() => {
    const map = new Map();
    for (const session of sessions) {
      const key = session.clientName || "No client";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(session);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [sessions]);

  return (
    <div className={className}>
      <div className="flex shrink-0 items-center gap-1.5 pb-2 pl-1.5">
        <span className="text-[13px] font-semibold tracking-[-0.01em]">Sessions</span>
        <span className="text-[12px] tabular-nums text-muted-foreground">{sessions.length}</span>
        <button
          type="button"
          onClick={onNew}
          className="icon-btn ml-auto !h-7 !w-7"
          aria-label="New session"
          title="New session"
        >
          <SquarePen className="h-[15px] w-[15px]" strokeWidth={1.8} />
        </button>
      </div>

      <div
        className="relative flex h-8 shrink-0 items-center rounded-[9px] px-2.5"
        style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
      >
        <Search className="mr-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search sessions"
          aria-label="Search sessions"
          className="h-full w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-2 min-h-0 flex-1 space-y-3 overflow-y-auto pr-0.5">
        {groups.length === 0 ? (
          <p className="px-2 py-6 text-center text-[12.5px] leading-relaxed text-muted-foreground">
            {search.trim()
              ? "No sessions match that search."
              : "No sessions yet. Your first prompt starts one."}
          </p>
        ) : (
          groups.map(([clientName, items]) => (
            <div key={clientName}>
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {clientName}
              </p>
              <div className="space-y-0.5">
                {items.map((session) => (
                  <SessionButton
                    key={session.id}
                    session={session}
                    active={session.id === activeId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}