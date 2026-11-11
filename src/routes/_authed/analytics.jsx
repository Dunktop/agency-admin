import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import ComingSoon from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/_authed/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Agency Admin" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Analytics" subtitle="Views, subscribers and watch time" />
      <ComingSoon description="Channel performance snapshots and top videos land here next." />
    </div>
  );
}