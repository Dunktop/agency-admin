import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { parseJsonList } from "@/lib/clients";
import { YouTubeError, fetchRecentVideos, resolveChannel, verifyKey } from "@/lib/youtube.server";

const KEY_SETTING = "YOUTUBE_API_KEY";

const friendly = (error) => {
  if (error instanceof YouTubeError) return error.message;
  return "YouTube couldn't be reached. Try again in a moment.";
};

const numbers = (record) => ({
  date: record.date,
  views: Number(record.views) || 0,
  subscribers: Number(record.subscribers) || 0,
  watchHours: record.watchHours === null || record.watchHours === undefined ? null : Number(record.watchHours),
  impressionsCTR:
    record.impressionsCTR === null || record.impressionsCTR === undefined ? null : Number(record.impressionsCTR),
});

const readApiKey = async (base44) => {
  const page = await base44.asServiceRole.entities.AppSetting.filter({ key: KEY_SETTING }, { limit: 1 });
  const items = Array.isArray(page) ? page : page.items;
  return String(items?.[0]?.value || "").trim();
};

const upsertSnapshot = async (base44, clientId, date, fields) => {
  const existing = await base44.entities.AnalyticsSnapshot.filter({ client: clientId, date }, { limit: 1 });
  const record = existing.items?.[0];
  if (record) return base44.entities.AnalyticsSnapshot.update(record.id, fields);
  return base44.entities.AnalyticsSnapshot.create({ client: clientId, date, ...fields });
};

export const getAnalyticsPage = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ clientId: z.string().max(80).optional() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();

    const [clientsPage, snapshotsPage, settingPage] = await Promise.all([
      base44.entities.Client.list({ sort: "name", limit: 200 }),
      base44.entities.AnalyticsSnapshot.list({ sort: "-date", limit: 200 }),
      base44.asServiceRole.entities.AppSetting.filter({ key: KEY_SETTING }, { limit: 1 }),
    ]);

    const latest = new Map();
    const previous = new Map();
    for (const record of snapshotsPage.items) {
      if (!latest.has(record.client)) latest.set(record.client, record);
      else if (!previous.has(record.client)) previous.set(record.client, record);
    }

    const clients = clientsPage.items.map((client) => ({
      id: client.id,
      name: client.name,
      channelUrl: client.channelUrl || "",
      channelThumbnail: client.channelThumbnail || "",
      channelId: client.channelId || "",
      latest: latest.has(client.id) ? numbers(latest.get(client.id)) : null,
      previous: previous.has(client.id) ? numbers(previous.get(client.id)) : null,
    }));

    const settingItems = Array.isArray(settingPage) ? settingPage : settingPage.items;

    let selected = null;
    if (data.clientId) {
      const client = clients.find((entry) => entry.id === data.clientId);
      if (client) {
        const records = await base44.entities.AnalyticsSnapshot.filter(
          { client: data.clientId },
          { sort: "date", limit: 200 }
        );
        selected = {
          client,
          snapshots: records.items.map((record) => ({
            id: record.id,
            ...numbers(record),
            topVideos: parseJsonList(record.topVideos),
          })),
        };
      }
    }

    return {
      apiKeyConfigured: Boolean(String(settingItems?.[0]?.value || "").trim()),
      clients,
      selected,
    };
  });

export const saveYouTubeKey = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ apiKey: z.string().trim().min(20).max(200) }))
  .handler(async ({ data, context }) => {
    if (context.user?.role !== "admin") throw new Error("Only an admin can save the YouTube API key.");

    try {
      await verifyKey(data.apiKey);
    } catch (error) {
      throw new Error(friendly(error));
    }

    const service = context.getBase44().asServiceRole;
    const existing = await service.entities.AppSetting.filter({ key: KEY_SETTING }, { limit: 1 });
    const record = existing.items?.[0];
    if (record) await service.entities.AppSetting.update(record.id, { value: data.apiKey });
    else await service.entities.AppSetting.create({ key: KEY_SETTING, value: data.apiKey });

    return { configured: true };
  });

export const connectClientChannel = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ clientId: z.string(), channel: z.string().trim().min(2).max(500) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const apiKey = await readApiKey(base44);
    if (!apiKey) throw new Error("Add your YouTube API key first.");

    let channel;
    try {
      channel = await resolveChannel(apiKey, data.channel);
    } catch (error) {
      throw new Error(friendly(error));
    }

    const client = await base44.entities.Client.get(data.clientId);
    const patch = { channelId: channel.id };
    if (!client.channelUrl) patch.channelUrl = `https://www.youtube.com/channel/${channel.id}`;
    if (!client.channelThumbnail && channel.thumbnail) patch.channelThumbnail = channel.thumbnail;

    await base44.entities.Client.update(data.clientId, patch);
    return { channelId: channel.id, title: channel.title };
  });

export const syncClientAnalytics = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ clientId: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const apiKey = await readApiKey(base44);
    if (!apiKey) throw new Error("Add your YouTube API key first.");

    const client = await base44.entities.Client.get(data.clientId);
    const target = client.channelId || client.channelUrl;
    if (!target) throw new Error("Connect a YouTube channel to this client first.");

    let channel;
    let videos = [];
    try {
      channel = await resolveChannel(apiKey, target);
      videos = await fetchRecentVideos(apiKey, channel.uploads, 25);
    } catch (error) {
      throw new Error(friendly(error));
    }

    const topVideos = videos
      .slice()
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const snapshot = await upsertSnapshot(base44, data.clientId, new Date().toISOString().slice(0, 10), {
      views: channel.views,
      subscribers: channel.subscribers,
      topVideos: JSON.stringify(topVideos),
    });

    const patch = { channelId: channel.id };
    if (!client.channelUrl) patch.channelUrl = `https://www.youtube.com/channel/${channel.id}`;
    if (!client.channelThumbnail && channel.thumbnail) patch.channelThumbnail = channel.thumbnail;
    await base44.entities.Client.update(data.clientId, patch);

    return { snapshotId: snapshot.id, date: snapshot.date, videos: topVideos.length };
  });

export const addManualSnapshot = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      clientId: z.string(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      views: z.number().min(0).max(1e12).optional(),
      subscribers: z.number().min(0).max(1e12).optional(),
      watchHours: z.number().min(0).max(1e12).optional(),
      impressionsCTR: z.number().min(0).max(100).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const fields = {};
    ["views", "subscribers", "watchHours", "impressionsCTR"].forEach((field) => {
      if (data[field] !== undefined) fields[field] = data[field];
    });
    if (!Object.keys(fields).length) throw new Error("Add at least one number to save.");

    const record = await upsertSnapshot(context.getBase44(), data.clientId, data.date, fields);
    return { id: record.id, date: record.date };
  });