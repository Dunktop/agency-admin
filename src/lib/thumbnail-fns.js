import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { buildThumbnailPrompt, buildThumbnailVariationsPrompt } from "@/lib/thumbnail-prompt.server";
import { fetchGenerationStatus, higgsfieldConfigured, submitThumbnailGeneration } from "@/lib/higgsfield.server";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const FALLBACK_DIRECTION =
  "Here's my read: one bold subject, hard contrast and almost no text. Sending that direction to the image model now.";

const SINGLE_SCHEMA = {
  type: "object",
  properties: {
    direction: { type: "string" },
    imagePrompt: { type: "string" },
  },
  required: ["direction", "imagePrompt"],
};

const VARIANTS_SCHEMA = {
  type: "object",
  properties: {
    variants: {
      type: "array",
      items: {
        type: "object",
        properties: {
          direction: { type: "string" },
          imagePrompt: { type: "string" },
        },
        required: ["direction", "imagePrompt"],
      },
    },
  },
  required: ["variants"],
};

const loadMessages = async (base44, sessionId) => {
  const page = await base44.entities.ThumbnailMessage.filter(
    { session: sessionId },
    { sort: "created_date", limit: 300 }
  );
  return page.items;
};

const findSession = (base44, sessionId) =>
  base44.entities.ThumbnailSession.get(sessionId).catch((error) => {
    if (error?.status === 404) return null;
    throw error;
  });

const sessionSummary = (session, clientName = "") => ({
  id: session.id,
  title: session.title,
  client: session.client || "",
  clientName,
  createdAt: session.createdAt || session.created_date,
});

const titleFrom = (text) => {
  const firstLine = text.split("\n")[0].trim();
  return firstLine.length > 66 ? `${firstLine.slice(0, 66).trimEnd()}…` : firstLine;
};

const submitSafely = async (prompt) => {
  if (!higgsfieldConfigured()) return { requestId: "", error: "" };
  try {
    const { requestId } = await submitThumbnailGeneration({ prompt });
    return { requestId, error: "" };
  } catch (error) {
    return { requestId: "", error: String(error?.message || "Higgsfield rejected the request").slice(0, 280) };
  }
};

const sessionContext = (base44, session) =>
  Promise.all([
    loadMessages(base44, session.id),
    base44.entities.KnowledgeEntry.filter(
      { scope: "THUMBNAIL_GLOBAL" },
      { sort: "-created_date", limit: 40 }
    ),
    session.client
      ? base44.entities.Client.get(session.client).catch(() => null)
      : Promise.resolve(null),
  ]).then(([messages, knowledgePage, client]) => ({
    messages,
    knowledge: knowledgePage.items,
    client,
  }));

const createImageReply = async (base44, { session, instruction, variantOf = "" }) => {
  const { messages, knowledge, client } = await sessionContext(base44, session);

  let direction = "";
  let imagePrompt = "";
  try {
    const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: buildThumbnailPrompt({ client, knowledge, messages, instruction }),
      response_json_schema: SINGLE_SCHEMA,
    });
    direction = String(raw?.direction ?? "").trim();
    imagePrompt = String(raw?.imagePrompt ?? "").trim();
  } catch {
    direction = "";
  }

  const { requestId, error } = await submitSafely(imagePrompt || instruction);

  const message = await base44.entities.ThumbnailMessage.create({
    session: session.id,
    role: "assistant",
    content: direction || FALLBACK_DIRECTION,
    imageUrl: "",
    variantOf,
    timestamp: new Date().toISOString(),
  });

  return { message, requestId, error };
};

export const listThumbnailSessions = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ search: z.string().max(120).optional() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const term = data.search?.trim() || "";

    const clientsPage = await base44.entities.Client.list({ sort: "name", limit: 200 });
    const names = new Map(clientsPage.items.map((client) => [client.id, client.name]));

    let query = {};
    if (term) {
      const matchingClients = clientsPage.items
        .filter((client) => (client.name || "").toLowerCase().includes(term.toLowerCase()))
        .map((client) => client.id);
      const titleMatch = { title: { $regex: escapeRegex(term) } };
      query = matchingClients.length
        ? { $or: [titleMatch, { client: { $in: matchingClients } }] }
        : titleMatch;
    }

    const sessionsPage = await base44.entities.ThumbnailSession.filter(query, {
      sort: "-created_date",
      limit: 200,
    });

    return {
      sessions: sessionsPage.items.map((session) =>
        sessionSummary(session, session.client ? names.get(session.client) || "" : "")
      ),
      clients: clientsPage.items.map((client) => ({ id: client.id, name: client.name })),
      configured: higgsfieldConfigured(),
    };
  });

export const getThumbnailSession = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ sessionId: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const session = await findSession(base44, data.sessionId);
    if (!session) return null;

    const client = session.client
      ? await base44.entities.Client.get(session.client).catch(() => null)
      : null;

    return {
      session: sessionSummary(session, client?.name || ""),
      messages: await loadMessages(base44, session.id),
    };
  });

export const updateThumbnailSession = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      sessionId: z.string(),
      clientId: z.string().max(80).optional(),
      title: z.string().trim().max(140).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const patch = {};
    if (data.clientId !== undefined) patch.client = data.clientId;
    if (data.title !== undefined) patch.title = data.title;
    return context.getBase44().entities.ThumbnailSession.update(data.sessionId, patch);
  });

export const deleteThumbnailSession = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ sessionId: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    await base44.entities.ThumbnailMessage.deleteMany({ session: data.sessionId });
    await base44.entities.ThumbnailSession.delete(data.sessionId);
    return { ok: true };
  });

export const sendThumbnailMessage = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      sessionId: z.string().optional(),
      clientId: z.string().max(80).optional(),
      content: z.string().trim().min(1).max(4000),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();

    let session = data.sessionId ? await findSession(base44, data.sessionId) : null;

    if (!session) {
      const clientId = data.clientId || "";
      if (!clientId) throw new Error("Pick a client before sending.");

      session = await base44.entities.ThumbnailSession.create({
        client: clientId,
        title: titleFrom(data.content),
        createdAt: new Date().toISOString(),
      });
    }

    const userMessage = await base44.entities.ThumbnailMessage.create({
      session: session.id,
      role: "user",
      content: data.content,
      timestamp: new Date().toISOString(),
    });

    const { message, requestId, error } = await createImageReply(base44, {
      session,
      instruction: data.content,
    });

    const client = session.client
      ? await base44.entities.Client.get(session.client).catch(() => null)
      : null;

    return {
      session: sessionSummary(session, client?.name || ""),
      userMessage,
      assistantMessage: message,
      requestId,
      error,
      configured: higgsfieldConfigured(),
    };
  });

export const regenerateThumbnailImage = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ messageId: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const source = await base44.entities.ThumbnailMessage.get(data.messageId);
    const session = await findSession(base44, source.session);
    if (!session) throw new Error("That session no longer exists.");

    return createImageReply(base44, {
      session,
      variantOf: source.variantOf || "",
      instruction: `Regenerate this thumbnail. Keep everything that was rated well, but change the composition, the subject's expression and the palette so it reads as a fresh take rather than a re-render. Previous direction: ${source.content}`,
    });
  });

export const createThumbnailVariations = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ messageId: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const source = await base44.entities.ThumbnailMessage.get(data.messageId);
    const session = await findSession(base44, source.session);
    if (!session) throw new Error("That session no longer exists.");

    const { messages, knowledge, client } = await sessionContext(base44, session);

    let variants = [];
    try {
      const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: buildThumbnailVariationsPrompt({ client, knowledge, messages, source }),
        response_json_schema: VARIANTS_SCHEMA,
      });
      variants = (Array.isArray(raw?.variants) ? raw.variants : []).slice(0, 3);
    } catch {
      variants = [];
    }

    const clean = variants.map((variant) => ({
      direction: String(variant?.direction ?? "").trim(),
      imagePrompt: String(variant?.imagePrompt ?? "").trim(),
    }));
    while (clean.length < 3) clean.push({ direction: "", imagePrompt: source.content });

    const groupId = source.variantOf || source.id;

    const submissions = await Promise.all(clean.map((variant) => submitSafely(variant.imagePrompt)));
    const created = await Promise.all(
      clean.map((variant, index) =>
        base44.entities.ThumbnailMessage.create({
          session: session.id,
          role: "assistant",
          content: variant.direction || `Variation ${index + 1} of that direction.`,
          imageUrl: "",
          variantOf: groupId,
          timestamp: new Date().toISOString(),
        })
      )
    );

    return created.map((message, index) => ({
      message,
      requestId: submissions[index].requestId,
      error: submissions[index].error,
    }));
  });

export const rateThumbnailMessage = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      messageId: z.string(),
      rating: z.union([z.null(), z.number().min(1).max(5)]),
    })
  )
  .handler(async ({ data, context }) =>
    context.getBase44().entities.ThumbnailMessage.update(data.messageId, { rating: data.rating })
  );

export const pollThumbnailGeneration = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ messageId: z.string(), requestId: z.string().max(120) }))
  .handler(async ({ data, context }) => {
    const result = await fetchGenerationStatus({ requestId: data.requestId });

    if (result.status === "completed" && result.imageUrl) {
      await context
        .getBase44()
        .entities.ThumbnailMessage.update(data.messageId, { imageUrl: result.imageUrl });
    }

    return result;
  });

export const saveOverlayThumbnail = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      sessionId: z.string(),
      imageUrl: z.string().trim().min(8).max(1000),
      sourceMessageId: z.string().max(80).optional(),
    })
  )
  .handler(async ({ data, context }) =>
    context.getBase44().entities.ThumbnailMessage.create({
      session: data.sessionId,
      role: "assistant",
      content: "Added a text overlay on top of that image. Saved as a new composite you can download.",
      imageUrl: data.imageUrl,
      variantOf: "",
      timestamp: new Date().toISOString(),
    })
  );