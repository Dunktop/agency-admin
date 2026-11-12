const CRAFT_RULES = `Craft rules for every thumbnail:
- 16:9 YouTube thumbnail read at 20% size on a phone. One focal subject, nothing else competing.
- High contrast between subject and background. Faces show a strong, obvious emotion.
- At most three words of on-thumbnail text, in a very heavy condensed sans, with a tight outline or drop shadow.
- Never include the channel name, watermarks, logos, UI chrome, borders or letterboxing.`;

const contextBlock = ({ client, knowledge, messages }) => {
  const sections = [];

  if (client) {
    sections.push(
      `CLIENT
Name: ${client.name}
Status: ${client.status || "ACTIVE"}
Channel: ${client.channelUrl || "unknown"}
Niche summary: ${client.channelSummary || "not captured yet"}
Content style: ${client.contentStyle || "not captured yet"}
What they sell: ${client.offers || "not captured yet"}
Strategy notes: ${client.contentStrategy || "not captured yet"}`
    );
  }

  const principles = (knowledge || [])
    .map((entry) => String(entry.learnedPrinciple || "").trim())
    .filter(Boolean);
  sections.push(
    principles.length
      ? `GLOBAL THUMBNAIL TRAINING NOTES (learned from past feedback, never break these)\n${principles.map((line) => `- ${line}`).join("\n")}`
      : "GLOBAL THUMBNAIL TRAINING NOTES\nNone saved yet. Work from the craft rules and the client context."
  );

  const history = (messages || [])
    .map((message) => {
      const parts = [`${message.role === "user" ? "Art director" : "You"}: ${message.content}`];
      if (message.imageUrl) parts.push("[you generated an image]");
      if (message.rating) parts.push(`[rated ${message.rating}/5]`);
      return parts.join(" ");
    })
    .join("\n");
  sections.push(
    history
      ? `SESSION SO FAR (oldest first)\n${history}`
      : "SESSION SO FAR\nNothing yet, this is the first request."
  );

  return sections.join("\n\n");
};

export function buildThumbnailPrompt({ client, knowledge, messages, instruction }) {
  return `You are the senior thumbnail art director at a content agency that runs in-house content teams for personal-brand entrepreneurs.

${CRAFT_RULES}

${contextBlock({ client, knowledge, messages })}

LATEST REQUEST
${instruction}

First decide the creative direction, then write the generation prompt. The prompt must fully re-state the thumbnail even when the request is a tweak ("darker background", "no text", "blue palette"): keep what was working, apply the change, and describe the finished frame from scratch.

Return JSON with:
- "direction": 2 to 4 sentences in first person to the art director. Name the concrete choices (subject, expression, framing, text, palette) and explain why they follow the craft rules or the training notes. Reference what was tried earlier when relevant, including ratings.
- "imagePrompt": a production-ready prompt for an image model. Describe composition and crop, the subject and exact expression, lighting, background, palette with hex values, and the on-thumbnail text with its colour and placement. No meta commentary, no markdown, no quotes around the whole thing.`;
}

export function buildThumbnailVariationsPrompt({ client, knowledge, messages, source }) {
  return `You are the senior thumbnail art director at a content agency that runs in-house content teams for personal-brand entrepreneurs.

${CRAFT_RULES}

${contextBlock({ client, knowledge, messages })}

THE DIRECTION TO VARIATE
${source.content}

Create exactly 3 meaningfully different variations of that direction: change the composition, the subject's expression, the palette or the text treatment between them. Do not produce three near-identical renders.

Return JSON with a "variants" array of exactly 3 objects, each with:
- "direction": 1 to 2 sentences naming that variation's specific twist and why it could win.
- "imagePrompt": a production-ready prompt for an image model, describing composition, subject and exact expression, lighting, background, palette with hex values, and the on-thumbnail text with its colour and placement.`;
}