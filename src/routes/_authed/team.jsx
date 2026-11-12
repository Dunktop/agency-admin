import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import GlassStat from "@/components/layout/GlassStat";
import CapacityCard from "@/components/team/CapacityCard";
import TeamLane from "@/components/team/TeamLane";
import { formatMoney } from "@/lib/clients";
import { getTeamAllocation } from "@/lib/team-fns";

export const Route = createFileRoute("/_authed/team")({
  ssr: false,
  loader: () => getTeamAllocation(),
  head: () => ({ meta: [{ title: "Team · Agency Admin" }] }),
  component: TeamPage,
});

function TeamPage() {
  const { lanes, capacity, totalCost, memberCount } = Route.useLoaderData();

  return (
    <div className="space-y-5">
      <PageHeader title="Team" subtitle="Who is on which account, and how loaded they are" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <GlassStat label="Team cost / month" value={formatMoney(totalCost)} hint="Across every client" delay={0} />
        <GlassStat label="People on accounts" value={String(memberCount)} hint="Assignments, not headcount" delay={60} />
        <GlassStat label="Clients covered" value={String(lanes.length)} hint="One lane per client" delay={120} />
      </div>

      <CapacityCard capacity={capacity} delay={80} />

      {lanes.length === 0 ? (
        <p className="glass animate-rise rounded-2xl px-5 py-6 text-[14.5px] leading-relaxed text-muted-foreground">
          Add a client first, then assign the people producing for them.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {lanes.map((lane, index) => (
            <TeamLane key={lane.id} lane={lane} delay={140 + index * 40} />
          ))}
        </div>
      )}
    </div>
  );
}