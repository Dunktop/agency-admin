import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

export const getCalendar = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const [paymentsPage, clientsPage] = await Promise.all([
      base44.entities.Payment.list({ sort: "dueDate", limit: 500 }),
      base44.entities.Client.list({ sort: "name", limit: 200 }),
    ]);

    const names = new Map(clientsPage.items.map((client) => [client.id, client.name]));

    return {
      payments: paymentsPage.items
        .filter((payment) => payment.dueDate)
        .map((payment) => ({
          id: payment.id,
          clientId: payment.client,
          clientName: names.get(payment.client) || "Removed client",
          amount: Number(payment.amount) || 0,
          type: payment.type,
          dueDate: payment.dueDate,
          paidDate: payment.paidDate || null,
          paid: payment.status === "PAID",
        })),
    };
  });

export const togglePaymentPaid = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const payment = await base44.entities.Payment.get(data.id);

    if (payment.status === "PAID") {
      return base44.entities.Payment.update(data.id, { status: "PENDING", paidDate: null });
    }

    return base44.entities.Payment.update(data.id, {
      status: "PAID",
      paidDate: new Date().toISOString().slice(0, 10),
    });
  });