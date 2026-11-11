import { createFileRoute } from "@tanstack/react-router";
import IdeationWorkspace from "@/components/ideation/IdeationWorkspace";

export const Route = createFileRoute("/_authed/ideation")({
  ssr: false,
  head: () => ({ meta: [{ title: "Ideation · Agency Admin" }] }),
  component: IdeationPage,
});

function IdeationPage() {
  return <IdeationWorkspace />;
}