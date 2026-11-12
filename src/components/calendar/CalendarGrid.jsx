import { WEEKDAY_SHORT, todayKey } from "./calendar-dates";
import PaymentChip from "./PaymentChip";

const STYLE = `
.pcal-root { container-type: inline-size; }
.pcal-card {
  max-height: 800px; overflow-y: auto; overflow-x: hidden;
  color: hsl(var(--foreground));
}
.pcal-head { display: none; }
.pcal-grid { display: block; margin: 0; padding: 0; }
.pcal-day {
  position: relative; display: flex; flex-direction: column; gap: 14px;
  padding: 12px 16px; border-bottom: 0.5px solid var(--hairline);
  list-style: none; transition: background-color .18s ease;
}
.pcal-day:last-child { border-bottom: 0; }
.pcal-day[data-out="true"] { background: rgba(255,255,255,0.025); }
.pcal-day[data-out="true"] .pcal-date { color: var(--nav-fg); }
.pcal-day--empty { height: 56px; padding-block: 0; justify-content: center; }
.pcal-day--empty .pcal-meta { margin: 0; }
.pcal-meta { display: flex; align-items: baseline; gap: 6px; margin: 0; }
.pcal-meta-day {
  font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--nav-fg);
}
.pcal-date { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }
.pcal-day[data-today="true"] .pcal-date { color: #64D2FF; }
.pcal-day[data-today="true"] .pcal-meta-day { color: #64D2FF; }
.pcal-events { order: 1; display: flex; flex-direction: column; gap: 6px; margin: 0; padding: 0; list-style: none; }
.pcal-events:empty { display: none; }
.pcal-ev {
  display: flex; flex-direction: column; align-items: flex-start; gap: 5px;
  width: 100%; min-width: 0; min-height: 50px; padding: 10px 12px;
  border-radius: 8px; border: 0; font: inherit; text-align: left; cursor: pointer;
  transition: filter .18s ease, transform .18s ease;
}
.pcal-ev:hover { filter: brightness(1.14); transform: translateY(-1px); }
.pcal-ev:focus-visible { outline: 2px solid #0A84FF; outline-offset: 2px; }
.pcal-ev--inline {
  flex-direction: row; flex-wrap: wrap; align-items: baseline; justify-content: space-between;
  column-gap: 8px; min-height: 29px; padding: 7px 12px;
}
.pcal-ev-name {
  min-width: 0; font-size: 12px; font-weight: 600; line-height: 1.15;
  overflow-wrap: break-word;
}
.pcal-ev-amount { font-size: 12px; line-height: 1.15; font-variant-numeric: tabular-nums; white-space: nowrap; }
@container (max-width: 859px) {
  .pcal-ev { flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: space-between; column-gap: 8px; }
}
@container (min-width: 860px) {
  .pcal-card { max-height: none; overflow: hidden; }
  .pcal-head {
    display: grid; grid-template-columns: repeat(7, minmax(0, 1fr));
    border-bottom: 0.5px solid var(--hairline);
  }
  .pcal-head-cell {
    display: flex; align-items: center; height: 65px; padding-inline: 16px; margin: 0;
    font-size: clamp(15px, 1.6cqi, 22px); font-weight: 600; text-transform: uppercase;
    color: var(--nav-fg); border-right: 0.5px solid var(--hairline);
  }
  .pcal-head-cell:last-child { border-right: 0; }
  .pcal-head-cell[data-today="true"] { color: #64D2FF; }
  .pcal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
  .pcal-day {
    display: flex; flex-direction: column; align-items: stretch;
    min-height: 131px; gap: 0; padding: 0;
    border-bottom: 0.5px solid var(--hairline); border-right: 0.5px solid var(--hairline);
  }
  .pcal-day--empty { height: auto; padding-block: 0; }
  .pcal-day:nth-child(7n) { border-right: 0; }
  .pcal-events { order: 1; flex: 1 0 auto; padding: 8px; }
  .pcal-events:empty { display: flex; }
  .pcal-meta { order: 2; margin-top: auto; padding: 8px; }
  .pcal-meta-day { display: none; }
  .pcal-ev { padding-inline: clamp(8px, 0.94cqi, 12px); }
  .pcal-ev-name { font-size: clamp(11px, 0.94cqi, 12px); }
}
`;

export default function CalendarGrid({ year, month, cells, paymentsByDate, busyId, onToggle }) {
  const today = todayKey();
  const todayIndex = cells.findIndex((cell) => cell.key === today);

  return (
    <div className="pcal-root">
      <style>{STYLE}</style>
      <div className="glass pcal-card rounded-2xl">
        <div className="pcal-head" aria-hidden="true">
          {WEEKDAY_SHORT.map((name, index) => (
            <p key={name} className="pcal-head-cell" data-today={String(index === todayIndex % 7 && todayIndex > -1)}>
              {name}
            </p>
          ))}
        </div>

        <ul className="pcal-grid">
          {cells.map((cell, index) => {
            const payments = paymentsByDate[cell.key] || [];
            const weekday = WEEKDAY_SHORT[index % 7];
            return (
              <li
                key={cell.key}
                className={`pcal-day${payments.length === 0 ? " pcal-day--empty" : ""}`}
                data-out={String(cell.outside)}
                data-today={String(cell.key === today)}
              >
                <p className="pcal-meta">
                  <span className="pcal-meta-day">{weekday}</span>
                  <span className="pcal-date">{String(cell.day).padStart(2, "0")}</span>
                </p>
                <ul className="pcal-events">
                  {payments.map((payment, paymentIndex) => (
                    <li key={payment.id}>
                      <PaymentChip
                        payment={payment}
                        overdue={!payment.paid && payment.dueDate < today}
                        inline={paymentIndex > 0}
                        busy={busyId === payment.id}
                        onToggle={onToggle}
                      />
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}