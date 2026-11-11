import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import MoneyStatCards from "@/components/money/MoneyStatCards";
import MrrBreakdown from "@/components/money/MrrBreakdown";
import PaymentTracker from "@/components/money/PaymentTracker";
import CostBreakdown from "@/components/money/CostBreakdown";
import MrrGrowthChart from "@/components/money/MrrGrowthChart";
import RevenueCostsChart from "@/components/money/RevenueCostsChart";
import CollectionChart from "@/components/money/CollectionChart";
import { getMoneyOverview } from "@/lib/server-fns";

export const Route = createFileRoute("/_authed/money")({
  ssr: false,
  loader: () => getMoneyOverview(),
  head: () => ({ meta: [{ title: "Money · Agency Admin" }] }),
  component: MoneyPage,
});

function MoneyPage() {
  const data = Route.useLoaderData();

  return (
    <div className="space-y-5">
      <PageHeader title="Money" subtitle="Retainers, collection health and margin" />

      <MoneyStatCards totals={data.totals} />

      <div className="grid gap-4 lg:grid-cols-2">
        <MrrBreakdown clients={data.clients} totals={data.totals} />
        <CostBreakdown clients={data.clients} totals={data.totals} />
      </div>

      <PaymentTracker payments={data.payments} />

      <div className="grid gap-4 lg:grid-cols-2">
        <MrrGrowthChart data={data.charts.mrr} />
        <RevenueCostsChart data={data.charts.cash} />
        <CollectionChart segments={data.charts.collection} rate={data.totals.collectionRate} />
      </div>
    </div>
  );
}