import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import ComingSoon from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/_authed/calendar")({
  head: () => ({ meta: [{ title: "Calendar · Agency Admin" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Calendar" subtitle="Filming days, edits and publish dates" />
      <ComingSoon description="A production calendar across every client lands here next." />
    </div>
  );
}