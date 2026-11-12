import { Download } from "lucide-react";
import { Image } from "@/components/ui/image";
import GenerationSkeleton from "./GenerationSkeleton";
import StarRating from "./StarRating";

export default function VariationStrip({ variants, onRate }) {
  if (variants.length === 0) return null;

  return (
    <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
      {variants.map((variant) => (
        <div
          key={variant.id}
          title={variant.content}
          className="w-[47%] shrink-0 snap-start overflow-hidden rounded-xl sm:w-[31%]"
          style={{ border: "0.5px solid var(--glass-border)" }}
        >
          <div className="relative aspect-video w-full bg-[var(--nav-hover)]">
            {variant.imageUrl ? (
              <Image
                src={variant.imageUrl}
                alt="Thumbnail variation"
                fittingType="fill"
                className="h-full w-full object-cover"
              />
            ) : variant.failed ? (
              <p className="flex h-full items-center justify-center px-2 text-center text-[11.5px] leading-snug text-muted-foreground">
                Render failed
              </p>
            ) : (
              <GenerationSkeleton label="Variation" />
            )}
          </div>
          <div className="flex items-center justify-between gap-1 px-1.5 py-1">
            <StarRating
              value={variant.rating || 0}
              onRate={(score) => onRate(variant.id, score)}
              size={12}
              disabled={!variant.imageUrl}
            />
            {variant.imageUrl && (
              <a
                href={`/api/thumbnail-asset?url=${encodeURIComponent(variant.imageUrl)}`}
                download={`variation-${variant.id.slice(0, 6)}.jpg`}
                className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Download variation"
              >
                <Download className="h-3 w-3" strokeWidth={2} />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}