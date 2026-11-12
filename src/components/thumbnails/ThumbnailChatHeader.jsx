import { PanelRight, PanelRightClose, PanelRightOpen, SquarePen } from "lucide-react";
import ThumbnailClientPicker from "./ThumbnailClientPicker";

export default function ThumbnailChatHeader({
  title,
  clients,
  clientId,
  onClientChange,
  onNew,
  panelOpen,
  onTogglePanel,
  onOpenSessions,
}) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-2">
      <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.01em]">{title}</h1>

      <div className="flex shrink-0 items-center gap-1">
        <ThumbnailClientPicker value={clientId} clients={clients} onChange={onClientChange} />
        <button type="button" onClick={onNew} className="icon-btn" aria-label="New session" title="New session">
          <SquarePen className="h-[17px] w-[17px]" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onTogglePanel}
          className="icon-btn hidden lg:inline-flex"
          aria-label={panelOpen ? "Hide sessions" : "Show sessions"}
          title={panelOpen ? "Hide sessions" : "Show sessions"}
        >
          {panelOpen ? (
            <PanelRightClose className="h-[17px] w-[17px]" strokeWidth={1.75} />
          ) : (
            <PanelRightOpen className="h-[17px] w-[17px]" strokeWidth={1.75} />
          )}
        </button>
        <button
          type="button"
          onClick={onOpenSessions}
          className="icon-btn lg:hidden"
          aria-label="Browse sessions"
          title="Browse sessions"
        >
          <PanelRight className="h-[17px] w-[17px]" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}