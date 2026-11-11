import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import ComingSoon from "@/components/layout/ComingSoon";

export const Route = createFileRoute("/_authed/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding · Agency Admin" }] }),
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Onboarding" subtitle="New client setup" />
      <ComingSoon description="A guided setup for each new client lands here next." />
    </div>
  );
}