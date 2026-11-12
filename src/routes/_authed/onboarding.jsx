import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import AgreementCard from "@/components/onboarding/AgreementCard";
import OnboardingGuide from "@/components/onboarding/OnboardingGuide";

export const Route = createFileRoute("/_authed/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding · Agency Admin" }] }),
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Onboarding" subtitle="From signed agreement to first published video" />
      <AgreementCard />
      <OnboardingGuide />
    </div>
  );
}