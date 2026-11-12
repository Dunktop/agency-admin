import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const memberFields = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.enum(["CHANNEL_MANAGER", "SHORT_FORM_EDITOR", "LONG_FORM_EDITOR", "THUMBNAIL_DESIGNER"]),
  cost: z.number().min(0).max(1000000).optional(),
});

export const getTeamAllocation = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const [clientsPage, membersPage] = await Promise.all([
      base44.entities.Client.list({ sort: "name", limit: 200 }),
      base44.entities.TeamMember.list({ sort: "name", limit: 500 }),
    ]);

    const clientById = new Map(clientsPage.items.map((client) => [client.id, client.name]));

    const lanes = clientsPage.items.map((client) => {
      const members = membersPage.items
        .filter((member) => member.client === client.id)
        .map((member) => ({
          id: member.id,
          name: member.name,
          role: member.role,
          cost: Number(member.cost) || 0,
        }))
        .sort((a, b) => a.role.localeCompare(b.role));

      return {
        id: client.id,
        name: client.name,
        status: client.status || "ACTIVE",
        members,
        cost: members.reduce((sum, member) => sum + member.cost, 0),
      };
    });

    const capacity = new Map();
    for (const member of membersPage.items) {
      if (!clientById.has(member.client)) continue;
      const key = member.name.trim().toLowerCase();
      if (!capacity.has(key)) {
        capacity.set(key, { name: member.name, roles: new Set(), clients: new Set(), cost: 0 });
      }
      const entry = capacity.get(key);
      entry.roles.add(member.role);
      entry.clients.add(member.client);
      entry.cost += Number(member.cost) || 0;
    }

    return {
      lanes,
      capacity: [...capacity.values()]
        .map((entry) => ({
          name: entry.name,
          roles: [...entry.roles],
          clients: entry.clients.size,
          cost: entry.cost,
        }))
        .sort((a, b) => b.clients - a.clients || a.name.localeCompare(b.name)),
      totalCost: lanes.reduce((sum, lane) => sum + lane.cost, 0),
      memberCount: membersPage.items.length,
    };
  });

export const addTeamMember = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(memberFields.extend({ clientId: z.string() }))
  .handler(async ({ data, context }) =>
    context.getBase44().entities.TeamMember.create({
      client: data.clientId,
      name: data.name,
      role: data.role,
      cost: data.cost ?? 0,
    })
  );

export const removeTeamMember = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    await context.getBase44().entities.TeamMember.delete(data.id);
    return { ok: true };
  });