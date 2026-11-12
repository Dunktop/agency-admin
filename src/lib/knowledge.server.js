export const MAX_TRAINING_CHARS = 400000;
const CHUNK_SIZE = 40000;
const MAX_CHUNKS = 10;
const MAX_INJECTED = 80000;
const MAX_PRIOR = 12000;

const LABELS = {
  THUMBNAIL_GLOBAL: "THUMBNAIL TRAINING",
  VIDEO_GLOBAL: "VIDEO & IDEATION TRAINING",
};

const DOMAINS = {
  THUMBNAIL_GLOBAL:
    "YouTube thumbnail design: composition and crop, colour and contrast, typography and text rules, emotional triggers, faces and expressions, subject selection, what makes a thumbnail clickable in a crowded feed.",
  VIDEO_GLOBAL:
    "YouTube video packaging and ideation: titles, hooks, angles, story structure, retention, formats, thumbnail-to-title pairing, and channel strategy for personal-brand creators.",
};

const label = (scope) => LABELS[scope] || "TRAINING";
const domain = (scope) => DOMAINS[scope] || DOMAINS.VIDEO_GLOBAL;

const principlesOf = (entries) =>
  (entries || []).map((entry) => String(entry?.learnedPrinciple || "").trim()).filter(Boolean);

/** One block of durable rules, small enough to inject into every AI call. */
export function knowledgeBlock(entries, scope, { emptyHint } = {}) {
  const principles = principlesOf(entries);
  if (!principles.length) {
    return `${label(scope)}\n${emptyHint || "Nothing saved yet. Work from the general craft rules until the art director trains you."}`;
  }

  const lines = [];
  let total = 0;
  for (const principle of principles) {
    if (total + principle.length > MAX_INJECTED) {
      lines.push("- (further training notes are saved but omitted here for length)");
      break;
    }
    lines.push(`- ${principle}`);
    total += principle.length;
  }

  return `${label(scope)} — durable rules the art director taught you directly. Never break these; where they conflict with general advice, the training wins.\n${lines.join("\n")}`;
}

/** Splits a large paste into model-sized parts, preferring paragraph boundaries. */
export function chunkTrainingInput(text) {
  const clean = String(text || "");
  if (clean.length <= CHUNK_SIZE) return clean.trim() ? [clean] : [];

  const chunks = [];
  let index = 0;
  while (index < clean.length && chunks.length < MAX_CHUNKS) {
    let end = Math.min(clean.length, index + CHUNK_SIZE);
    if (end < clean.length) {
      const window = clean.slice(index, end);
      const breakAt = Math.max(window.lastIndexOf("\n\n"), window.lastIndexOf("\n"));
      if (breakAt > CHUNK_SIZE * 0.55) end = index + breakAt;
    }
    const piece = clean.slice(index, end).trim();
    if (piece) chunks.push(piece);
    index = end;
  }
  return chunks;
}

export const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    learnedPrinciple: { type: "string" },
  },
  required: ["learnedPrinciple"],
};

export function buildTrainingPrompt({ scope, chunk, part = 1, parts = 1, existing = [] }) {
  const prior = principlesOf(existing)
    .join("\n")
    .slice(0, MAX_PRIOR);

  return `You are the training archivist for a content agency that runs in-house content teams for personal-brand entrepreneurs.
The art director is training you on ${domain(scope)}

Your job is to read their material and turn it into durable, reusable rules that will be prepended to every future AI call in this domain.

WHAT YOU ALREADY KNOW FROM EARLIER TRAINING
${prior || "Nothing yet. This is the first training session."}

NEW TRAINING MATERIAL FROM THE ART DIRECTOR${parts > 1 ? ` (part ${part} of ${parts})` : ""}
"""
${chunk}
"""

Read it carefully: it may be a mix of principles, examples, references, teardowns and explanations. Extract only what should change how you design in future, and drop anything that is just context or a one-off.

Write "learnedPrinciple" as markdown:
- Open with 1 to 3 sentences in the first person confirming what you learned, in the art director's language. Be specific, never generic ("I've learned that…").
- Then a line "**Extracted rules**" followed by bullets, grouped under bold topic headings chosen from the material (for example **Composition**, **Colour & contrast**, **Text rules**, **Emotional triggers**, **Faces**, **Never**). Only use headings the material actually supports.
- Each bullet is a single imperative rule, self-contained, specific and testable. Keep exact numbers, hex values, ratios, wording and examples the art director gave.
- Never invent rules they did not state, and never water the material down into generic advice.

Return only the JSON object described by the schema.`;
}

export function buildSummaryPrompt({ scope, entries }) {
  const principles = principlesOf(entries).join("\n").slice(0, MAX_INJECTED);

  return `You are summarising everything a content agency has taught its AI about ${domain(scope)}

ALL SAVED TRAINING RULES, OLDEST FIRST
"""
${principles}
"""

Write a clean reference summary of the current knowledge:
- Group the rules under bold topic headings (for example **Composition**, **Colour & contrast**, **Text rules**, **Emotional triggers**, **Faces**, **Never do**), ordered by how central they are, and only include topics the training actually covers.
- Merge duplicates and contradictions; where a later rule overrides an earlier one, keep the later rule and note it as the current stance.
- Under each heading, tight bullets in the art director's own terms. Keep every specific number, hex value and piece of wording that matters.
- End with a short section "**Open gaps**" listing 1 to 3 things that are thin or missing and worth training next.
- Output markdown only. No preamble, no closing remarks, no reference to "the material above".`;
}