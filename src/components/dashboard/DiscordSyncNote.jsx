import { MessagesSquare } from "lucide-react";
import { useIntegrations } from "@/components/integrations/IntegrationsProvider";

// The stage cards below are updated by the Discord status agent; say so plainly.
export default function DiscordSyncNote() {
  const { loading, byId } = useIntegrations();
  const discord = byId.discord;

  if (loading || !discord || discord.status !== "CONNECTED") return null;

  return (
    <p className="flex items-center gap-1.5 px-1 text-[12px] text-muted-foreground">
      <MessagesSquare className="h-3.5 w-3.5" />
      Stages sync from your team Discord every ~30 minutes. Read-only — the bot never posts.
    </p>
  );
}