import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import ComingSoon from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/_authed/clients")({
  head: () => ({ meta: [{ title: "Clients · Agency Admin" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Clients" subtitle="Accounts, plans and channel health" />
      <ComingSoon description="Client profiles, offers, content strategy and plan types land here next." />
    </div>
  );
}