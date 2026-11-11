import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import ComingSoon from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/_authed/ideation")({
  head: () => ({ meta: [{ title: "Ideation · Agency Admin" }] }),
  component: IdeationPage,
});

function IdeationPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Ideation" subtitle="Ideas, hooks and outlines" />
      <ComingSoon description="Idea threads per client, with saved principles, land here next." />
    </div>
  );
}