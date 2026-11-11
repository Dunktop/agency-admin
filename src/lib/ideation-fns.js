import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { buildIdeationPrompt } from "@/lib/ideation.server";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const FALLBACK_REPLY =
  "I couldn't put that together just now. Send your message again and I'll pick it up from here.";

const loadMessages = async (base44, threadId) => {
  const page = await base44.entities.IdeationMessage.filter(
    { thread: threadId },
    { sort: "created_date", limit: 200 }
  );
  return page.items;
};

const threadSummary = (thread) => ({
  id: thread.id,
  title: thread.title,
  client: thread.client || "",
  createdAt: thread.createdAt || thread.created_date,
});

export const listIdeationThreads = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ search: z.string().max(120).optional() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const query = {};
    if (data.search?.trim()) query.title = { $regex: escapeRegex(data.search.trim()) };

    const [threadsPage, clientsPage] = await Promise.all([
      base44.entities.IdeationThread.filter(query, { sort: "-created_date", limit: 100 }),
      base44.entities.Client.list({ sort: "name", limit: 200 }),
    ]);

    const names = new Map(clientsPage.items.map((client) => [client.id, client.name]));
    return {
      threads: threadsPage.items.map((thread) => ({
        ...threadSummary(thread),
        clientName: thread.client ? names.get(thread.client) || "" : "",
      })),
      clients: clientsPage.items.map((client) => ({ id: client.id, name: client.name })),
    };
  });

export const getIdeationThread = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ threadId: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const thread = await base44.entities.IdeationThread.get(data.threadId).catch((error) => {
      if (error?.status === 404) return null;
      throw error;
    });
    if (!thread) return null;
    return { thread: threadSummary(thread), messages: await loadMessages(base44, thread.id) };
  });

export const updateThreadClient = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ threadId: z.string(), client: z.string().max(80).optional() }))
  .handler(async ({ data, context }) =>
    context.getBase44().entities.IdeationThread.update(data.threadId, { client: data.client || "" })
  );

export const sendIdeationMessage = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      threadId: z.string().optional(),
      content: z.string().trim().min(1).max(8000),
      client: z.string().max(80).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();

    let thread = null;
    if (data.threadId) {
      thread = await base44.entities.IdeationThread.get(data.threadId).catch((error) => {
        if (error?.status === 404) return null;
        throw error;
      });
    }
    if (!thread) {
      const firstLine = data.content.split("\n")[0].trim();
      thread = await base44.entities.IdeationThread.create({
        title: firstLine.length > 68 ? `${firstLine.slice(0, 68).trimEnd()}…` : firstLine,
        client: data.client || "",
        createdAt: new Date().toISOString(),
      });
    }

    await base44.entities.IdeationMessage.create({
      thread: thread.id,
      role: "user",
      content: data.content,
      timestamp: new Date().toISOString(),
    });

    // Full history, reloaded after saving: every reply is grounded in the whole thread.
    const history = await loadMessages(base44, thread.id);

    const [clientsPage, taggedClient] = await Promise.all([
      base44.entities.Client.list({ sort: "name", limit: 200 }),
      thread.client
        ? base44.entities.Client.get(thread.client).catch(() => null)
        : Promise.resolve(null),
    ]);

    const prompt = buildIdeationPrompt({
      clients: clientsPage.items,
      taggedClient,
      messages: history,
    });

    let reply = "";
    try {
      const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: "gemini_3_flash",
      });
      reply = String(raw ?? "").trim();
    } catch {
      reply = FALLBACK_REPLY;
    }

    const assistant = await base44.entities.IdeationMessage.create({
      thread: thread.id,
      role: "assistant",
      content: reply || FALLBACK_REPLY,
      timestamp: new Date().toISOString(),
    });

    return {
      thread: threadSummary(thread),
      messages: [...history, assistant],
      clientName: taggedClient?.name || "",
    };
  });