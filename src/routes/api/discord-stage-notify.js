import { createFileRoute } from "@tanstack/react-router";
import { requireUserRoute } from "@/lib/auth-middleware";
import { readIntegrationFields } from "@/lib/integration-store.server";
import { DiscordError, sendChannelMessage } from "@/lib/discord.server";
import { STAGE_BY_KEY } from "@/lib/clients";

// Called only by the "Discord stage notifications" workflow when a client's
// production stage becomes In review or Published.
export const Route = createFileRoute("/api/discord-stage-notify")({
  server: {
    middleware: [requireUserRoute],
    handlers: {
      POST: async ({ request, context }) => {
        if (context.user?.role !== "admin") {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json().catch(() => ({}));
        const progressId = String(body.progress_id || "").trim();
        if (!progressId) return Response.json({ skipped: "No production record id" });

        const base44 = context.getBase44();
        const service = base44.asServiceRole;

        const fields = await readIntegrationFields(base44, "discord");
        if (!fields.botToken || !fields.teamChannelId) {
          return Response.json({ skipped: "Discord bot token or team channel ID is missing" });
        }

        const progress = await service.entities.ClientProgress.get(progressId).catch((error) => {
          if (error?.status === 404) return null;
          throw error;
        });
        if (!progress?.client) return Response.json({ skipped: "Production record not found" });

        const client = await service.entities.Client.get(progress.client).catch((error) => {
          if (error?.status === 404) return null;
          throw error;
        });
        if (!client?.name) return Response.json({ skipped: "Client not found" });

        const label = STAGE_BY_KEY[progress.stage]?.label || progress.stage;
        const content = `**${client.name}** moved to **${label}**.`;

        try {
          const message = await sendChannelMessage(fields.botToken, fields.teamChannelId, content);
          return Response.json({ sent: true, message_id: message.id });
        } catch (error) {
          if (error instanceof DiscordError) {
            return Response.json({ sent: false, error: error.message }, { status: 502 });
          }
          throw error;
        }
      },
    },
  },
});