import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/layout/PageHeader";
import BrandAssetCard from "@/components/brand/BrandAssetCard";
import BrandPalette from "@/components/brand/BrandPalette";
import { BRAND_ASSETS, BRAND_NAME } from "@/lib/brand-assets";

export const Route = createFileRoute("/_authed/brand")({
  ssr: false,
  head: () => ({ meta: [{ title: "Brand · Agency Admin" }] }),
  component: BrandPage,
});

function BrandPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Brand" subtitle={`${BRAND_NAME} identity kit — logo, icon, banner, avatar and community welcome`} />

      <BrandPalette />

      <div className="grid gap-3 md:grid-cols-2">
        {BRAND_ASSETS.map((asset, index) => (
          <BrandAssetCard key={asset.id} asset={asset} delay={80 + index * 50} />
        ))}
      </div>
    </div>
  );
}