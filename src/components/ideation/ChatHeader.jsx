import { PanelRight, PanelRightClose, PanelRightOpen, SquarePen } from "lucide-react";
import ClientTagPicker from "./ClientTagPicker";

export default function ChatHeader({
  title,
  hasThread,
  clientId,
  clients,
  onClientChange,
  onNew,
  panelOpen,
  onTogglePanel,
  onOpenThreads,
}) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em]">{title}</h1>
        {hasThread && <ClientTagPicker value={clientId} clients={clients} onChange={onClientChange} />}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button type="button" onClick={onNew} className="icon-btn" aria-label="New thread" title="New thread">
          <SquarePen className="h-[17px] w-[17px]" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onTogglePanel}
          className="icon-btn hidden lg:inline-flex"
          aria-label={panelOpen ? "Hide threads" : "Show threads"}
          title={panelOpen ? "Hide threads" : "Show threads"}
        >
          {panelOpen ? (
            <PanelRightClose className="h-[17px] w-[17px]" strokeWidth={1.75} />
          ) : (
            <PanelRightOpen className="h-[17px] w-[17px]" strokeWidth={1.75} />
          )}
        </button>
        <button
          type="button"
          onClick={onOpenThreads}
          className="icon-btn lg:hidden"
          aria-label="Browse threads"
          title="Browse threads"
        >
          <PanelRight className="h-[17px] w-[17px]" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}