import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { readSettingValue, writeSetting } from "@/lib/integration-store.server";

const PASSWORD_SETTING = "security:super_admin";
const GRANT_SETTING = "security:grant";
const GRANT_MINUTES = 15;

const encode = (value) => new TextEncoder().encode(value);

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const digest = async (salt, password) =>
  toHex(await crypto.subtle.digest("SHA-256", encode(`${salt}:${password}`)));

const newSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));

const readJson = async (base44, key) => {
  const raw = await readSettingValue(base44, key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const getSecurityState = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    if (context.user?.role !== "admin") return { canManage: false, passwordSet: false };
    const record = await readJson(context.getBase44(), PASSWORD_SETTING);
    return { canManage: true, passwordSet: Boolean(record?.hash) };
  });

export const setSuperAdminPassword = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ password: z.string().min(8).max(200) }))
  .handler(async ({ data, context }) => {
    if (context.user?.role !== "admin") throw new Error("Only an admin can set the super admin password.");
    const base44 = context.getBase44();
    const salt = newSalt();
    const hash = await digest(salt, data.password);
    await writeSetting(base44, PASSWORD_SETTING, JSON.stringify({ salt, hash, updatedAt: new Date().toISOString() }));
    return { passwordSet: true };
  });

// Step one of the login-screen Super Admin Access flow: runs before anyone is
// signed in, and only ever answers with a short-lived grant id.
export const grantSuperAdminAccess = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1).max(200) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const record = await readJson(base44, PASSWORD_SETTING);
    if (!record?.hash) {
      throw new Error("No super admin password is set yet. Set one in Settings → Security.");
    }
    const candidate = await digest(record.salt || "", data.password);
    if (candidate !== record.hash) throw new Error("That password isn't right.");

    const grantId = crypto.randomUUID();
    const expiresAt = Date.now() + GRANT_MINUTES * 60000;
    await writeSetting(base44, GRANT_SETTING, JSON.stringify({ id: grantId, expiresAt }));

    return { grantId, minutes: GRANT_MINUTES };
  });

// Step two: the grant promotes whoever just signed in, so owner access always
// arrives through a real session.
export const applySuperAdminGrant = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ grantId: z.string().min(8).max(120) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const grant = await readJson(base44, GRANT_SETTING);
    if (!grant?.id || grant.id !== data.grantId || Number(grant.expiresAt) < Date.now()) {
      throw new Error("That super admin grant has expired. Ask for a new one.");
    }

    if (context.user?.role !== "admin") {
      await base44.asServiceRole.entities.User.update(context.user.id, { role: "admin" });
    }
    await writeSetting(base44, GRANT_SETTING, "");

    return { ok: true, email: context.user?.email || "", role: "admin" };
  });