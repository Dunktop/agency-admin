import { parseJsonList } from "@/lib/clients";

const MAX_HISTORY = 40;

const clip = (value, max) => {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
};

export const IDEATION_SYSTEM_PROMPT = `You are an expert content strategist specializing in personal-brand growth on YouTube and social media. You help ideate video titles, thumbnail concepts, content angles, hooks, and growth strategies. You remember everything in this thread and build on previous insights. When given a YouTube URL, analyze its content strategy and extract learnings.

How you work:
- Think like the strategist running an in-house content team for personal-brand entrepreneurs: packaging first, then angle, then structure.
- Reach for broad, viral content philosophies — curiosity gaps, emotional stakes, contrarian framing, specificity, proof and social currency. Never fall back on generic "post consistently" advice.
- You can look things up on the web. When the user gives a YouTube URL, a channel or a competitor, study what is live before answering.
- You can read the agency's client database supplied below. Use it whenever a question touches a real client, and name the client you mean.
- VIDEO LENGTH RULE: long-form means a runtime of 4 minutes (240 seconds) or more; short-form is anything under 4 minutes. When you analyse a channel's videos for ideation, use long-form videos only. Never infer the format from vertical framing, the Shorts tab or a hashtag — always from runtime.
- Reply like a strategist in chat: no preamble, no restating the question. Short paragraphs and tight lists. Give concrete options, a one-line reason for each, and say which one you would pick.
- Format with simple markdown (bold, bullet lists). Use headings rarely.`;

function formatClientDirectory(clients) {
  if (!clients.length) return "No clients in the database yet.";
  const lines = clients.slice(0, 80).map((client) => {
    const meta = [client.planType, client.status].filter(Boolean).join(" · ");
    const summary = clip(client.channelSummary, 220);
    const head = `- ${client.name}${meta ? ` (${meta})` : ""}${client.channelUrl ? ` — ${client.channelUrl}` : ""}`;
    return summary ? `${head}\n  ${summary}` : head;
  });
  const rest = clients.length - 80;
  if (rest > 0) lines.push(`(${rest} more clients are not listed individually — ask if you need one.)`);
  return lines.join("\n");
}

function formatLongFormUploads(client) {
  const uploads = parseJsonList(client.latestUploads)
    .filter((video) => Number(video?.durationSeconds) >= 240)
    .slice(0, 12)
    .map((video) => {
      const total = Number(video.durationSeconds) || 0;
      const stamp = `${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")}`;
      const views = Number(video.views) || 0;
      return `- "${clip(video.title, 140)}" · ${stamp} · ${views} views${video.publishedAt ? ` · ${clip(video.publishedAt, 30)}` : ""}`;
    });
  return uploads.length ? uploads.join("\n") : "No long-form uploads recorded yet.";
}

function formatTaggedClient(client) {
  const lines = [
    `ACTIVE CLIENT: ${client.name}`,
    client.channelUrl ? `Channel: ${client.channelUrl}` : "",
    client.planType ? `Plan: ${client.planType}` : "",
    clip(client.channelSummary, 900) ? `Channel summary: ${clip(client.channelSummary, 900)}` : "",
    clip(client.contentStyle, 900) ? `Content style: ${clip(client.contentStyle, 900)}` : "",
    clip(client.offers, 900) ? `Offers: ${clip(client.offers, 900)}` : "",
    clip(client.contentStrategy, 1200) ? `Current strategy: ${clip(client.contentStrategy, 1200)}` : "",
    clip(client.growthOpportunities, 800) ? `Growth opportunities: ${clip(client.growthOpportunities, 800)}` : "",
    `Recent long-form uploads (4 minutes or longer only):\n${formatLongFormUploads(client)}`,
  ];
  return lines.filter(Boolean).join("\n");
}

function formatHistory(messages) {
  return messages
    .slice(-MAX_HISTORY)
    .map((message) => {
      const role = message.role === "assistant" ? "ASSISTANT" : "USER";
      const limit = message.role === "assistant" ? 3500 : 4000;
      return `${role}: ${clip(message.content, limit)}`;
    })
    .join("\n\n");
}

export function buildIdeationPrompt({ clients = [], taggedClient = null, messages = [] }) {
  return [
    IDEATION_SYSTEM_PROMPT,
    "",
    "CLIENT DATABASE (this agency's real clients)",
    formatClientDirectory(clients),
    taggedClient ? "" : null,
    taggedClient ? formatTaggedClient(taggedClient) : null,
    "",
    "CONVERSATION SO FAR",
    formatHistory(messages),
    "",
    "Write the next assistant reply. Answer the latest user message, treat the conversation above as your memory, and stay specific to this agency.",
  ]
    .filter((line) => line !== null)
    .join("\n");
}