import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import ComingSoon from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/_authed/team")({
  head: () => ({ meta: [{ title: "Team · Agency Admin" }] }),
  component: TeamPage,
});

function TeamPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Team" subtitle="Editors, managers and monthly cost" />
      <ComingSoon description="The roster assigned to each client, with costs, lands here next." />
    </div>
  );
}