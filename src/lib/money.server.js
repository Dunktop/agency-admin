const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const toStamp = (value) => {
  if (!value) return null;
  const stamp = new Date(value).getTime();
  return Number.isNaN(stamp) ? null : stamp;
};

/**
 * Every money figure on the Money tab derives from the Client, Payment and
 * TeamMember records passed in — there are no stored copies of these numbers.
 */
export function computeMoneyOverview({ clients, payments, members, now = new Date() }) {
  const clientById = new Map(clients.map((client) => [client.id, client]));

  const costByClient = {};
  for (const member of members) {
    if (!member.client) continue;
    costByClient[member.client] = (costByClient[member.client] || 0) + (Number(member.cost) || 0);
  }

  const activeClients = clients.filter((client) => client.status !== "CHURNED");
  const mrr = activeClients.reduce((sum, client) => sum + (Number(client.monthlyFee) || 0), 0);
  const teamCost = activeClients.reduce((sum, client) => sum + (costByClient[client.id] || 0), 0);

  const todayStamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const setupStatus = {};
  for (const payment of payments) {
    if (payment.type !== "SETUP") continue;
    if (payment.status === "PAID") setupStatus[payment.client] = "PAID";
    else if (setupStatus[payment.client] !== "PAID") setupStatus[payment.client] = "OUTSTANDING";
  }

  const rows = payments.map((payment) => {
    const due = toStamp(payment.dueDate);
    const status = payment.status === "PAID" ? "PAID" : due !== null && due < todayStamp ? "OVERDUE" : "PENDING";
    return {
      id: payment.id,
      clientId: payment.client,
      clientName: clientById.get(payment.client)?.name || "Removed client",
      amount: Number(payment.amount) || 0,
      type: payment.type,
      dueDate: payment.dueDate || null,
      paidDate: payment.paidDate || null,
      status,
    };
  });

  const statusRank = { OVERDUE: 0, PENDING: 1, PAID: 2 };
  rows.sort((a, b) => {
    if (statusRank[a.status] !== statusRank[b.status]) return statusRank[a.status] - statusRank[b.status];
    if (a.status === "PAID") return String(b.paidDate || "").localeCompare(String(a.paidDate || ""));
    return String(a.dueDate || "9999-12-31").localeCompare(String(b.dueDate || "9999-12-31"));
  });

  const sumByStatus = (status) =>
    rows.filter((row) => row.status === status).reduce((sum, row) => sum + row.amount, 0);

  const paidAmount = sumByStatus("PAID");
  const pendingAmount = sumByStatus("PENDING");
  const overdueAmount = sumByStatus("OVERDUE");
  const outstanding = pendingAmount + overdueAmount;
  const billed = paidAmount + outstanding;

  const clientRows = activeClients
    .map((client) => {
      const monthlyFee = Number(client.monthlyFee) || 0;
      const cost = costByClient[client.id] || 0;
      return {
        id: client.id,
        name: client.name,
        planType: client.planType || "TEAM_ONLY",
        customPlanLabel: client.customPlanLabel || "",
        monthlyFee,
        setupFee: Number(client.setupFee) || 0,
        setupStatus: setupStatus[client.id] || "NONE",
        cost,
        margin: monthlyFee - cost,
      };
    })
    .sort((a, b) => b.monthlyFee - a.monthlyFee);

  const mrrSeries = [];
  const cashSeries = [];
  for (let i = 11; i >= 0; i -= 1) {
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const start = month.getTime();
    const end = Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1);
    const label = MONTH_LABELS[month.getUTCMonth()];

    const value = activeClients.reduce((sum, client) => {
      const from = toStamp(client.startDate || client.created_date) ?? 0;
      return from < end ? sum + (Number(client.monthlyFee) || 0) : sum;
    }, 0);
    mrrSeries.push({ label, value });

    if (i <= 5) {
      const revenue = rows.reduce((sum, row) => {
        if (row.status !== "PAID") return sum;
        const stamp = toStamp(row.paidDate);
        if (stamp === null || stamp < start || stamp >= end) return sum;
        return sum + row.amount;
      }, 0);
      const cost = activeClients.reduce((sum, client) => {
        const from = toStamp(client.startDate || client.created_date) ?? 0;
        return from < end ? sum + (costByClient[client.id] || 0) : sum;
      }, 0);
      cashSeries.push({ label, revenue, cost });
    }
  }

  const setupOutstanding = clientRows
    .filter((client) => client.setupStatus === "OUTSTANDING")
    .reduce((sum, client) => sum + client.setupFee, 0);

  return {
    totals: {
      totalRevenue: paidAmount,
      mrr,
      annual: mrr * 12,
      teamCost,
      margin: mrr - teamCost,
      marginPct: mrr ? Math.round(((mrr - teamCost) / mrr) * 100) : 0,
      paidAmount,
      pendingAmount,
      overdueAmount,
      outstanding,
      collectionRate: billed ? Math.round((paidAmount / billed) * 100) : 0,
      setupOutstanding,
      activeCount: activeClients.length,
      paidCount: rows.filter((row) => row.status === "PAID").length,
      openCount: rows.filter((row) => row.status !== "PAID").length,
      overdueCount: rows.filter((row) => row.status === "OVERDUE").length,
    },
    clients: clientRows,
    payments: rows,
    charts: {
      mrr: mrrSeries,
      cash: cashSeries,
      collection: [
        { name: "Collected", value: paidAmount },
        { name: "Pending", value: pendingAmount },
        { name: "Overdue", value: overdueAmount },
      ],
    },
  };
}