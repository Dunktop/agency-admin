import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const leadFields = z.object({
  name: z.string().trim().min(1).max(200),
  channelUrl: z.string().trim().max(500).optional(),
  notes: z.string().max(5000).optional(),
  status: z.enum(["TO_CONTACT", "CONTACTED", "IN_TALKS", "CLOSED", "LOST"]),
  upfrontCash: z.number().min(0).max(10000000).optional(),
  monthlyRecurring: z.number().min(0).max(1000000).optional(),
});

export const getLeads = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const page = await context.getBase44().entities.Lead.list({ sort: "-created_date", limit: 300 });

    const leads = page.items.map((lead) => ({
      id: lead.id,
      name: lead.name,
      channelUrl: lead.channelUrl || "",
      notes: lead.notes || "",
      status: lead.status || "TO_CONTACT",
      upfrontCash: Number(lead.upfrontCash) || 0,
      monthlyRecurring: Number(lead.monthlyRecurring) || 0,
    }));

    const open = leads.filter((lead) => lead.status !== "CLOSED" && lead.status !== "LOST");
    const won = leads.filter((lead) => lead.status === "CLOSED");

    return {
      leads,
      totals: {
        count: leads.length,
        openCount: open.length,
        openUpfront: open.reduce((sum, lead) => sum + lead.upfrontCash, 0),
        openMonthly: open.reduce((sum, lead) => sum + lead.monthlyRecurring, 0),
        wonCount: won.length,
        wonUpfront: won.reduce((sum, lead) => sum + lead.upfrontCash, 0),
        wonMonthly: won.reduce((sum, lead) => sum + lead.monthlyRecurring, 0),
      },
    };
  });

export const createLead = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(leadFields)
  .handler(async ({ data, context }) => context.getBase44().entities.Lead.create(data));

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(leadFields.partial().extend({ id: z.string() }))
  .handler(async ({ data: { id, ...patch }, context }) =>
    context.getBase44().entities.Lead.update(id, patch)
  );

export const deleteLead = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    await context.getBase44().entities.Lead.delete(data.id);
    return { ok: true };
  });