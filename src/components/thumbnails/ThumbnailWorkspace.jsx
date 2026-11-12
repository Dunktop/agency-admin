import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { listThumbnailSessions, updateThumbnailSession } from "@/lib/thumbnail-fns";
import useThumbnailSession from "./useThumbnailSession";
import ThumbnailChatHeader from "./ThumbnailChatHeader";
import ThumbnailSessionPanel from "./ThumbnailSessionPanel";
import ThumbnailMessageList from "./ThumbnailMessageList";
import ThumbnailComposer from "./ThumbnailComposer";
import ThumbnailEmptyState from "./ThumbnailEmptyState";
import OverlayEditor from "./OverlayEditor";

export default function ThumbnailWorkspace() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listThumbnailSessions);
  const tagFn = useServerFn(updateThumbnailSession);

  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState("");
  const [sending, setSending] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [busyKind, setBusyKind] = useState("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [overlayMessage, setOverlayMessage] = useState(null);

  const scrollRef = useRef(null);
  const chat = useThumbnailSession();

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 220);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: overview } = useQuery({
    queryKey: ["thumbnail-sessions", debounced],
    queryFn: () => listFn({ data: { search: debounced } }),
  });

  const clients = overview?.clients ?? [];
  const sessions = overview?.sessions ?? [];
  const configured = overview?.configured ?? false;
  const clientId = chat.session?.client || selectedClient || clients[0]?.id || "";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.messages, pending]);

  const changeClient = async (nextClientId) => {
    if (!chat.session) {
      setSelectedClient(nextClientId);
      return;
    }
    try {
      await tagFn({ data: { sessionId: chat.session.id, clientId: nextClientId } });
      chat.patchSession({
        client: nextClientId,
        clientName: clients.find((client) => client.id === nextClientId)?.name || "",
      });
      queryClient.invalidateQueries({ queryKey: ["thumbnail-sessions"] });
    } catch {
      toast.error("Couldn't change the client on this session.");
    }
  };

  const send = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    if (!clientId) {
      toast.error("Pick a client first.");
      return;
    }
    setDraft("");
    setPending(content);
    setSending(true);
    try {
      const result = await chat.send({ content, clientId });
      if (result.error) toast.error(result.error);
      queryClient.invalidateQueries({ queryKey: ["thumbnail-sessions"] });
    } catch {
      setDraft(content);
      toast.error("Couldn't send that. Try again.");
    } finally {
      setPending("");
      setSending(false);
    }
  };

  const regenerate = async (messageId) => {
    setBusyId(messageId);
    setBusyKind("regenerate");
    try {
      const result = await chat.regenerate(messageId);
      if (result.error) toast.error(result.error);
    } catch {
      toast.error("Couldn't regenerate that thumbnail.");
    } finally {
      setBusyId("");
      setBusyKind("");
    }
  };

  const variations = async (messageId) => {
    setBusyId(messageId);
    setBusyKind("variations");
    try {
      const items = await chat.variations(messageId);
      const failed = items.find((item) => item.error);
      if (failed) toast.error(failed.error);
    } catch {
      toast.error("Couldn't draft variations.");
    } finally {
      setBusyId("");
      setBusyKind("");
    }
  };

  const rate = async (messageId, rating) => {
    const value = rating === 0 ? null : rating;
    chat.patchMessage(messageId, { rating: value });
    try {
      await chat.rate(messageId, value);
    } catch {
      toast.error("Couldn't save that rating.");
    }
  };

  const openSession = (sessionId) => {
    chat.openSession(sessionId);
    setSessionsOpen(false);
    setPending("");
  };

  const startNew = () => {
    chat.startNew();
    setDraft("");
    setPending("");
    setSessionsOpen(false);
  };

  const saveOverlay = async (fileUrl) => {
    await chat.saveOverlay({ imageUrl: fileUrl, sourceMessageId: overlayMessage?.id });
    toast.success("Composite saved to this session.");
  };

  const panelProps = {
    sessions,
    search,
    onSearch: setSearch,
    activeId: chat.activeId,
    onSelect: openSession,
    onNew: startNew,
  };

  const hasConversation = chat.messages.length > 0 || Boolean(pending);

  return (
    <div className="animate-rise flex h-[calc(100dvh-9.75rem)] gap-4 md:h-[calc(100dvh-10.5rem)]">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ThumbnailChatHeader
          title={chat.session?.title || "New session"}
          clients={clients}
          clientId={clientId}
          onClientChange={changeClient}
          onNew={startNew}
          panelOpen={panelOpen}
          onTogglePanel={() => setPanelOpen((value) => !value)}
          onOpenSessions={() => setSessionsOpen(true)}
        />

        {chat.loading ? (
          <div className="flex flex-1 items-center justify-center text-[13px] text-muted-foreground">
            Opening session…
          </div>
        ) : hasConversation ? (
          <>
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
              <ThumbnailMessageList
                messages={chat.messages}
                pending={pending}
                busyId={busyId}
                busyKind={busyKind}
                configured={configured}
                onRegenerate={regenerate}
                onVariations={variations}
                onRate={rate}
                onOverlay={setOverlayMessage}
              />
            </div>
            <div className="shrink-0 pt-2">
              <ThumbnailComposer
                value={draft}
                onChange={setDraft}
                onSend={send}
                sending={sending}
                noClient={!clientId}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 pb-6">
            <ThumbnailEmptyState />
            <ThumbnailComposer
              value={draft}
              onChange={setDraft}
              onSend={send}
              sending={sending}
              noClient={!clientId}
              autoFocus
            />
          </div>
        )}
      </section>

      {panelOpen && (
        <ThumbnailSessionPanel
          {...panelProps}
          className="glass hidden w-[276px] shrink-0 flex-col rounded-[16px] p-2.5 lg:flex"
        />
      )}

      <Sheet open={sessionsOpen} onOpenChange={setSessionsOpen}>
        <SheetContent
          side="right"
          className="flex w-[88%] max-w-[360px] flex-col gap-0 border-0 p-3 pt-12"
          style={{ background: "var(--glass-strong)", backdropFilter: "blur(40px) saturate(180%)" }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Thumbnail sessions</SheetTitle>
            <SheetDescription>Search and open a session</SheetDescription>
          </SheetHeader>
          <ThumbnailSessionPanel {...panelProps} className="flex min-h-0 flex-1 flex-col" />
        </SheetContent>
      </Sheet>

      <OverlayEditor
        open={Boolean(overlayMessage)}
        onOpenChange={(value) => {
          if (!value) setOverlayMessage(null);
        }}
        imageUrl={overlayMessage?.imageUrl}
        onSave={saveOverlay}
      />
    </div>
  );
}