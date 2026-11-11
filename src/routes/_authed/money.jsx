import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import ComingSoon from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/_authed/money")({
  head: () => ({ meta: [{ title: "Money · Agency Admin" }] }),
  component: MoneyPage,
});

function MoneyPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Money" subtitle="Retainers, setup fees and payment status" />
      <ComingSoon description="Revenue, upcoming invoices and client payment status land here next." />
    </div>
  );
}