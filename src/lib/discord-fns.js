import { createServerFn } from "@tanstack/react-start";
import { requireUser } from "@/lib/auth-middleware";
import { readIntegrationFields } from "@/lib/integration-store.server";
import {
  STAGES,
  classifyClientStage,
  fetchBotGuilds,
  fetchChannelMessages,
  fetchGuildTextChannels,
  matchGuildsToClients,
} from "@/lib/discord.server";

const MAX_CHANNELS = 4;
const MESSAGES_PER_CHANNEL = 25;
const LOOKBACK_HOURS = 36;
const MAX_TRANSCRIPT = 9000;

const buildTranscript = (messages, since) => {
  const lines = messages
    .filter((message) => message.content && (!message.at || new Date(message.at).getTime() >= since))
    .sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0))
    .map((message) => `${message.author}: ${message.content.slice(0, 500)}`);

  const transcript = lines.join("\n");
  return transcript.length > MAX_TRANSCRIPT ? transcript.slice(-MAX_TRANSCRIPT) : transcript;
};

const upsertProgress = async (base44, clientId, stage, reasoning) => {
  const service = base44.asServiceRole;
  const existing = await service.entities.ClientProgress.filter(
    { client: clientId },
    { sort: "-updated_date", limit: 1 }
  );
  const record = (Array.isArray(existing) ? existing : existing.items || [])[0];
  const patch = {
    stage,
    source: "AI_DISCORD",
    notes: reasoning || "Stage read from the team Discord by the status agent.",
    updatedAt: new Date().toISOString(),
  };

  if (record) {
    await service.entities.ClientProgress.update(record.id, patch);
    return record.id;
  }
  const created = await service.entities.ClientProgress.create({ client: clientId, ...patch });
  return created.id;
};

export const runDiscordStatusSync = async (base44) => {
  const fields = await readIntegrationFields(base44, "discord");
  if (!fields.botToken) {
    return { configured: false, matched: 0, updated: [], skipped: [] };
  }

  const service = base44.asServiceRole;
  const [guilds, clientsPage] = await Promise.all([
    fetchBotGuilds(fields.botToken),
    service.entities.Client.list({ sort: "name", limit: 200 }),
  ]);
  const clients = (Array.isArray(clientsPage) ? clientsPage : clientsPage.items || []).filter(
    (client) => client.status !== "CHURNED"
  );

  const matches = matchGuildsToClients(guilds, clients);
  const since = Date.now() - LOOKBACK_HOURS * 3600000;
  const updated = [];
  const skipped = [];

  for (const { guild, client } of matches) {
    const channels = await fetchGuildTextChannels(fields.botToken, guild.id);
    const recent = [];
    for (const channel of channels.slice(0, MAX_CHANNELS)) {
      const messages = await fetchChannelMessages(fields.botToken, channel.id, MESSAGES_PER_CHANNEL);
      recent.push(...messages);
    }

    const transcript = buildTranscript(recent, since);
    if (!transcript) {
      skipped.push({ client: client.name, reason: "No recent messages" });
      continue;
    }

    const { stage, reasoning } = await classifyClientStage(base44, {
      clientName: client.name,
      transcript,
    });

    if (!stage || !STAGES.includes(stage)) {
      skipped.push({ client: client.name, reason: reasoning || "No production status in the messages" });
      continue;
    }

    await upsertProgress(base44, client.id, stage, reasoning);
    updated.push({ client: client.name, stage, reasoning });
  }

  return { configured: true, matched: matches.length, updated, skipped };
};

export const runDiscordSyncNow = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    if (context.user?.role !== "admin") throw new Error("Only an admin can run the Discord scan.");
    return runDiscordStatusSync(context.getBase44());
  });