import { Search, SquarePen } from "lucide-react";
import ThreadRow from "./ThreadRow";

export default function ThreadPanel({ threads, search, onSearch, activeId, onSelect, onNew, className = "" }) {
  return (
    <div className={className}>
      <div className="flex shrink-0 items-center gap-1.5 pb-2 pl-1.5">
        <span className="text-[13px] font-semibold tracking-[-0.01em]">Threads</span>
        <span className="text-[12px] tabular-nums text-muted-foreground">{threads.length}</span>
        <button
          type="button"
          onClick={onNew}
          className="icon-btn ml-auto !h-7 !w-7"
          aria-label="New thread"
          title="New thread"
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
          placeholder="Search threads"
          aria-label="Search threads"
          className="h-full w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-0.5">
        {threads.length === 0 ? (
          <p className="px-2 py-6 text-center text-[12.5px] leading-relaxed text-muted-foreground">
            {search.trim() ? "No threads match that search." : "No threads yet. Your first message creates one."}
          </p>
        ) : (
          threads.map((thread) => (
            <ThreadRow key={thread.id} thread={thread} active={thread.id === activeId} onSelect={onSelect} />
          ))
        )}
      </div>
    </div>
  );
}