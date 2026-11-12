import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { parseJsonList } from "@/lib/clients";
import { EXTRACTION_SCHEMA } from "@/lib/knowledge.server";
import {
  IDEAS_SCHEMA,
  TITLES_SCHEMA,
  buildClientTrainingPrompt,
  buildIdeasPrompt,
  buildTitlesPrompt,
  longFormUploads,
} from "@/lib/client-ai.server";

const clientSchema = z.object({ clientId: z.string() });

const FALLBACK_PRINCIPLE =
  "I've saved this feedback for this client. I couldn't restate the rules this time, so treat the note in this exchange as the source of truth and send it again if you want a tighter summary.";

const findClient = (base44, clientId) =>
  base44.entities.Client.get(clientId).catch((error) => {
    if (error?.status === 404) return null;
    throw error;
  });

const parseContent = (value) => {
  try {
    const parsed = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const shapeSuggestion = (record) =>
  record
    ? { tool: record.tool, content: parseContent(record.content), generatedAt: record.generatedAt || record.updated_date }
    : null;

const shapeEntry = (record) => ({
  id: record.id,
  note: (record.userInput || "").slice(0, 600),
  learnedPrinciple: (record.learnedPrinciple || "").slice(0, 2000),
  createdAt: record.timestamp || record.created_date,
});

const loadClientKnowledge = async (base44, scope, clientId) => {
  const page = await base44.entities.KnowledgeEntry.filter(
    { scope, client: clientId },
    { sort: "created_date", limit: 300 }
  );
  return page.items;
};

const loadContext = (base44, client) =>
  Promise.all([
    base44.entities.KnowledgeEntry.filter({ scope: "VIDEO_GLOBAL" }, { sort: "created_date", limit: 500 }),
    loadClientKnowledge(base44, "CLIENT_TITLES", client.id),
    loadClientKnowledge(base44, "CLIENT_IDEAS", client.id),
  ]).then(([globalPage, titles, ideas]) => ({
    global: globalPage.items,
    titles,
    ideas,
  }));

const upsertSuggestion = async (base44, clientId, tool, payload) => {
  const content = JSON.stringify(payload);
  const generatedAt = new Date().toISOString();
  const existing = await base44.entities.ClientSuggestion.filter(
    { client: clientId, tool },
    { limit: 1 }
  );

  const record = existing.items[0]
    ? await base44.entities.ClientSuggestion.update(existing.items[0].id, { content, generatedAt })
    : await base44.entities.ClientSuggestion.create({ client: clientId, tool, content, generatedAt });

  return shapeSuggestion(record);
};

export const getClientSuggestions = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(clientSchema)
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const client = await findClient(base44, data.clientId);
    if (!client) return null;

    const [records, titles, ideas] = await Promise.all([
      base44.entities.ClientSuggestion.filter({ client: client.id }, { limit: 10 }),
      loadClientKnowledge(base44, "CLIENT_TITLES", client.id),
      loadClientKnowledge(base44, "CLIENT_IDEAS", client.id),
    ]);

    const byTool = new Map(records.items.map((record) => [record.tool, record]));

    return {
      titles: shapeSuggestion(byTool.get("TITLES")),
      ideas: shapeSuggestion(byTool.get("IDEAS")),
      knowledge: {
        CLIENT_TITLES: titles.map(shapeEntry),
        CLIENT_IDEAS: ideas.map(shapeEntry),
      },
    };
  });

export const generateClientTitles = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(clientSchema)
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const client = await findClient(base44, data.clientId);
    if (!client) throw new Error("That client no longer exists.");

    const uploads = longFormUploads(parseJsonList(client.latestUploads));
    if (!uploads.length) {
      throw new Error("No long-form videos on file yet. Run Refresh analysis first so I can work from real uploads.");
    }

    const { global, titles } = await loadContext(base44, client);

    let groups = [];
    try {
      const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: buildTitlesPrompt({ client, uploads, globalKnowledge: global, clientKnowledge: titles }),
        response_json_schema: TITLES_SCHEMA,
      });
      groups = (Array.isArray(raw?.groups) ? raw.groups : [])
        .map((group, index) => ({
          video: String(group?.video || uploads[index]?.title || "").trim(),
          options: (Array.isArray(group?.options) ? group.options : [])
            .map((option) => String(option ?? "").trim())
            .filter(Boolean)
            .slice(0, 3),
        }))
        .filter((group) => group.video && group.options.length);
    } catch {
      throw new Error("The AI couldn't build titles just now. Try again in a moment.");
    }

    if (!groups.length) throw new Error("No titles came back. Try regenerating.");

    return upsertSuggestion(base44, client.id, "TITLES", { groups });
  });

export const generateClientIdeas = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(clientSchema)
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const client = await findClient(base44, data.clientId);
    if (!client) throw new Error("That client no longer exists.");

    const uploads = longFormUploads(parseJsonList(client.latestUploads));
    const { global, ideas } = await loadContext(base44, client);

    let list = [];
    try {
      const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: buildIdeasPrompt({ client, uploads, globalKnowledge: global, clientKnowledge: ideas }),
        response_json_schema: IDEAS_SCHEMA,
      });
      list = (Array.isArray(raw?.ideas) ? raw.ideas : [])
        .map((idea) => ({
          title: String(idea?.title || "").trim(),
          hook: String(idea?.hook || "").trim(),
          angle: String(idea?.angle || "").trim(),
          payoff: String(idea?.payoff || "").trim(),
        }))
        .filter((idea) => idea.title)
        .slice(0, 6);
    } catch {
      throw new Error("The AI couldn't build ideas just now. Try again in a moment.");
    }

    if (!list.length) throw new Error("No ideas came back. Try regenerating.");

    return upsertSuggestion(base44, client.id, "IDEAS", { ideas: list });
  });

export const trainClientTool = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      clientId: z.string(),
      scope: z.enum(["CLIENT_TITLES", "CLIENT_IDEAS"]),
      content: z.string().trim().min(1).max(120000),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const client = await findClient(base44, data.clientId);
    if (!client) throw new Error("That client no longer exists.");

    const existing = await loadClientKnowledge(base44, data.scope, client.id);

    let principle = "";
    try {
      const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: buildClientTrainingPrompt({
          scope: data.scope,
          client,
          content: data.content,
          existing,
        }),
        response_json_schema: EXTRACTION_SCHEMA,
      });
      principle = String(raw?.learnedPrinciple ?? "").trim();
    } catch {
      principle = "";
    }

    const record = await base44.entities.KnowledgeEntry.create({
      scope: data.scope,
      client: client.id,
      userInput: data.content,
      learnedPrinciple: principle || FALLBACK_PRINCIPLE,
      timestamp: new Date().toISOString(),
    });

    return shapeEntry(record);
  });