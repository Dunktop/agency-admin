import { ExternalLink } from "lucide-react";
import { formatCompact, formatDate, formatDuration, stripProtocol } from "@/lib/clients";
import { FormatPill } from "../Badges";
import AiUnavailable from "@/components/ai/AiUnavailable";

function Block({ label, children }) {
  return (
    <div>
      <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed">{children}</p>
    </div>
  );
}

export default function OverviewCard({ client, uploads, aiUnavailable }) {
  return (
    <section className="glass animate-rise rounded-2xl p-5" style={{ animationDelay: "60ms" }}>
      <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Overview</h2>

      <div className="mt-3">
        {client.channelSummary ? (
          <p className="whitespace-pre-line text-[15px] leading-relaxed">{client.channelSummary}</p>
        ) : aiUnavailable ? (
          <AiUnavailable />
        ) : (
          <p className="text-[15px] text-muted-foreground">
            No analysis yet. Use Refresh analysis to profile this channel.
          </p>
        )}
      </div>

      {(client.offers || client.contentStyle || client.growthOpportunities) && (
        <div className="mt-5 grid gap-4 border-t pt-4 sm:grid-cols-2" style={{ borderColor: "var(--hairline)" }}>
          {client.contentStyle && <Block label="Content style">{client.contentStyle}</Block>}
          {client.offers && <Block label="What they sell">{client.offers}</Block>}
          {client.growthOpportunities && (
            <div className="sm:col-span-2">
              <Block label="Growth opportunities">{client.growthOpportunities}</Block>
            </div>
          )}
        </div>
      )}

      {uploads.length > 0 && (
        <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--hairline)" }}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Latest uploads</p>
            <p className="text-[13px] text-muted-foreground">4 min + = long-form</p>
          </div>
          <ul className="mt-2 space-y-2">
            {uploads.slice(0, 6).map((video, index) => (
              <li key={`${video.title}-${index}`} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px]">
                <FormatPill format={video.format} />
                <span className="min-w-0 flex-1 truncate">{video.title}</span>
                <span className="text-[13px] tabular-nums text-muted-foreground">{formatDuration(video.durationSeconds)}</span>
                <span className="text-[13px] tabular-nums text-muted-foreground">{formatCompact(video.views)} views</span>
                <span className="text-[13px] text-muted-foreground">{formatDate(video.publishedAt)}</span>
                {video.url && (
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`Open ${video.title}`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {client.channelUrl && (
        <a
          href={client.channelUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium"
          style={{ color: "#0A84FF" }}
        >
          {stripProtocol(client.channelUrl)}
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
        </a>
      )}

    </section>
  );
}