import { ArrowRight, AlertTriangle } from "lucide-react";
import { catalogById } from "./integration-catalog";
import { useIntegrations } from "./IntegrationsProvider";

export default function IntegrationBanner({ integration, className = "" }) {
  const { loading, byId, openGuide } = useIntegrations();
  const entry = byId[integration];
  const guide = catalogById[integration];

  if (loading || !guide || !entry || entry.status === "CONNECTED") return null;

  return (
    <div className={`glass animate-rise flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl px-3.5 py-2 ${className}`}>
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: "#FF9F0A" }} />
      <p className="text-[12.5px] leading-relaxed text-muted-foreground">
        This feature requires {guide.name} to be configured.
      </p>
      <button
        type="button"
        onClick={() => openGuide(integration)}
        className="inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline"
      >
        Set it up now
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}