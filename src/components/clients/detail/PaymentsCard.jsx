import { PAYMENT_LABELS, formatDate, formatMoney } from "@/lib/clients";
import { PaymentPill } from "../Badges";
import SectionCard from "./SectionCard";

function Row({ payment }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-[15px]">{PAYMENT_LABELS[payment.type] || payment.type}</p>
        <p className="text-[13px] text-muted-foreground">
          {payment.status === "PAID" ? `Paid ${formatDate(payment.paidDate)}` : `Due ${formatDate(payment.dueDate)}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-[15px] font-medium tabular-nums">{formatMoney(payment.amount)}</span>
        <PaymentPill status={payment.status} />
      </div>
    </li>
  );
}

export default function PaymentsCard({ payments }) {
  const upcoming = payments.filter((payment) => payment.status !== "PAID");
  const history = payments.filter((payment) => payment.status === "PAID");

  return (
    <SectionCard title="Payments" delay={220}>
      {payments.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">No payments recorded yet.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Upcoming</p>
            {upcoming.length === 0 ? (
              <p className="mt-1.5 text-[15px] text-muted-foreground">Nothing outstanding.</p>
            ) : (
              <ul className="mt-1 divide-y" style={{ borderColor: "var(--hairline)" }}>
                {upcoming.map((payment) => (
                  <Row key={payment.id} payment={payment} />
                ))}
              </ul>
            )}
          </div>

          {history.length > 0 && (
            <div className="border-t pt-3" style={{ borderColor: "var(--hairline)" }}>
              <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">History</p>
              <ul className="mt-1 divide-y" style={{ borderColor: "var(--hairline)" }}>
                {history.map((payment) => (
                  <Row key={payment.id} payment={payment} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}