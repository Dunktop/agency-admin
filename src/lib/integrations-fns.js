import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import {
  CONNECTED,
  ERROR,
  INTEGRATIONS,
  NOT_CONFIGURED,
  YOUTUBE_LEGACY_KEY,
  friendlyTestError,
  integrationById,
  runIntegrationTest,
  statusOf,
} from "@/lib/integrations.server";
import {
  cleanFields,
  dismissOnboarding,
  readConfigState,
  readIntegrationFields,
  readSettingValue,
  writeIntegrationRecord,
  writeSetting,
} from "@/lib/integration-store.server";

const idSchema = z.enum(["ai", "higgsfield", "youtube", "discord", "notion"]);
const fieldMapSchema = z.record(z.string().max(60), z.string().max(400));

const requireAdmin = (context) => {
  if (context.user?.role !== "admin") throw new Error("Only an admin can change integrations.");
};

const mask = (fields) =>
  Object.fromEntries(Object.keys(fields).map((key) => [key, "••••••••"]));

export const getIntegrations = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const canManage = context.user?.role === "admin";
    const { states, dismissed } = await readConfigState(
      base44,
      INTEGRATIONS.map((entry) => entry.id)
    );

    const stored = states.youtube?.fields || {};
    let legacyYoutube = "";
    if (!stored.apiKey) {
      legacyYoutube = await readSettingValue(base44, YOUTUBE_LEGACY_KEY);
    }

    const integrations = INTEGRATIONS.map((definition) => {
      const record = states[definition.id] || {};
      const fields = cleanFields(record.fields);
      if (definition.id === "youtube" && !fields.apiKey && legacyYoutube) fields.apiKey = legacyYoutube;
      const missing = definition.fields.filter((key) => !fields[key]);
      const status =
        definition.id === "youtube" && legacyYoutube && !record.status
          ? CONNECTED
          : statusOf({ definition, fields, record });

      return {
        id: definition.id,
        required: definition.required,
        builtIn: Boolean(definition.builtIn),
        fieldKeys: definition.fields,
        fields: canManage ? fields : mask(fields),
        missing,
        status,
        testedAt: record.testedAt || null,
        error: record.error || "",
      };
    });

    return { canManage, dismissed, integrations };
  });

export const saveIntegration = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: idSchema, fields: fieldMapSchema.default({}) }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const base44 = context.getBase44();
    const definition = integrationById(data.id);
    const fields = cleanFields(data.fields);
    const missing = definition.fields.filter((key) => !fields[key]);
    if (missing.length) throw new Error("Add every credential before saving.");

    let message = "";
    try {
      message = await runIntegrationTest(base44, data.id, fields);
    } catch (error) {
      throw new Error(friendlyTestError(error));
    }

    const testedAt = new Date().toISOString();
    await writeIntegrationRecord(base44, data.id, { fields, status: CONNECTED, testedAt, error: "" });
    if (data.id === "youtube") await writeSetting(base44, YOUTUBE_LEGACY_KEY, fields.apiKey);

    return { ok: true, message, testedAt, status: CONNECTED };
  });

export const testIntegration = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: idSchema, fields: fieldMapSchema.optional() }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const base44 = context.getBase44();
    const stored = await readIntegrationFields(base44, data.id);
    const legacy =
      data.id === "youtube" && !stored.apiKey
        ? { apiKey: await readSettingValue(base44, YOUTUBE_LEGACY_KEY) }
        : {};
    const draft = cleanFields(data.fields);
    const hasDraft = Object.keys(draft).length > 0;
    const fields = hasDraft ? draft : cleanFields({ ...stored, ...legacy });
    const testedAt = new Date().toISOString();

    try {
      const message = await runIntegrationTest(base44, data.id, fields);
      await writeIntegrationRecord(base44, data.id, { fields, status: CONNECTED, testedAt, error: "" });
      if (data.id === "youtube" && fields.apiKey) await writeSetting(base44, YOUTUBE_LEGACY_KEY, fields.apiKey);
      return { ok: true, message, testedAt, status: CONNECTED };
    } catch (error) {
      const message = friendlyTestError(error);
      // A failing draft never overwrites credentials that already work.
      if (!hasDraft) {
        await writeIntegrationRecord(base44, data.id, {
          fields: stored,
          status: ERROR,
          testedAt,
          error: message,
        });
      }
      return { ok: false, message, testedAt: hasDraft ? null : testedAt, status: hasDraft ? null : ERROR };
    }
  });

export const disconnectIntegration = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: idSchema }))
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const base44 = context.getBase44();
    await writeIntegrationRecord(base44, data.id, {
      fields: {},
      status: NOT_CONFIGURED,
      testedAt: null,
      error: "",
    });
    if (data.id === "youtube") await writeSetting(base44, YOUTUBE_LEGACY_KEY, "");
    return { status: NOT_CONFIGURED };
  });

export const dismissFirstLaunch = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    requireAdmin(context);
    await dismissOnboarding(context.getBase44());
    return { dismissed: true };
  });