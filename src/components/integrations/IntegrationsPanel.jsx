import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { INTEGRATION_CATALOG } from "./integration-catalog";
import IntegrationCard from "./IntegrationCard";
import { useIntegrations } from "./IntegrationsProvider";

export default function IntegrationsPanel() {
  const { loading, canManage, byId, refresh, openGuide } = useIntegrations();
  const [refreshing, setRefreshing] = useState(false);

  const connected = INTEGRATION_CATALOG.filter((entry) => byId[entry.id]?.status === "CONNECTED").length;

  const reload = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
          Keys are stored in this app's private settings and only ever used from the server. Each save is verified
          against the live service, so a green badge means it really works.
        </p>
        <button
          type="button"
          onClick={reload}
          disabled={refreshing}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[9px] px-2.5 text-[12.5px] text-muted-foreground disabled:opacity-50"
          style={{ background: "var(--nav-hover)", border: "0.5px solid var(--glass-border)" }}
        >
          <RefreshCw className={refreshing ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          {connected} of {INTEGRATION_CATALOG.length} connected
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {INTEGRATION_CATALOG.map((entry) => (
            <div key={entry.id} className="glass h-[172px] animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {INTEGRATION_CATALOG.map((entry) => (
            <IntegrationCard
              key={entry.id}
              integration={byId[entry.id] || { id: entry.id, status: "NOT_CONFIGURED", fieldKeys: [], fields: {}, testedAt: null }}
              canManage={canManage}
              onOpenGuide={openGuide}
              onChanged={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}