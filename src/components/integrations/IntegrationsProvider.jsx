import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { dismissFirstLaunch, getIntegrations } from "@/lib/integrations-fns";
import SetupGuideSheet from "./SetupGuideSheet";
import FirstLaunchModal from "./FirstLaunchModal";

const IntegrationsContext = createContext(null);

export const useIntegrations = () =>
  useContext(IntegrationsContext) || {
    loading: true,
    canManage: false,
    integrations: [],
    byId: {},
    dismissed: true,
    openGuide: () => {},
    refresh: () => {},
  };

export default function IntegrationsProvider({ children }) {
  const load = useServerFn(getIntegrations);
  const skip = useServerFn(dismissFirstLaunch);

  const [state, setState] = useState({ loading: true, canManage: false, dismissed: true, integrations: [] });
  const [guideId, setGuideId] = useState(null);
  const [welcomeClosed, setWelcomeClosed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await load();
      setState({ loading: false, canManage: data.canManage, dismissed: data.dismissed, integrations: data.integrations });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [load]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const byId = useMemo(
    () => Object.fromEntries(state.integrations.map((entry) => [entry.id, entry])),
    [state.integrations]
  );

  const anyConnected = state.integrations.some((entry) => entry.status === "CONNECTED");
  const welcomeOpen = state.canManage && !state.dismissed && !welcomeClosed && !anyConnected && !state.loading;

  const dismissWelcome = async () => {
    setWelcomeClosed(true);
    setState((prev) => ({ ...prev, dismissed: true }));
    try {
      await skip();
    } catch {
      // A failed skip just means the welcome shows again next launch.
    }
  };

  const value = {
    ...state,
    byId,
    refresh,
    openGuide: (id) => setGuideId(id),
  };

  return (
    <IntegrationsContext.Provider value={value}>
      {children}

      <SetupGuideSheet
        integration={guideId ? byId[guideId] : null}
        canManage={state.canManage}
        onClose={() => setGuideId(null)}
        onSaved={refresh}
      />

      <FirstLaunchModal
        open={welcomeOpen}
        integrations={state.integrations}
        onSkip={dismissWelcome}
        onGetStarted={() => {
          setWelcomeClosed(true);
          setGuideId("ai");
        }}
      />
    </IntegrationsContext.Provider>
  );
}