import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import ClientStageCard from "@/components/dashboard/ClientStageCard";
import DailyObjectives from "@/components/dashboard/DailyObjectives";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { getDashboard } from "@/lib/dashboard-fns";

export const Route = createFileRoute("/_authed/")({
  ssr: false,
  loader: () => getDashboard(),
  head: () => ({ meta: [{ title: "Dashboard · Agency Admin" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { totals, clients, objectives } = Route.useLoaderData();

  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard" subtitle="Where every account stands today" />

      <DashboardStats totals={totals} />

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-2 px-1">
          <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Production stages</h2>
          <span className="text-[12.5px] text-muted-foreground">
            {clients.length} active {clients.length === 1 ? "client" : "clients"}
          </span>
        </div>

        {clients.length === 0 ? (
          <p className="glass animate-rise rounded-2xl px-5 py-6 text-[14.5px] leading-relaxed text-muted-foreground">
            Add your first client and their production stage shows up here.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((client, index) => (
              <ClientStageCard key={client.id} client={client} delay={80 + index * 40} />
            ))}
          </ul>
        )}
      </section>

      <DailyObjectives objectives={objectives} clients={clients} />
    </div>
  );
}