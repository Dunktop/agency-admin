import { useState } from "react";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { analyzeClientChannel, getClientWorkspace, updateClient } from "@/lib/server-fns";
import { formatDate, formatMoney, parseJsonList } from "@/lib/clients";
import ClientAvatar from "@/components/clients/ClientAvatar";
import { PlanBadge, StagePill, StatusPill } from "@/components/clients/Badges";
import OverviewCard from "@/components/clients/detail/OverviewCard";
import StrategyCard from "@/components/clients/detail/StrategyCard";
import PipelineCard from "@/components/clients/detail/PipelineCard";
import TeamCard from "@/components/clients/detail/TeamCard";
import PaymentsCard from "@/components/clients/detail/PaymentsCard";
import AnalyticsCard from "@/components/clients/detail/AnalyticsCard";
import NotesCard from "@/components/clients/detail/NotesCard";
import ClientAITools from "@/components/clients/detail/ClientAITools";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authed/clients/$clientId")({
  loader: async ({ params }) => {
    const workspace = await getClientWorkspace({ data: { clientId: params.clientId } });
    if (!workspace) throw notFound();
    return workspace;
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.client?.name || "Client"} · Agency Admin` }] }),
  component: ClientDetailPage,
});

function ClientDetailPage() {
  const { client, progress, team, payments, analytics } = Route.useLoaderData();
  const refreshAnalysis = useServerFn(analyzeClientChannel);
  const update = useServerFn(updateClient);
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [aiUnavailable, setAiUnavailable] = useState(false);

  const stage = progress[0]?.stage;
  const uploads = parseJsonList(client.latestUploads);

  const refresh = async () => {
    if (!client.channelUrl) return;
    setRefreshing(true);
    setAiUnavailable(false);
    try {
      const result = await refreshAnalysis({ data: { channelUrl: client.channelUrl } });
      await update({
        data: {
          id: client.id,
          channelThumbnail: result.channelThumbnail || client.channelThumbnail || "",
          channelSummary: result.channelSummary,
          contentStyle: result.contentStyle,
          offers: result.offers,
          contentStrategy: result.contentStrategy,
          growthOpportunities: result.growthOpportunities,
          strategyItems: JSON.stringify(result.strategyItems || []),
          latestUploads: JSON.stringify(result.latestUploads || []),
          analysisDate: result.analysisDate,
        },
      });
      await router.invalidate();
    } catch {
      setAiUnavailable(true);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Link
        to="/clients"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Clients
      </Link>

      <header className="glass animate-rise rounded-2xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <ClientAvatar src={client.channelThumbnail} name={client.name} className="h-14 w-14" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em]">{client.name}</h1>
              <StatusPill status={client.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PlanBadge planType={client.planType} customPlanLabel={client.customPlanLabel} />
              <StagePill stage={stage} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted-foreground">
              <span>
                Monthly <span className="text-foreground tabular-nums">{formatMoney(client.monthlyFee)}</span>
              </span>
              <span>
                Setup <span className="text-foreground tabular-nums">{formatMoney(client.setupFee)}</span>
              </span>
              {client.startDate && <span>Since {formatDate(client.startDate)}</span>}
              {client.analysisDate && <span>Analysed {formatDate(client.analysisDate)}</span>}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-1.5 sm:items-end">
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing || !client.channelUrl}
              className="inline-flex h-10 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-medium transition-opacity disabled:opacity-50"
              style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
            >
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.9} />
              )}
              {refreshing ? "Refreshing…" : "Refresh analysis"}
            </button>
            {!client.channelUrl && (
              <p className="text-[13px] text-muted-foreground">Add a channel URL to analyse.</p>
            )}
          </div>
        </div>
      </header>

      <OverviewCard client={client} uploads={uploads} aiUnavailable={aiUnavailable} />

      <StrategyCard client={client} aiUnavailable={aiUnavailable} />

      <ClientAITools clientId={client.id} />

      <div className="grid gap-4 lg:grid-cols-2">
        <PipelineCard clientId={client.id} stage={stage} updatedAt={progress[0]?.updatedAt} />
        <TeamCard team={team} />
        <PaymentsCard payments={payments} />
        <AnalyticsCard snapshots={analytics} />
      </div>

      <NotesCard client={client} />
    </div>
  );
}