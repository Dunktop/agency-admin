import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import IntegrationsPanel from "@/components/integrations/IntegrationsPanel";
import SecurityPanel from "@/components/settings/SecurityPanel";
import TeamAccessPanel from "@/components/settings/TeamAccessPanel";
import KnowledgeTrainer from "@/components/settings/KnowledgeTrainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSecurityState } from "@/lib/security-fns";
import { getTeamAccess } from "@/lib/team-access-fns";

export const Route = createFileRoute("/_authed/settings")({
  ssr: false,
  loader: async () => {
    const [team, security] = await Promise.all([getTeamAccess(), getSecurityState()]);
    return { team, security };
  },
  head: () => ({ meta: [{ title: "Settings · Agency Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { team, security } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Integrations, team access, security and AI training" />

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList className="glass h-9 w-full justify-start gap-1 overflow-x-auto rounded-[10px] p-1">
          <TabsTrigger value="integrations" className="shrink-0 rounded-[7px] px-3 text-[13px]">
            Integrations
          </TabsTrigger>
          <TabsTrigger value="team" className="shrink-0 rounded-[7px] px-3 text-[13px]">
            Team access
          </TabsTrigger>
          <TabsTrigger value="security" className="shrink-0 rounded-[7px] px-3 text-[13px]">
            Security
          </TabsTrigger>
          <TabsTrigger value="training" className="shrink-0 rounded-[7px] px-3 text-[13px]">
            AI training
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="mt-0">
          <IntegrationsPanel />
        </TabsContent>

        <TabsContent value="team" className="mt-0">
          <TeamAccessPanel data={team} />
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <SecurityPanel data={security} />
        </TabsContent>

        <TabsContent value="training" className="mt-0 space-y-3">
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">
            Paste principles, examples, references and explanations. Every exchange is saved and read before each AI
            call, so the more you train, the sharper every thumbnail and idea gets.
          </p>

          <Tabs defaultValue="thumbnail" className="space-y-3">
            <TabsList className="glass h-9 rounded-[10px]">
              <TabsTrigger value="thumbnail" className="rounded-[7px] px-3 text-[13px]">
                Thumbnails
              </TabsTrigger>
              <TabsTrigger value="video" className="rounded-[7px] px-3 text-[13px]">
                Video &amp; Ideation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="thumbnail" className="mt-0">
              <KnowledgeTrainer
                scope="THUMBNAIL_GLOBAL"
                trackName="Thumbnail Training"
                title="Thumbnail Training"
                blurb="Teaches every thumbnail prompt: composition, colour, text and emotional triggers."
                placeholder="Paste thumbnail principles, references, teardowns or corrections…"
                emptyHint="Nothing taught yet. Paste examples, principles or references and the AI will restate the rules it learned."
              />
            </TabsContent>

            <TabsContent value="video" className="mt-0">
              <KnowledgeTrainer
                scope="VIDEO_GLOBAL"
                trackName="Video & Ideation Training"
                title="Video & Ideation Training"
                blurb="Teaches every ideation call: titles, hooks, angles, structure and packaging."
                placeholder="Paste ideation principles, title formulas, hooks or strategy notes…"
                emptyHint="Nothing taught yet. Paste principles or examples and the AI will restate the rules it learned."
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}