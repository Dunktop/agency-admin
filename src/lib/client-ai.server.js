import { knowledgeBlock } from "@/lib/knowledge.server";

export const LONG_FORM_SECONDS = 240;

const clip = (value, max) => {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
};

const views = (value) => Number(value) || 0;

/** The last long-form uploads on file: 4 minutes (240s) or longer, newest first. */
export function longFormUploads(uploads, limit = 5) {
  return (uploads || [])
    .filter((video) => Number(video?.durationSeconds) >= LONG_FORM_SECONDS)
    .slice()
    .sort((a, b) => String(b?.publishedAt || "").localeCompare(String(a?.publishedAt || "")))
    .slice(0, limit)
    .map((video) => ({
      title: String(video?.title || "").trim(),
      views: views(video.views),
      publishedAt: String(video?.publishedAt || "").trim(),
      durationSeconds: Number(video?.durationSeconds) || 0,
    }))
    .filter((video) => video.title);
}

const clientContext = (client) =>
  `CLIENT: ${client.name}
Channel: ${client.channelUrl || "unknown"}
Niche: ${clip(client.channelSummary, 900) || "not captured yet"}
What they sell: ${clip(client.offers, 600) || "not captured yet"}
Content style: ${clip(client.contentStyle, 600) || "not captured yet"}
Current strategy: ${clip(client.contentStrategy, 900) || "not captured yet"}`;

const uploadList = (uploads) =>
  uploads
    .map((video, index) => {
      const meta = [video.views ? `${video.views} views` : "", video.publishedAt].filter(Boolean).join(" · ");
      return `${index + 1}. "${video.title}"${meta ? ` (${meta})` : ""}`;
    })
    .join("\n");

const clientTraining = (entries, fallback) => {
  const principles = (entries || [])
    .map((entry) => String(entry?.learnedPrinciple || "").trim())
    .filter(Boolean);
  if (!principles.length) return fallback;
  return principles.map((line) => `- ${line}`).join("\n").slice(0, 20000);
};

export function buildTitlesPrompt({ client, uploads, globalKnowledge, clientKnowledge }) {
  return `You are the packaging strategist at a content agency that runs in-house content teams for personal-brand entrepreneurs. You write YouTube titles that win the click without lying about the video.

${clientContext(client)}

${knowledgeBlock(globalKnowledge, "VIDEO_GLOBAL", { emptyHint: "None saved yet. Work from what actually performs in this niche." })}

PER-CLIENT TITLE TRAINING — this client's own feedback and preferred examples. Where it disagrees with the general notes, this wins.
${clientTraining(clientKnowledge, "Nothing saved for this client yet. Work from their niche, offers and voice.")}

SOURCE VIDEOS — long-form only (4 minutes or longer), most recent first
${uploadList(uploads)}

TASK
For each source video, write exactly 3 alternative titles.
- Each option must be honest to what that video actually contains. No clickbait the video cannot pay off.
- The 3 options must take genuinely different angles: for example a curiosity gap, a concrete number or stake, and a blunt contrarian statement. Never three rewordings of one idea.
- Front-load the hook in the first 40 characters, stay under 65 characters where possible, sentence case, no em dashes, no all caps, no emoji.
- Match the client's voice and audience from the training and client context above.
- Only use long-form videos as sources. Never infer format from framing or a hashtag.

Return only JSON with a "groups" array containing one object per source video, in the same order as the list above, each shaped {"video": "<the source title exactly as given>", "options": ["...", "...", "..."]}.`;
}

export function buildIdeasPrompt({ client, uploads, globalKnowledge, clientKnowledge }) {
  return `You are the ideation strategist at a content agency that runs in-house content teams for personal-brand entrepreneurs. You propose long-form video ideas that a real team can film and edit this week.

${clientContext(client)}

${knowledgeBlock(globalKnowledge, "VIDEO_GLOBAL", { emptyHint: "None saved yet. Work from what actually performs in this niche." })}

PER-CLIENT IDEA TRAINING — this client's own feedback and preferred examples. Where it disagrees with the general notes, this wins.
${clientTraining(clientKnowledge, "Nothing saved for this client yet. Work from their niche, offers and voice.")}

ALREADY PUBLISHED LONG-FORM VIDEOS — do not repeat these
${uploads.length ? uploadList(uploads) : "None on file."}

TASK
Propose 6 fresh long-form video ideas (each comfortably 4 minutes or longer).
- Every idea must be filmable with this client's actual setup and must connect to what they sell.
- Each must open a curiosity gap their specific audience cares about, and be distinct from the others: vary the format (story, teardown, experiment, contrarian argument, list with a stake, live challenge).
- No generic "how to grow on YouTube" filler, no ideas already covered by the published list above.
- Follow the client's training first, then the global rules.

Return only JSON with an "ideas" array of exactly 6 objects, each shaped:
{"title": "max 70 characters", "hook": "the first ten seconds, one sentence", "angle": "one sentence on the format and why it fits this client", "payoff": "one sentence on what the viewer walks away with"}`;
}

export function buildClientTrainingPrompt({ scope, client, content, existing }) {
  const track =
    scope === "CLIENT_TITLES"
      ? "writing YouTube titles and packaging for this client"
      : "coming up with long-form YouTube video ideas and angles for this client";

  return `You are the training archivist for a content agency. The art director is giving feedback and examples about ${track}.

${clientContext(client)}

WHAT YOU ALREADY KNOW ABOUT THIS CLIENT'S PREFERENCES
${clientTraining(existing, "Nothing yet. This is the first note for this client.")}

NEW FEEDBACK FROM THE ART DIRECTOR
"""
${content}
"""

Write "learnedPrinciple" as markdown:
- Open with 1 to 3 sentences in the first person confirming what you learned about this client specifically, in the art director's own language.
- Then a line "**Rules for this client**" followed by tight bullets grouped under bold headings the material supports (for example **Voice**, **Formats they like**, **Words to avoid**, **Examples to copy**). Only use headings the material actually supports.
- Each bullet is one imperative rule. Keep exact example titles, wording, numbers and phrases the art director gave.
- Never invent preferences they did not state, and never generalise this into advice for other clients.

Return only the JSON object described by the schema.`;
}

export const TITLES_SCHEMA = {
  type: "object",
  properties: {
    groups: {
      type: "array",
      items: {
        type: "object",
        properties: {
          video: { type: "string" },
          options: { type: "array", items: { type: "string" } },
        },
        required: ["video", "options"],
      },
    },
  },
  required: ["groups"],
};

export const IDEAS_SCHEMA = {
  type: "object",
  properties: {
    ideas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          hook: { type: "string" },
          angle: { type: "string" },
          payoff: { type: "string" },
        },
        required: ["title", "hook", "angle", "payoff"],
      },
    },
  },
  required: ["ideas"],
};