import { Download, Layers, Loader2, RefreshCw, Type } from "lucide-react";
import StarRating from "./StarRating";

const ACTION_CLASS =
  "inline-flex h-7 items-center gap-1.5 rounded-[8px] px-2 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-[var(--nav-hover)] hover:text-foreground disabled:opacity-40";

export default function ThumbnailImageActions({
  message,
  busyKind = "",
  onRegenerate,
  onVariations,
  onOverlay,
  onRate,
}) {
  const busy = Boolean(busyKind);
  const downloadHref = `/api/thumbnail-asset?url=${encodeURIComponent(message.imageUrl)}`;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        className={ACTION_CLASS}
        onClick={() => onRegenerate(message.id)}
        disabled={busy}
      >
        {busyKind === "regenerate" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.9} />
        )}
        Regenerate
      </button>

      <button
        type="button"
        className={ACTION_CLASS}
        onClick={() => onVariations(message.id)}
        disabled={busy}
      >
        {busyKind === "variations" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
        ) : (
          <Layers className="h-3.5 w-3.5" strokeWidth={1.9} />
        )}
        Try 3 variations
      </button>

      <a className={ACTION_CLASS} href={downloadHref} download={`thumbnail-${message.id.slice(0, 6)}.jpg`}>
        <Download className="h-3.5 w-3.5" strokeWidth={1.9} />
        Download
      </a>

      <button type="button" className={ACTION_CLASS} onClick={() => onOverlay(message)}>
        <Type className="h-3.5 w-3.5" strokeWidth={1.9} />
        Add text overlay
      </button>

      <div className="ml-auto pl-1">
        <StarRating value={message.rating || 0} onRate={(score) => onRate(message.id, score)} />
      </div>
    </div>
  );
}