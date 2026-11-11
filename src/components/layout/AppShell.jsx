import { useEffect, useState } from "react";
import { Outlet } from "@tanstack/react-router";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import GlassBackdrop from "./GlassBackdrop";

const STORAGE_KEY = "agency-admin:sidebar";

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "collapsed");
  }, []);

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
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}