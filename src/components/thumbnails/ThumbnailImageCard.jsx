import { RotateCcw } from "lucide-react";
import { Image } from "@/components/ui/image";
import AiUnavailable from "@/components/ai/AiUnavailable";
import GenerationSkeleton from "./GenerationSkeleton";
import ThumbnailImageActions from "./ThumbnailImageActions";
import VariationStrip from "./VariationStrip";

const HIGGSFIELD_HELP =
  "Add your Higgsfield API key (HIGGSFIELD_API_KEY) and secret (HIGGSFIELD_API_SECRET) in the app's Secrets settings, then reload this page. Create them in the Higgsfield console under API keys — the key is shown once, so paste it straight in.";

export default function ThumbnailImageCard({
  message,
  variants,
  busyKind,
  configured,
  onRegenerate,
  onVariations,
  onOverlay,
  onRate,
}) {
  if (!message.imageUrl) {
    if (!configured) return <AiUnavailable instructions={HIGGSFIELD_HELP} />;
    if (message.failed) {
      return (
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-2.5"
          style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
        >
          <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-muted-foreground">
            {message.failed}
          </p>
          <button
            type="button"
            onClick={() => onRegenerate(message.id)}
            className="inline-flex h-7 items-center gap-1.5 rounded-[8px] px-2 text-[12.5px] font-medium text-foreground"
            style={{ background: "var(--nav-active)" }}
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.9} />
            Try again
          </button>
        </div>
      );
    }
    return <GenerationSkeleton />;
  }

  return (
    <div className="space-y-1.5">
      <div
        className="overflow-hidden rounded-[14px]"
        style={{ border: "0.5px solid var(--glass-border)" }}
      >
        <Image
          src={message.imageUrl}
          alt="Generated thumbnail"
          fittingType="fill"
          className="aspect-video w-full object-cover"
        />
      </div>
      <ThumbnailImageActions
        message={message}
        busyKind={busyKind}
        onRegenerate={onRegenerate}
        onVariations={onVariations}
        onOverlay={onOverlay}
        onRate={onRate}
      />
      <VariationStrip variants={variants} onRate={onRate} />
    </div>
  );
}