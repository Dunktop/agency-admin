import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import {
  EXTRACTION_SCHEMA,
  MAX_TRAINING_CHARS,
  buildSummaryPrompt,
  buildTrainingPrompt,
  chunkTrainingInput,
} from "@/lib/knowledge.server";

const scopeSchema = z.enum(["THUMBNAIL_GLOBAL", "VIDEO_GLOBAL"]);

const FALLBACK_PRINCIPLE =
  "I've saved this training material. I couldn't restate the rules this time, so read the material in this exchange as the source of truth and send it again if you want a tighter summary.";

const shapeEntry = (record) => ({
  id: record.id,
  userInput: record.userInput || "",
  learnedPrinciple: record.learnedPrinciple || "",
  characters: (record.userInput || "").length,
  createdAt: record.timestamp || record.created_date,
});

export const listKnowledge = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ scope: scopeSchema }))
  .handler(async ({ data, context }) => {
    const page = await context
      .getBase44()
      .entities.KnowledgeEntry.filter({ scope: data.scope }, { sort: "created_date", limit: 500 });
    return { entries: page.items.map(shapeEntry), count: page.items.length };
  });

export const trainKnowledge = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      scope: scopeSchema,
      content: z.string().trim().min(1).max(MAX_TRAINING_CHARS),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();

    const existingPage = await base44.entities.KnowledgeEntry.filter(
      { scope: data.scope },
      { sort: "created_date", limit: 300 }
    );
    const existing = existingPage.items;

    const chunks = chunkTrainingInput(data.content);
    if (!chunks.length) throw new Error("There was nothing to learn from that.");

    const saved = [];
    for (let index = 0; index < chunks.length; index += 1) {
      let principle = "";
      try {
        const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: buildTrainingPrompt({
            scope: data.scope,
            chunk: chunks[index],
            part: index + 1,
            parts: chunks.length,
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
        userInput: chunks[index],
        learnedPrinciple: principle || FALLBACK_PRINCIPLE,
        timestamp: new Date().toISOString(),
      });
      saved.push(shapeEntry(record));
    }

    return { entries: saved, count: existing.length + saved.length };
  });

export const summarizeKnowledge = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ scope: scopeSchema }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const page = await base44.entities.KnowledgeEntry.filter(
      { scope: data.scope },
      { sort: "created_date", limit: 500 }
    );
    if (!page.items.length) return { summary: "", count: 0 };

    const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: buildSummaryPrompt({ scope: data.scope, entries: page.items }),
    });

    return { summary: String(raw ?? "").trim(), count: page.items.length };
  });

export const resetKnowledge = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ scope: scopeSchema }))
  .handler(async ({ data, context }) => {
    await context.getBase44().entities.KnowledgeEntry.deleteMany({ scope: data.scope });
    return { ok: true };
  });