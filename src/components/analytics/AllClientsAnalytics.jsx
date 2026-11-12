import AnalyticsStatCards from "./AnalyticsStatCards";
import ClientComparisonTable from "./ClientComparisonTable";
import ViewsByClientChart from "./ViewsByClientChart";

export default function AllClientsAnalytics({ clients, onSelect }) {
  const synced = clients.filter((client) => client.latest);

  const views = synced.reduce((total, client) => total + client.latest.views, 0);
  const subscribers = synced.reduce((total, client) => total + client.latest.subscribers, 0);
  const watchHours = synced.reduce((total, client) => total + (client.latest.watchHours || 0), 0);
  const withCtr = synced.filter((client) => client.latest.impressionsCTR !== null);
  const ctr = withCtr.length
    ? withCtr.reduce((total, client) => total + client.latest.impressionsCTR, 0) / withCtr.length
    : null;

  const metrics = {
    views,
    subscribers,
    ctr,
    watchHours: watchHours || null,
    viewsHint: `${synced.length} of ${clients.length} clients with snapshots`,
    subscribersHint: "Latest snapshot per client",
    ctrHint: withCtr.length ? `Across ${withCtr.length} client${withCtr.length === 1 ? "" : "s"}` : "No CTR recorded yet",
    watchHint: "Manual entries across clients",
  };

  return (
    <div className="space-y-5">
      <AnalyticsStatCards metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ViewsByClientChart
          rows={synced.map((client) => ({ name: client.name, value: client.latest.views }))}
        />
        <ClientComparisonTable rows={clients} onSelect={onSelect} />
      </div>

      <p className="px-1 text-[12.5px] leading-relaxed text-muted-foreground">
        Pick a client above to connect their channel, sync fresh stats, or add numbers by hand.
      </p>
    </div>
  );
}