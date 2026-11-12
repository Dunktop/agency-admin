import { useMemo, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import PageHeader from "@/components/layout/PageHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import CalendarSummary from "@/components/calendar/CalendarSummary";
import MonthNav from "@/components/calendar/MonthNav";
import { buildCells, monthLabel, monthPrefix } from "@/components/calendar/calendar-dates";
import { getCalendar, togglePaymentPaid } from "@/lib/calendar-fns";

export const Route = createFileRoute("/_authed/calendar")({
  ssr: false,
  loader: () => getCalendar(),
  head: () => ({ meta: [{ title: "Calendar · Agency Admin" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const { payments } = Route.useLoaderData();
  const router = useRouter();
  const toggle = useServerFn(togglePaymentPaid);

  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [busyId, setBusyId] = useState(null);

  const cells = useMemo(() => buildCells(cursor.year, cursor.month), [cursor]);
  const monthPayments = useMemo(
    () => payments.filter((payment) => payment.dueDate.startsWith(monthPrefix(cursor.year, cursor.month))),
    [payments, cursor]
  );

  const paymentsByDate = useMemo(() => {
    const map = {};
    for (const payment of monthPayments) {
      if (!map[payment.dueDate]) map[payment.dueDate] = [];
      map[payment.dueDate].push(payment);
    }
    for (const key of Object.keys(map)) map[key].sort((a, b) => a.amount - b.amount);
    return map;
  }, [monthPayments]);

  const collected = monthPayments.filter((payment) => payment.paid);
  const outstanding = monthPayments.filter((payment) => !payment.paid);
  const sum = (list) => list.reduce((total, payment) => total + payment.amount, 0);

  const step = (direction) => {
    setCursor((current) => {
      const next = new Date(Date.UTC(current.year, current.month + direction, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  };

  const handleToggle = async (id) => {
    setBusyId(id);
    try {
      await toggle({ data: { id } });
      await router.invalidate();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Calendar"
        subtitle={`Payment collection days · ${monthLabel(cursor.year, cursor.month)}`}
        action={<MonthNav year={cursor.year} month={cursor.month} onStep={step} onToday={() => setCursor({ year: now.getFullYear(), month: now.getMonth() })} />}
      />

      <CalendarSummary
        collected={sum(collected)}
        collectedCount={collected.length}
        outstanding={sum(outstanding)}
        outstandingCount={outstanding.length}
      />

      <p className="px-1 text-[12.5px] leading-relaxed text-muted-foreground">
        Tap a client's name on a payment day to mark the money collected. It turns green and the cash collected total
        above goes up.
      </p>

      <CalendarGrid
        year={cursor.year}
        month={cursor.month}
        cells={cells}
        paymentsByDate={paymentsByDate}
        busyId={busyId}
        onToggle={handleToggle}
      />
    </div>
  );
}