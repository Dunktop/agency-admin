import { createFileRoute } from "@tanstack/react-router";
import IdeationWorkspace from "@/components/ideation/IdeationWorkspace";
import IntegrationBanner from "@/components/integrations/IntegrationBanner";

export const Route = createFileRoute("/_authed/ideation")({
  ssr: false,
  head: () => ({ meta: [{ title: "Ideation · Agency Admin" }] }),
  component: IdeationPage,
});

function IdeationPage() {
  return (
    <div className="space-y-3">
      <IntegrationBanner integration="ai" />
      <IdeationWorkspace />
    </div>
  );
}