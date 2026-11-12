import SectionCard from "@/components/clients/detail/SectionCard";
import { Image } from "@/components/ui/image";
import { formatCompact, formatDate } from "@/lib/clients";

export default function TopVideosList({ videos, syncedAt }) {
  return (
    <SectionCard
      title="Top videos"
      delay={120}
      action={syncedAt ? <span className="text-[12.5px] text-muted-foreground">{formatDate(syncedAt)}</span> : null}
    >
      {videos.length === 0 ? (
        <p className="text-[14.5px] leading-relaxed text-muted-foreground">
          Most-viewed videos from this channel's recent uploads appear here after a sync.
        </p>
      ) : (
        <ol className="space-y-1">
          {videos.map((video, index) => (
            <li key={video.id || video.title}>
              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-accent"
              >
                <span className="w-4 shrink-0 text-[12px] tabular-nums text-muted-foreground">{index + 1}</span>
                <span className="h-9 w-16 shrink-0 overflow-hidden rounded-md" style={{ background: "var(--nav-hover)" }}>
                  {video.thumbnail && <Image src={video.thumbnail} alt="" className="h-full w-full" fittingType="fill" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium leading-snug">{video.title}</span>
                  <span className="block text-[11.5px] tabular-nums text-muted-foreground">
                    {formatCompact(video.views)} views
                    {video.publishedAt ? ` · ${formatDate(video.publishedAt)}` : ""}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}