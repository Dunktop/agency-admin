import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import KnowledgeTrainer from "@/components/settings/KnowledgeTrainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authed/settings")({
  ssr: false,
  head: () => ({ meta: [{ title: "Settings · Agency Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Workspace, integrations and AI training" />

      <section className="animate-rise space-y-3">
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-0.01em]">AI Training</h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
            Paste principles, examples, references and explanations. Every exchange is saved and read before each AI call,
            so the more you train, the sharper every thumbnail and idea gets.
          </p>
        </div>

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
      </section>
    </div>
  );
}