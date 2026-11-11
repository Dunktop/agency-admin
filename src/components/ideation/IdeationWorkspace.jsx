import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  getIdeationThread,
  listIdeationThreads,
  sendIdeationMessage,
  updateThreadClient,
} from "@/lib/ideation-fns";
import ChatHeader from "./ChatHeader";
import ChatComposer from "./ChatComposer";
import ChatEmptyState from "./ChatEmptyState";
import MessageList from "./MessageList";
import ThreadPanel from "./ThreadPanel";

export default function IdeationWorkspace() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [threadsOpen, setThreadsOpen] = useState(false);

  const listFn = useServerFn(listIdeationThreads);
  const detailFn = useServerFn(getIdeationThread);
  const sendFn = useServerFn(sendIdeationMessage);
  const tagFn = useServerFn(updateThreadClient);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 220);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: overview } = useQuery({
    queryKey: ["ideation-threads", debouncedSearch],
    queryFn: () => listFn({ data: { search: debouncedSearch } }),
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["ideation-thread", activeId],
    queryFn: () => detailFn({ data: { threadId: activeId } }),
    enabled: Boolean(activeId),
  });

  const sendMutation = useMutation({
    mutationFn: (payload) => sendFn({ data: payload }),
    onSuccess: (result) => {
      queryClient.setQueryData(["ideation-thread", result.thread.id], {
        thread: result.thread,
        messages: result.messages,
      });
      setActiveId(result.thread.id);
      queryClient.invalidateQueries({ queryKey: ["ideation-threads"] });
    },
  });

  const threads = overview?.threads ?? [];
  const clients = overview?.clients ?? [];
  const activeThread = detail?.thread ?? threads.find((thread) => thread.id === activeId) ?? null;
  const messages = detail?.messages ?? [];
  const sending = sendMutation.isPending;
  const hasConversation = messages.length > 0 || Boolean(pending) || sending;
  const loadingThread = Boolean(activeId) && detailLoading;

  const send = () => {
    const content = draft.trim();
    if (!content || sending) return;
    setDraft("");
    setPending(content);
    sendMutation.mutate(
      { threadId: activeThread?.id, content, client: activeThread?.client || undefined },
      {
        onError: () => {
          setDraft(content);
          toast.error("Couldn't send that. Check your connection and try again.");
        },
        onSettled: () => setPending(""),
      }
    );
  };

  const selectThread = (threadId) => {
    setActiveId(threadId);
    setPending("");
    setThreadsOpen(false);
  };

  const startNewThread = () => {
    setActiveId(null);
    setDraft("");
    setThreadsOpen(false);
  };

  const changeClient = async (clientId) => {
    if (!activeId) return;
    try {
      await tagFn({ data: { threadId: activeId, client: clientId } });
      queryClient.setQueryData(["ideation-thread", activeId], (previous) =>
        previous ? { ...previous, thread: { ...previous.thread, client: clientId } } : previous
      );
      queryClient.invalidateQueries({ queryKey: ["ideation-threads"] });
    } catch {
      toast.error("Couldn't update the client tag.");
    }
  };

  const panelProps = {
    threads,
    search,
    onSearch: setSearch,
    activeId,
    onSelect: selectThread,
    onNew: startNewThread,
  };

  return (
    <div className="animate-rise flex h-[calc(100dvh-9.75rem)] gap-4 md:h-[calc(100dvh-10.5rem)]">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ChatHeader
          title={activeThread?.title || "New thread"}
          hasThread={Boolean(activeThread)}
          clientId={activeThread?.client || ""}
          clients={clients}
          onClientChange={changeClient}
          onNew={startNewThread}
          panelOpen={panelOpen}
          onTogglePanel={() => setPanelOpen((value) => !value)}
          onOpenThreads={() => setThreadsOpen(true)}
        />

        {hasConversation ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <MessageList messages={messages} pending={pending} sending={sending} />
            </div>
            <div className="shrink-0 pt-2">
              <ChatComposer value={draft} onChange={setDraft} onSend={send} sending={sending} />
            </div>
          </>
        ) : loadingThread ? (
          <div className="flex flex-1 items-center justify-center text-[13px] text-muted-foreground">
            Opening thread…
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 pb-6">
            <ChatEmptyState />
            <ChatComposer value={draft} onChange={setDraft} onSend={send} sending={sending} autoFocus />
          </div>
        )}
      </section>

      {panelOpen && (
        <ThreadPanel
          {...panelProps}
          className="glass hidden w-[276px] shrink-0 flex-col rounded-[16px] p-2.5 lg:flex"
        />
      )}

      <Sheet open={threadsOpen} onOpenChange={setThreadsOpen}>
        <SheetContent
          side="right"
          className="flex w-[88%] max-w-[360px] flex-col gap-0 border-0 p-3 pt-12"
          style={{ background: "var(--glass-strong)", backdropFilter: "blur(40px) saturate(180%)" }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Ideation threads</SheetTitle>
            <SheetDescription>Search and open a thread</SheetDescription>
          </SheetHeader>
          <ThreadPanel {...panelProps} className="flex min-h-0 flex-1 flex-col" />
        </SheetContent>
      </Sheet>
    </div>
  );
}