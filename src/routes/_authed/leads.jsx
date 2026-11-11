import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import ComingSoon from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/_authed/leads")({
  head: () => ({ meta: [{ title: "Leads · Agency Admin" }] }),
  component: LeadsPage,
});

function LeadsPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Leads" subtitle="Pipeline and outreach" />
      <ComingSoon description="Prospect tracking, deal values and outreach stages land here next." />
    </div>
  );
}