import { createFileRoute } from "@tanstack/react-router";
import { requireUserRoute } from "@/lib/auth-middleware";
import { runDiscordStatusSync } from "@/lib/discord-fns";

// Called every ~30 minutes by the "Discord status sync" workflow (and only by
// that workflow): read-only Discord scan, then a stage write per matched client.
export const Route = createFileRoute("/api/discord-status")({
  server: {
    middleware: [requireUserRoute],
    handlers: {
      POST: async ({ context }) => {
        if (context.user?.role !== "admin") {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const result = await runDiscordStatusSync(context.getBase44());
        return Response.json(result);
      },
    },
  },
});