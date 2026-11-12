import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  createThumbnailVariations,
  getThumbnailSession,
  pollThumbnailGeneration,
  rateThumbnailMessage,
  regenerateThumbnailImage,
  saveOverlayThumbnail,
  sendThumbnailMessage,
} from "@/lib/thumbnail-fns";

const FAILED_STATUSES = ["failed", "nsfw", "canceled"];

export default function useThumbnailSession() {
  const detailFn = useServerFn(getThumbnailSession);
  const sendFn = useServerFn(sendThumbnailMessage);
  const regenerateFn = useServerFn(regenerateThumbnailImage);
  const variationsFn = useServerFn(createThumbnailVariations);
  const rateFn = useServerFn(rateThumbnailMessage);
  const overlayFn = useServerFn(saveOverlayThumbnail);
  const pollFn = useServerFn(pollThumbnailGeneration);

  const [activeId, setActiveId] = useState(null);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const patchMessage = useCallback((id, patch) => {
    setMessages((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const patchSession = useCallback((patch) => {
    setSession((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const openSession = useCallback(
    async (sessionId) => {
      setActiveId(sessionId);
      if (!sessionId) {
        setSession(null);
        setMessages([]);
        setJobs([]);
        return;
      }
      setLoading(true);
      try {
        const result = await detailFn({ data: { sessionId } });
        setSession(result?.session ?? null);
        setMessages(result?.messages ?? []);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    },
    [detailFn]
  );

  const startNew = useCallback(() => {
    setActiveId(null);
    setSession(null);
    setMessages([]);
    setJobs([]);
  }, []);

  const track = useCallback((items) => {
    const next = items
      .filter((item) => item.requestId)
      .map((item) => ({ messageId: item.message.id, requestId: item.requestId }));
    if (next.length) setJobs((prev) => [...prev, ...next]);
  }, []);

  const send = useCallback(
    async ({ content, clientId }) => {
      const result = await sendFn({
        data: { sessionId: activeId ?? undefined, clientId: clientId || undefined, content },
      });
      setSession(result.session);
      setActiveId(result.session.id);
      setMessages((prev) => [...prev, result.userMessage, result.assistantMessage]);
      track([{ message: result.assistantMessage, requestId: result.requestId }]);
      return result;
    },
    [activeId, sendFn, track]
  );

  const regenerate = useCallback(
    async (messageId) => {
      const result = await regenerateFn({ data: { messageId } });
      setMessages((prev) => [...prev, result.message]);
      track([result]);
      return result;
    },
    [regenerateFn, track]
  );

  const variations = useCallback(
    async (messageId) => {
      const items = await variationsFn({ data: { messageId } });
      setMessages((prev) => [...prev, ...items.map((item) => item.message)]);
      track(items);
      return items;
    },
    [track, variationsFn]
  );

  const rate = useCallback((messageId, rating) => rateFn({ data: { messageId, rating } }), [rateFn]);

  const saveOverlay = useCallback(
    async ({ imageUrl, sourceMessageId }) => {
      if (!activeId) throw new Error("Open a session first.");
      const message = await overlayFn({ data: { sessionId: activeId, imageUrl, sourceMessageId } });
      setMessages((prev) => [...prev, message]);
      return message;
    },
    [activeId, overlayFn]
  );

  useEffect(() => {
    if (jobs.length === 0) return undefined;
    let cancelled = false;

    const tick = async () => {
      for (const job of jobs) {
        try {
          const result = await pollFn({ data: { messageId: job.messageId, requestId: job.requestId } });
          if (cancelled) return;
          if (result.status === "completed" && result.imageUrl) {
            patchMessage(job.messageId, { imageUrl: result.imageUrl });
            setJobs((prev) => prev.filter((item) => item.messageId !== job.messageId));
          } else if (FAILED_STATUSES.includes(result.status)) {
            patchMessage(job.messageId, {
              failed: result.error || "That render didn't come back. Try regenerating.",
            });
            setJobs((prev) => prev.filter((item) => item.messageId !== job.messageId));
          }
        } catch {
          if (cancelled) return;
          patchMessage(job.messageId, { failed: "Lost the connection to the image service. Try again." });
          setJobs((prev) => prev.filter((item) => item.messageId !== job.messageId));
        }
      }
    };

    tick();
    const interval = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [jobs, patchMessage, pollFn]);

  return {
    activeId,
    session,
    messages,
    loading,
    openSession,
    startNew,
    send,
    regenerate,
    variations,
    rate,
    saveOverlay,
    patchMessage,
    patchSession,
  };
}