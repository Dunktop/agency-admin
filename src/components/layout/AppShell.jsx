import { useEffect, useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { applySuperAdminGrant } from "@/lib/security-fns";
import { takeSuperAdminGrant } from "@/lib/superAdminGrant";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import GlassBackdrop from "./GlassBackdrop";
import IntegrationsProvider from "@/components/integrations/IntegrationsProvider";

const STORAGE_KEY = "agency-admin:sidebar";

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const applyGrant = useServerFn(applySuperAdminGrant);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "collapsed");
  }, []);

  // A super admin grant approved on the login screen is applied to the session
  // that just signed in, then the app reloads with the new role.
  useEffect(() => {
    const grantId = takeSuperAdminGrant();
    if (!grantId) return;
    applyGrant({ data: { grantId } })
      .then(() => window.location.reload())
      .catch(() => {});
  }, [applyGrant]);

  const toggleSidebar = () =>
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "collapsed" : "expanded");
      return next;
    });

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <GlassBackdrop />
      <div className="relative flex min-h-screen" style={{ zIndex: 1 }}>
        <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar collapsed={collapsed} onToggleSidebar={toggleSidebar} onOpenMobile={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-7 md:px-10 md:pt-10">
            <IntegrationsProvider>
              <Outlet />
            </IntegrationsProvider>
          </main>
        </div>
      </div>
    </div>
  );
}