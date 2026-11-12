import { createFileRoute } from "@tanstack/react-router";

/*
 * Serves a generated thumbnail to the browser with CORS enabled so the overlay
 * canvas can draw it without tainting (and still export a PNG/JPEG).
 * Only URLs that already exist on a stored thumbnail message are served.
 */
export const Route = createFileRoute("/api/thumbnail-asset")({
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        const url = new URL(request.url).searchParams.get("url") || "";
        if (!/^https:\/\//i.test(url)) return new Response("Bad request", { status: 400 });

        const base44 = context.getBase44().asServiceRole;
        const stored = await base44.entities.ThumbnailMessage.filter({ imageUrl: url }, { limit: 1 });
        if (stored.items.length === 0) return new Response("Not found", { status: 404 });

        const upstream = await fetch(url);
        if (!upstream.ok || !upstream.body) return new Response("Upstream error", { status: 502 });

        return new Response(upstream.body, {
          headers: {
            "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});