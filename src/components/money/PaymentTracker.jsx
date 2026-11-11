import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import SectionCard from "@/components/clients/detail/SectionCard";
import { markPaymentPaid } from "@/lib/server-fns";
import { PAYMENT_LABELS, formatDate, formatMoney } from "@/lib/clients";

const STATUS_META = {
  PAID: { label: "Paid", color: "#30D158" },
  PENDING: { label: "Pending", color: "#FF9F0A" },
  OVERDUE: { label: "Overdue", color: "#FF453A" },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[13px] font-medium"
      style={{ background: `${meta.color}1f`, color: meta.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

function PaymentRow({ payment, onMarkPaid, busy }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-medium">{payment.clientName}</p>
        <p className="text-[13px] text-muted-foreground">
          {PAYMENT_LABELS[payment.type] || payment.type} ·{" "}
          {payment.status === "PAID"
            ? `paid ${formatDate(payment.paidDate)}`
            : payment.dueDate
              ? `due ${formatDate(payment.dueDate)}`
              : "no due date"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-[15px] font-semibold tabular-nums">{formatMoney(payment.amount)}</span>
        <StatusPill status={payment.status} />
        {payment.status !== "PAID" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onMarkPaid(payment.id)}
            className="inline-flex items-center gap-1.5 rounded-[10px] border px-2.5 py-1 text-[13px] font-medium transition-colors hover:bg-[var(--nav-hover)] disabled:opacity-60"
            style={{ borderColor: "var(--glass-border)" }}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Mark paid
          </button>
        )}
      </div>
    </li>
  );
}

export default function PaymentTracker({ payments }) {
  const router = useRouter();
  const markPaid = useServerFn(markPaymentPaid);
  const [pendingId, setPendingId] = useState(null);

  async function handleMarkPaid(id) {
    setPendingId(id);
    try {
      await markPaid({ data: { id } });
      await router.invalidate();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <SectionCard
      title="Payment tracker"
      delay={120}
      action={
        <span className="text-[13px] text-muted-foreground">
          {payments.length} invoice{payments.length === 1 ? "" : "s"}
        </span>
      }
    >
      {payments.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">No payments recorded yet.</p>
      ) : (
        <ul className="divide-y" style={{ borderColor: "var(--hairline)" }}>
          {payments.map((payment) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              onMarkPaid={handleMarkPaid}
              busy={pendingId === payment.id}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}