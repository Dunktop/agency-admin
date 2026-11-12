import { createFileRoute } from "@tanstack/react-router";
import ThumbnailWorkspace from "@/components/thumbnails/ThumbnailWorkspace";

export const Route = createFileRoute("/_authed/thumbnails")({
  ssr: false,
  head: () => ({ meta: [{ title: "Thumbnails · Agency Admin" }] }),
  component: ThumbnailsPage,
});

function ThumbnailsPage() {
  return <ThumbnailWorkspace />;
}