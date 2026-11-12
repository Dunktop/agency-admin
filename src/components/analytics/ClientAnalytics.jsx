import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { addManualSnapshot, connectClientChannel, syncClientAnalytics } from "@/lib/analytics-fns";
import { formatCompact } from "@/lib/clients";
import AnalyticsStatCards from "./AnalyticsStatCards";
import ChannelConnectCard from "./ChannelConnectCard";
import ManualSnapshotForm from "./ManualSnapshotForm";
import MetricTrendChart from "./MetricTrendChart";
import TopVideosList from "./TopVideosList";
import { deltaHint, numberTick, shortDate } from "./analytics-format";

export default function ClientAnalytics({ selected, apiKeyConfigured }) {
  const router = useRouter();
  const sync = useServerFn(syncClientAnalytics);
  const connect = useServerFn(connectClientChannel);
  const manual = useServerFn(addManualSnapshot);

  const { client, snapshots } = selected;
  const latest = snapshots.length ? snapshots[snapshots.length - 1] : null;
  const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  const metrics = {
    views: latest?.views ?? 0,
    subscribers: latest?.subscribers ?? 0,
    ctr: latest?.impressionsCTR ?? null,
    watchHours: latest?.watchHours ?? null,
    viewsHint: deltaHint(latest?.views, previous?.views, "views"),
    subscribersHint: deltaHint(latest?.subscribers, previous?.subscribers, "subscribers"),
    ctrHint: latest?.impressionsCTR ? "Latest snapshot" : "Add it on a snapshot",
    watchHint: latest?.watchHours ? "Latest snapshot" : "Add it on a snapshot",
  };

  const viewsPoints = snapshots.map((snapshot) => ({ label: shortDate(snapshot.date), value: snapshot.views }));
  const watchPoints = snapshots
    .filter((snapshot) => snapshot.watchHours !== null && snapshot.watchHours !== undefined)
    .map((snapshot) => ({ label: shortDate(snapshot.date), value: snapshot.watchHours }));

  return (
    <div className="space-y-5">
      <AnalyticsStatCards metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <MetricTrendChart
          title="Views over time"
          data={viewsPoints}
          color="#0A84FF"
          fillId="analyticsViewsFill"
          tickFormatter={numberTick}
          valueFormatter={(value) => `${formatCompact(value)} views`}
          note={latest ? `${snapshots.length} snapshot${snapshots.length === 1 ? "" : "s"}` : null}
          emptyHint="Sync the channel again on another day, or add an earlier date by hand, and the views trend draws here."
        />
        <TopVideosList videos={latest?.topVideos ?? []} syncedAt={latest?.date} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MetricTrendChart
          title="Watch time trend"
          data={watchPoints}
          color="#BF5AF2"
          fillId="analyticsWatchFill"
          tickFormatter={numberTick}
          valueFormatter={(value) => `${formatCompact(value)} hours`}
          delay={180}
          emptyHint="Watch hours aren't in the public YouTube API — record them on two snapshots and the trend appears."
        />
        <ChannelConnectCard
          client={client}
          apiKeyConfigured={apiKeyConfigured}
          onConnect={async (channel) => {
            await connect({ data: { clientId: client.id, channel } });
            await sync({ data: { clientId: client.id } });
            await router.invalidate();
          }}
          onSync={async () => {
            await sync({ data: { clientId: client.id } });
            await router.invalidate();
          }}
        />
      </div>

      <ManualSnapshotForm
        onSave={async (payload) => {
          await manual({ data: { clientId: client.id, ...payload } });
          await router.invalidate();
        }}
      />
    </div>
  );
}