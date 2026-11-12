import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { BRAND_PALETTE } from "@/lib/brand-assets";

export default function BrandPalette() {
  const [copied, setCopied] = useState("");

  async function copy(hex) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      setTimeout(() => setCopied(""), 1400);
    } catch {
      setCopied("");
    }
  }

  return (
    <section className="glass animate-rise rounded-2xl p-5">
      <h2 className="text-[17px] font-semibold tracking-[-0.01em]">Colour</h2>
      <p className="mt-1 text-[13px] text-muted-foreground">Tap a swatch to copy the hex.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {BRAND_PALETTE.map((swatch) => (
          <button
            key={swatch.hex}
            type="button"
            onClick={() => copy(swatch.hex)}
            className="group rounded-[10px] text-left transition-transform active:scale-[0.99]"
          >
            <div
              className="flex h-16 items-end justify-end rounded-[10px] p-2"
              style={{ background: swatch.hex, border: "0.5px solid var(--glass-border)" }}
            >
              <span className="rounded-[6px] bg-black/25 p-1 text-white/90">
                {copied === swatch.hex ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </span>
            </div>
            <p className="mt-2 text-[13px] font-medium">{swatch.name}</p>
            <p className="font-mono text-[11.5px] uppercase text-muted-foreground">{swatch.hex}</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{swatch.role}</p>
          </button>
        ))}
      </div>
    </section>
  );
}