import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import SidebarNav from "./SidebarNav";

function Brand({ collapsed }) {
  return (
    <div className={cn("flex items-center gap-3 px-3 pb-6 pt-2", collapsed && "justify-center px-0")}>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[13px] font-semibold text-white"
        style={{ background: "linear-gradient(145deg,#0A84FF,#BF5AF2)" }}
      >
        AA
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-[-0.02em]">Agency Admin</p>
          <p className="truncate text-[13px] text-muted-foreground">Content operations</p>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }) {
  return (
    <>
      {/* desktop */}
      <aside
        className={cn(
          "hairline-r sticky top-0 hidden h-screen shrink-0 flex-col bg-background px-3 py-3 transition-[width] duration-300 ease-out md:flex",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <Brand collapsed={collapsed} />
        <SidebarNav collapsed={collapsed} />
      </aside>

      {/* mobile drawer */}
      <div className={cn("fixed inset-0 z-50 md:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}>
        <div
          onClick={onCloseMobile}
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[260px] flex-col bg-background px-3 py-3 transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ borderRight: "0.5px solid var(--hairline)" }}
        >
          <div className="flex items-start justify-between">
            <Brand collapsed={false} />
            <button type="button" onClick={onCloseMobile} className="icon-btn mt-1" aria-label="Close menu">
              <X className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          </div>
          <SidebarNav onNavigate={onCloseMobile} />
        </aside>
      </div>
    </>
  );
}