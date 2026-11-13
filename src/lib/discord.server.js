const API = "https://discord.com/api/v10";

export const STAGES = [
  "WAITING_FOR_FOOTAGE",
  "FILMING",
  "EDITING_SHORT_FORM",
  "EDITING_LONG_FORM",
  "DESIGNING_THUMBNAIL",
  "IN_REVIEW",
  "UPLOADING",
  "PUBLISHED",
];

export class DiscordError extends Error {}

const fail = (message) => {
  throw new DiscordError(message);
};

export const discordRequest = async (path, token, options = {}) => {
  if (!token) fail("Add a Discord bot token first.");

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
  });

  if (response.status === 401) fail("Discord rejected that bot token.");
  if (response.status === 403) fail("The bot can't see that — check its permissions and the Message Content intent.");
  if (response.status === 429) fail("Discord is rate-limiting the bot. Try again in a minute.");
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    fail(`Discord returned ${response.status}${detail ? `: ${detail.slice(0, 160)}` : ""}`);
  }

  return response.json();
};

export const verifyDiscordToken = async (token) => {
  const me = await discordRequest("/users/@me", token);
  const guilds = await fetchBotGuilds(token);
  return {
    botName: String(me?.username || "bot"),
    guilds,
  };
};

export const fetchBotGuilds = async (token) => {
  const guilds = await discordRequest("/users/@me/guilds", token);
  return (Array.isArray(guilds) ? guilds : []).map((guild) => ({
    id: String(guild.id),
    name: String(guild.name || "").trim(),
  }));
};

// Bot permissions: View Channel (1024) + Send Messages (2048) + Read Message History (65536).
export const BOT_PERMISSIONS = "68608";

export const sendChannelMessage = async (token, channelId, content) => {
  if (!channelId) fail("Add the team channel ID first.");
  const message = await discordRequest(`/channels/${channelId}/messages`, token, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  return { id: String(message?.id || "") };
};

export const normalizeName = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const matchGuildsToClients = (guilds, clients) =>
  guilds
    .map((guild) => {
      const target = normalizeName(guild.name);
      if (!target) return null;
      const client = clients.find((entry) => {
        const name = normalizeName(entry.name);
        if (!name) return false;
        return name === target || target.includes(name) || name.includes(target);
      });
      return client ? { guild, client } : null;
    })
    .filter(Boolean);

export const fetchGuildTextChannels = async (token, guildId) => {
  const channels = await discordRequest(`/guilds/${guildId}/channels`, token);
  return (Array.isArray(channels) ? channels : [])
    .filter((channel) => channel.type === 0)
    .map((channel) => ({ id: String(channel.id), name: String(channel.name || "") }));
};

export const fetchChannelMessages = async (token, channelId, limit = 25) => {
  try {
    const messages = await discordRequest(`/channels/${channelId}/messages?limit=${limit}`, token);
    return (Array.isArray(messages) ? messages : []).map((message) => ({
      author: String(message.author?.username || message.author?.global_name || "team"),
      content: String(message.content || "").trim(),
      at: String(message.timestamp || ""),
    }));
  } catch (error) {
    if (error instanceof DiscordError && /permissions|Message Content/i.test(error.message)) return [];
    throw error;
  }
};

const STAGE_SCHEMA = {
  type: "object",
  properties: {
    stage: { type: "string" },
    reasoning: { type: "string" },
  },
  required: ["stage", "reasoning"],
};

const pickStage = (value) => {
  const upper = String(value || "").toUpperCase();
  return STAGES.find((stage) => upper.includes(stage)) || "";
};

export const classifyClientStage = async (base44, { clientName, transcript }) => {
  const prompt = `You are the production tracker for a content agency.

Client: ${clientName}

Based on these team Discord messages, determine the current production stage for this client. Stages: ${STAGES.join(
    ", "
  )}. Return only the stage name and brief reasoning.

Rules:
- Judge the whole conversation, not just the last message. The most recent concrete status wins.
- The stage can be any of the eight, in any direction. New footage requests after a publish mean the client is back at WAITING_FOR_FOOTAGE or FILMING.
- If nothing in the messages describes production status, return stage "" and reasoning "No production status in the recent messages".

Messages:
${transcript}`;

  const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: STAGE_SCHEMA,
  });

  return {
    stage: pickStage(raw?.stage),
    reasoning: String(raw?.reasoning || "").trim().slice(0, 900),
  };
};