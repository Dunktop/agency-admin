import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import ComingSoon from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/_authed/thumbnails")({
  head: () => ({ meta: [{ title: "Thumbnails · Agency Admin" }] }),
  component: ThumbnailsPage,
});

function ThumbnailsPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Thumbnails" subtitle="Concepts, iterations and ratings" />
      <ComingSoon description="Thumbnail sessions and design feedback land here next." />
    </div>
  );
}