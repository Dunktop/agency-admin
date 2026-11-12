import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const requireAdmin = (context) => {
  if (context.user?.role !== "admin") throw new Error("Only an admin can manage team access.");
};

// Logins the app itself invited. The authoritative list of accounts and roles is
// the dashboard's App Users page, which this panel links to.
export const getTeamAccess = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    if (context.user?.role !== "admin") return { canManage: false, invites: [], self: null };

    const page = await context.getBase44().entities.TeamInvite.list({ sort: "-invitedAt", limit: 100 });
    const invites = (Array.isArray(page) ? page : page.items || []).map((record) => ({
      id: record.id,
      email: record.email || "",
      role: record.role || "user",
      invitedAt: record.invitedAt || record.created_date || null,
      invitedBy: record.invitedBy || "",
    }));

    return {
      canManage: true,
      invites,
      self: { email: context.user.email || "", role: context.user.role || "admin" },
    };
  });

export const inviteTeamMember = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      email: z.string().trim().toLowerCase().email().max(200),
      role: z.enum(["admin", "user"]),
    })
  )
  .handler(async ({ data, context }) => {
    requireAdmin(context);
    const base44 = context.getBase44();

    await base44.users.inviteUser(data.email, data.role);

    const existing = await base44.entities.TeamInvite.filter({ email: data.email }, { limit: 1 });
    const record = (Array.isArray(existing) ? existing : existing.items || [])[0];
    const fields = {
      email: data.email,
      role: data.role,
      invitedAt: new Date().toISOString(),
      invitedBy: context.user.email || "",
    };
    if (record) await base44.entities.TeamInvite.update(record.id, fields);
    else await base44.entities.TeamInvite.create(fields);

    return { ok: true, email: data.email };
  });