import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { computeMoneyOverview } from "@/lib/money.server";

export const getServerInfo = createServerFn({ method: "GET" }).handler(async () => ({
  renderedAt: new Date().toISOString(),
}));

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ------------------------------- clients ------------------------------- */

const clientFields = z.object({
  name: z.string().trim().min(1).max(200),
  channelUrl: z.string().trim().max(500).optional(),
  channelThumbnail: z.string().trim().max(1000).optional(),
  channelSummary: z.string().max(5000).optional(),
  contentStyle: z.string().max(8000).optional(),
  offers: z.string().max(20000).optional(),
  contentStrategy: z.string().max(20000).optional(),
  growthOpportunities: z.string().max(8000).optional(),
  strategyItems: z.string().max(20000).optional(),
  latestUploads: z.string().max(20000).optional(),
  analysisDate: z.string().max(60).optional(),
  planType: z.enum(["TEAM_ONLY", "PERSONAL_INVOLVED", "CUSTOM"]).optional(),
  customPlanLabel: z.string().max(200).optional(),
  monthlyFee: z.number().min(0).max(1000000).optional(),
  setupFee: z.number().min(0).max(1000000).optional(),
  status: z.enum(["ACTIVE", "CHURNED"]).optional(),
  notes: z.string().max(20000).optional(),
  startDate: z.string().max(40).optional(),
  discordServerId: z.string().max(200).optional(),
  googleAccountEmail: z.string().max(200).optional(),
});

export const listClients = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(
    z.object({
      search: z.string().max(120).optional(),
      plan: z.string().max(40).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const query = {};
    if (data.search?.trim()) query.name = { $regex: escapeRegex(data.search.trim()) };
    if (data.plan && data.plan !== "ALL") query.planType = data.plan;

    const [clientsPage, progressPage] = await Promise.all([
      base44.entities.Client.filter(query, { sort: "name", limit: 200 }),
      base44.entities.ClientProgress.list({ sort: "-updated_date", limit: 500 }),
    ]);

    const stages = {};
    for (const record of progressPage.items) {
      if (record.client && !stages[record.client]) stages[record.client] = record.stage;
    }

    return { clients: clientsPage.items, stages };
  });

export const getClientWorkspace = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ clientId: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const client = await base44.entities.Client.get(data.clientId).catch((error) => {
      if (error?.status === 404) return null;
      throw error;
    });
    if (!client) return null;

    const [progress, team, payments, analytics] = await Promise.all([
      base44.entities.ClientProgress.filter({ client: data.clientId }, { sort: "-updated_date", limit: 50 }),
      base44.entities.TeamMember.filter({ client: data.clientId }, { sort: "role", limit: 50 }),
      base44.entities.Payment.filter({ client: data.clientId }, { sort: "dueDate", limit: 100 }),
      base44.entities.AnalyticsSnapshot.filter({ client: data.clientId }, { sort: "-date", limit: 12 }),
    ]);

    return {
      client,
      progress: progress.items,
      team: team.items,
      payments: payments.items,
      analytics: analytics.items,
    };
  });

export const createClient = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(clientFields)
  .handler(async ({ data, context }) => context.getBase44().entities.Client.create(data));

export const updateClient = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(clientFields.partial().extend({ id: z.string() }))
  .handler(async ({ data: { id, ...patch }, context }) =>
    context.getBase44().entities.Client.update(id, patch)
  );

export const deleteClient = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    await Promise.all([
      base44.entities.ClientProgress.deleteMany({ client: data.id }),
      base44.entities.Payment.deleteMany({ client: data.id }),
      base44.entities.TeamMember.deleteMany({ client: data.id }),
    ]);
    await base44.entities.Client.delete(data.id);
    return { ok: true };
  });

/* ---------------------------- channel analysis ---------------------------- */

const analysisSchema = {
  type: "object",
  properties: {
    channelTitle: { type: "string" },
    channelHandle: { type: "string" },
    thumbnailUrl: { type: "string" },
    channelSummary: { type: "string" },
    contentStyle: { type: "string" },
    offers: { type: "string" },
    contentStrategy: { type: "string" },
    growthOpportunities: { type: "string" },
    strategyItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          target: { type: "string" },
          reasoning: { type: "string" },
        },
        required: ["action", "target", "reasoning"],
      },
    },
    recentUploads: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          url: { type: "string" },
          publishedAt: { type: "string" },
          durationSeconds: { type: "number" },
          views: { type: "number" },
        },
        required: ["title", "durationSeconds"],
      },
    },
  },
  required: ["channelTitle", "channelSummary", "strategyItems", "recentUploads"],
};

export const analyzeClientChannel = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ channelUrl: z.string().trim().min(3).max(500) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const url = /^https?:\/\//i.test(data.channelUrl) ? data.channelUrl : `https://${data.channelUrl}`;
    const today = new Date().toISOString().slice(0, 10);

    const prompt = `You are a YouTube growth strategist working inside a content agency that builds in-house content teams for personal-brand entrepreneurs.

Analyse the YouTube channel at: ${url}

Today is ${today}. Use current live web information and look only at the channel's MOST RECENT uploads as they exist today. Never rely on cached, historical or remembered data.

VIDEO LENGTH RULE — this is strict and applies to every video you describe or count:
- LONG-FORM: runtime of 4 minutes (240 seconds) or longer.
- SHORT-FORM: runtime under 4 minutes (under 240 seconds).
- Never use the channel's "Shorts" tab, a "#shorts" hashtag, the vertical aspect ratio or the upload format as the definition. A 6-minute vertical video is LONG-FORM. A 90-second horizontal video is SHORT-FORM. Always decide by runtime in seconds.

Produce:
1. channelTitle — the channel's name.
2. channelHandle — e.g. @handle.
3. thumbnailUrl — the channel's avatar image URL if you can determine the exact public URL, otherwise an empty string.
4. channelSummary — 2-4 sentences: who they are, their niche, audience and positioning.
5. contentStyle — 2-3 sentences on formats, editing style, pacing, hooks and on-screen presence.
6. offers — plain text describing what they actually sell (courses, coaching, community, services, products). If nothing is sold, say so.
7. contentStrategy — 3-5 sentence narrative recommendation for the next 90 days.
8. growthOpportunities — 3-5 short bullet lines, each on its own line.
9. strategyItems — 5-8 concrete changes. Each item: "action" (max 12 words, one sentence naming what to change), "target" (max 12 words, what to change it to) and "reasoning" (2-3 sentences citing what you saw on the channel or in their recent uploads).
10. recentUploads — the 6 most recent uploads. For each: title, url, publishedAt (ISO date), durationSeconds (exact runtime in seconds), views (number).

Return only the JSON object described by the schema.`;

    const raw = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: analysisSchema,
    });

    const strategyItems = (Array.isArray(raw?.strategyItems) ? raw.strategyItems : []).map((item) => ({
      action: String(item?.action ?? "").trim(),
      target: String(item?.target ?? "").trim(),
      reasoning: String(item?.reasoning ?? "").trim(),
    }));

    const latestUploads = (Array.isArray(raw?.recentUploads) ? raw.recentUploads : []).map((video) => {
      const seconds = Number(video?.durationSeconds) || 0;
      return {
        title: String(video?.title ?? "").trim(),
        url: String(video?.url ?? "").trim(),
        publishedAt: String(video?.publishedAt ?? "").trim(),
        durationSeconds: seconds,
        views: Number(video?.views) || 0,
        format: seconds >= 240 ? "LONG_FORM" : "SHORT_FORM",
      };
    });

    return {
      channelTitle: String(raw?.channelTitle ?? "").trim(),
      channelHandle: String(raw?.channelHandle ?? "").trim(),
      channelThumbnail: String(raw?.thumbnailUrl ?? "").trim(),
      channelSummary: String(raw?.channelSummary ?? "").trim(),
      contentStyle: String(raw?.contentStyle ?? "").trim(),
      offers: String(raw?.offers ?? "").trim(),
      contentStrategy: String(raw?.contentStrategy ?? "").trim(),
      growthOpportunities: String(raw?.growthOpportunities ?? "").trim(),
      strategyItems,
      latestUploads,
      analysisDate: new Date().toISOString(),
    };
  });

/* --------------------------------- money --------------------------------- */

export const getMoneyOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const [clientsPage, paymentsPage, teamPage] = await Promise.all([
      base44.entities.Client.list({ sort: "name", limit: 300 }),
      base44.entities.Payment.list({ sort: "dueDate", limit: 500 }),
      base44.entities.TeamMember.list({ sort: "name", limit: 500 }),
    ]);

    return computeMoneyOverview({
      clients: clientsPage.items,
      payments: paymentsPage.items,
      members: teamPage.items,
    });
  });

export const markPaymentPaid = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const paidDate = new Date().toISOString().slice(0, 10);
    return context.getBase44().entities.Payment.update(data.id, { status: "PAID", paidDate });
  });