import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const DAY_MS = 86400000;

const utcMidnight = (value) => {
  if (!value) return null;
  const date = new Date(value);
  const stamp = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Number.isNaN(stamp) ? null : stamp;
};

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();

    const [clientsPage, paymentsPage, progressPage, objectivesPage] = await Promise.all([
      base44.entities.Client.list({ sort: "name", limit: 200 }),
      base44.entities.Payment.list({ sort: "dueDate", limit: 500 }),
      base44.entities.ClientProgress.list({ sort: "-updated_date", limit: 500 }),
      base44.entities.Objective.list({ sort: "created_date", limit: 100 }),
    ]);

    const stageByClient = new Map();
    for (const record of progressPage.items) {
      if (record.client && !stageByClient.has(record.client)) stageByClient.set(record.client, record.stage);
    }

    const now = new Date();
    const todayStamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
    const monthEnd = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);

    const active = clientsPage.items.filter((client) => client.status !== "CHURNED");

    const mrr = active.reduce((sum, client) => sum + (Number(client.monthlyFee) || 0), 0);
    const outstanding = paymentsPage.items
      .filter((payment) => payment.status !== "PAID")
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    const revenueThisMonth = paymentsPage.items
      .filter((payment) => {
        if (payment.status !== "PAID" || !payment.paidDate) return false;
        const stamp = utcMidnight(payment.paidDate);
        return stamp !== null && stamp >= monthStart && stamp < monthEnd;
      })
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

    const clients = active
      .map((client) => {
        const startStamp = utcMidnight(client.startDate || client.created_date);
        const dayCount = startStamp === null ? null : Math.max(1, Math.floor((todayStamp - startStamp) / DAY_MS) + 1);
        return {
          id: client.id,
          name: client.name,
          channelThumbnail: client.channelThumbnail || "",
          planType: client.planType || "TEAM_ONLY",
          stage: stageByClient.get(client.id) || null,
          dayCount,
          daysLeft: dayCount === null ? null : 30 - dayCount,
          monthlyFee: Number(client.monthlyFee) || 0,
        };
      })
      .sort((a, b) => (b.dayCount ?? 0) - (a.dayCount ?? 0));

    return {
      totals: {
        mrr,
        clients: active.length,
        revenueThisMonth,
        outstanding,
      },
      clients,
      objectives: objectivesPage.items.map((objective) => ({
        id: objective.id,
        title: objective.title,
        done: Boolean(objective.done),
      })),
    };
  });

export const toggleObjective = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string(), done: z.boolean() }))
  .handler(async ({ data, context }) =>
    context.getBase44().entities.Objective.update(data.id, { done: data.done })
  );

export const addObjective = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ title: z.string().trim().min(3).max(400) }))
  .handler(async ({ data, context }) =>
    context.getBase44().entities.Objective.create({ title: data.title, done: false })
  );