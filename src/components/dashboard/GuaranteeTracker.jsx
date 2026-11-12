import { Link } from "@tanstack/react-router";

const TONE = {
  approaching: { color: "#FF9F0A", label: "Approaching 30 days" },
  past: { color: "#FF453A", label: "Past 30 days — review" },
  onTrack: { color: "#30D158", label: "On track" },
};

const toneFor = (client) => {
  if (client.dayCount === null) return TONE.onTrack;
  if (client.dayCount > 30) return TONE.past;
  if (client.daysLeft <= 7) return TONE.approaching;
  return TONE.onTrack;
};

export default function GuaranteeTracker({ clients }) {
  return (
    <div className="mt-5 pt-4" style={{ borderTop: "0.5px solid var(--hairline)" }}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-[13.5px] font-medium">30-day guarantee watch</h3>
        <p className="text-[11.5px] text-muted-foreground">Views up in 30 days, or the client is refunded in full</p>
      </div>

      {clients.length === 0 ? (
        <p className="mt-2 text-[13.5px] text-muted-foreground">No active clients to track yet.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {clients.map((client) => {
            const tone = toneFor(client);
            const progress = client.dayCount === null ? 0 : Math.min(client.dayCount, 30) / 30;
            return (
              <li key={client.id} className="rounded-xl px-3 py-2.5" style={{ background: "var(--nav-hover)" }}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <Link
                    to="/clients/$clientId"
                    params={{ clientId: client.id }}
                    className="truncate text-[13.5px] font-medium hover:underline"
                  >
                    {client.name}
                  </Link>
                  <span className="text-[11.5px] font-medium tabular-nums" style={{ color: tone.color }}>
                    {client.dayCount === null ? "No start date" : `Day ${client.dayCount} of 30`}
                  </span>
                </div>
                <div className="mt-1.5 h-[5px] w-full overflow-hidden rounded-full" style={{ background: "var(--glass-border)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${progress * 100}%`, background: tone.color }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{tone.label}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}