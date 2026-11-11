import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import SpotlightPanel from "@/components/dashboard/SpotlightPanel";
import ModuleCard from "@/components/dashboard/ModuleCard";
import { BarsGlyph, LineGlyph } from "@/components/dashboard/PlaceholderGlyphs";

export const Route = createFileRoute("/_authed/")({
  head: () => ({ meta: [{ title: "Dashboard · Agency Admin" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader title="Dashboard" subtitle="Workspace overview" />

      <SpotlightPanel />

      <div className="grid gap-4 md:grid-cols-2">
        <ModuleCard
          title="Money"
          subtitle="Retainers, setup fees & status"
          glyph={<BarsGlyph />}
          note="Nothing recorded yet"
          delay={120}
        />
        <ModuleCard
          title="Clients"
          subtitle="Progress across accounts"
          glyph={<LineGlyph />}
          note="No clients added yet"
          delay={160}
        />
      </div>

      <section className="glass animate-rise rounded-2xl p-5" style={{ animationDelay: "220ms" }}>
        <h3 className="text-[17px] font-semibold tracking-[-0.01em]">Recent activity</h3>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          Activity will appear here once your workspace has its first client.
        </p>
      </section>
    </div>
  );
}