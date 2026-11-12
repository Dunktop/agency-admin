import { verifyKey } from "@/lib/youtube.server";
import { verifyHiggsfieldCredentials } from "@/lib/higgsfield.server";
import { verifyDiscordToken } from "@/lib/discord.server";

export const CONNECTED = "CONNECTED";
export const NOT_CONFIGURED = "NOT_CONFIGURED";
export const ERROR = "ERROR";

// What each integration needs and whether the app can run that feature without it.
export const INTEGRATIONS = [
  { id: "ai", label: "Claude / AI", required: true, fields: [], builtIn: true },
  { id: "higgsfield", label: "Higgsfield", required: false, fields: ["apiKey", "apiSecret"] },
  { id: "youtube", label: "YouTube Data API", required: false, fields: ["apiKey"] },
  { id: "discord", label: "Discord bot", required: false, fields: ["botToken"] },
  { id: "notion", label: "Notion", required: false, fields: ["token"] },
];

export const integrationById = (id) => INTEGRATIONS.find((entry) => entry.id === id) || null;

export const YOUTUBE_LEGACY_KEY = "YOUTUBE_API_KEY";

export const statusOf = ({ definition, fields, record }) => {
  const missing = definition.fields.filter((key) => !fields[key]);
  if (missing.length) return NOT_CONFIGURED;
  if (record?.status === ERROR) return ERROR;
  if (record?.status === CONNECTED) return CONNECTED;
  return NOT_CONFIGURED;
};

const clean = (value) => String(value ?? "").trim();

const testAi = async (base44) => {
  const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: "Reply with the single word: OK",
  });
  if (!clean(answer)) throw new Error("The AI gateway answered with an empty reply.");
  return "The AI gateway answered. Ideation, thumbnails, channel analysis and the Discord agent are live.";
};

const testHiggsfield = async (fields) => {
  await verifyHiggsfieldCredentials({ apiKey: fields.apiKey, apiSecret: fields.apiSecret });
  return "Higgsfield accepted the key and secret.";
};

const testYoutube = async (fields) => {
  await verifyKey(fields.apiKey);
  return "YouTube accepted the key and answered a live request.";
};

const testDiscord = async (fields) => {
  const { botName, guilds } = await verifyDiscordToken(fields.botToken);
  return `Connected as ${botName}. ${guilds.length} server${guilds.length === 1 ? "" : "s"} visible to the bot.`;
};

const testNotion = async (fields) => {
  const response = await fetch("https://api.notion.com/v1/users/me", {
    headers: {
      Authorization: `Bearer ${fields.token}`,
      "Notion-Version": "2022-06-28",
    },
  });
  if (response.status === 401) throw new Error("Notion rejected that token.");
  if (!response.ok) throw new Error(`Notion returned ${response.status}.`);
  const data = await response.json().catch(() => ({}));
  return `Notion accepted the token${data?.name ? ` for ${data.name}` : ""}.`;
};

export const runIntegrationTest = async (base44, id, fields) => {
  if (id === "ai") return testAi(base44);
  if (id === "higgsfield") return testHiggsfield(fields);
  if (id === "youtube") return testYoutube(fields);
  if (id === "discord") return testDiscord(fields);
  if (id === "notion") return testNotion(fields);
  throw new Error("Unknown integration.");
};

export const friendlyTestError = (error) =>
  String(error?.message || "That integration couldn't be reached right now.").slice(0, 280);