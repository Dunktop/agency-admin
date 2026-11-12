import { createFileRoute } from "@tanstack/react-router";
import IntegrationBanner from "@/components/integrations/IntegrationBanner";
import ThumbnailWorkspace from "@/components/thumbnails/ThumbnailWorkspace";

export const Route = createFileRoute("/_authed/thumbnails")({
  ssr: false,
  head: () => ({ meta: [{ title: "Thumbnails · Agency Admin" }] }),
  component: ThumbnailsPage,
});

function ThumbnailsPage() {
  return (
    <div className="space-y-3">
      <IntegrationBanner integration="higgsfield" />
      <ThumbnailWorkspace />
    </div>
  );
}