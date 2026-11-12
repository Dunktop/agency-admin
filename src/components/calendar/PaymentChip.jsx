import { formatMoney } from "@/lib/clients";

const STATUS = {
  PAID: { color: "#30D158", fill: "#30D158", ink: "#06240F" },
  OVERDUE: { color: "#FF453A", fill: "rgba(255,69,58,0.16)", ink: "#FF8A80" },
  PENDING: { color: "#FF9F0A", fill: "rgba(255,159,10,0.16)", ink: "#FFBF5C" },
};

export default function PaymentChip({ payment, overdue, busy, inline, onToggle }) {
  const palette = payment.paid ? STATUS.PAID : overdue ? STATUS.OVERDUE : STATUS.PENDING;
  const style = payment.paid
    ? { background: palette.fill, color: palette.ink, border: "0.5px solid #30D158" }
    : { background: palette.fill, color: palette.ink, border: `0.5px solid ${palette.color}55` };

  return (
    <button
      type="button"
      onClick={() => onToggle(payment.id)}
      disabled={busy}
      aria-pressed={payment.paid}
      aria-label={`${payment.clientName} · ${formatMoney(payment.amount)} · ${
        payment.paid ? "collected, click to unmark" : "click to mark collected"
      }`}
      className={`pcal-ev${inline ? " pcal-ev--inline" : ""}`}
      style={{ ...style, opacity: busy ? 0.5 : 1 }}
    >
      <span className="pcal-ev-name">{payment.clientName}</span>
      <span className="pcal-ev-amount">{formatMoney(payment.amount)}</span>
    </button>
  );
}