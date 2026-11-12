import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import AllClientsAnalytics from "@/components/analytics/AllClientsAnalytics";
import AnalyticsToolbar from "@/components/analytics/AnalyticsToolbar";
import ApiKeyCard from "@/components/analytics/ApiKeyCard";
import ClientAnalytics from "@/components/analytics/ClientAnalytics";
import { getAnalyticsPage } from "@/lib/analytics-fns";

export const Route = createFileRoute("/_authed/analytics")({
  ssr: false,
  validateSearch: (search) => ({
    client: typeof search.client === "string" && search.client ? search.client : undefined,
  }),
  loaderDeps: ({ search }) => ({ clientId: search.client }),
  loader: ({ deps }) => getAnalyticsPage({ data: { clientId: deps.clientId } }),
  head: () => ({ meta: [{ title: "Analytics · Agency Admin" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { apiKeyConfigured, clients, selected } = Route.useLoaderData();
  const { client } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();

  const select = (clientId) =>
    navigate({ to: "/analytics", search: clientId ? { client: clientId } : {} });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        subtitle="Views, subscribers and watch time"
        action={<AnalyticsToolbar clients={clients} value={client || ""} onChange={select} />}
      />

      {!apiKeyConfigured && <ApiKeyCard onSaved={() => router.invalidate()} />}

      {selected ? (
        <ClientAnalytics selected={selected} apiKeyConfigured={apiKeyConfigured} />
      ) : (
        <AllClientsAnalytics clients={clients} onSelect={select} />
      )}
    </div>
  );
}