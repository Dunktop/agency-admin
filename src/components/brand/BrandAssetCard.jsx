import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function BrandAssetCard({ asset, delay = 0 }) {
  return (
    <article className="glass animate-rise overflow-hidden rounded-2xl" style={{ animationDelay: `${delay}ms` }}>
      <div className="hairline-b flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <h2 className="text-[14.5px] font-semibold tracking-[-0.01em]">{asset.label}</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{asset.spec}</p>
        </div>
        <a
          href={asset.url}
          target="_blank"
          rel="noreferrer"
          className="icon-btn shrink-0"
          aria-label={`Open ${asset.label} full size`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      <div className="bg-black/40 p-4">
        <div className={`${asset.ratio} overflow-hidden rounded-[10px]`}>
          <Image src={asset.url} alt={asset.label} fittingType={asset.fit} className="h-full w-full" />
        </div>
      </div>

      <p className="px-4 py-3 text-[12.5px] leading-relaxed text-muted-foreground">{asset.note}</p>
    </article>
  );
}