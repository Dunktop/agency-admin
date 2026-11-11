import { PanelLeftClose, PanelLeftOpen, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function TopBar({ collapsed, onToggleSidebar, onOpenMobile }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar sticky top-0 z-30 flex h-12 shrink-0 items-center gap-1 px-2 md:px-4">
      <button type="button" onClick={onOpenMobile} className="icon-btn md:hidden" aria-label="Open menu">
        <Menu className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={onToggleSidebar}
        className="icon-btn hidden md:inline-flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-[17px] w-[17px]" strokeWidth={1.75} />
        ) : (
          <PanelLeftClose className="h-[17px] w-[17px]" strokeWidth={1.75} />
        )}
      </button>

      <div className="ml-1 hidden text-[13px] text-muted-foreground sm:block">Internal workspace</div>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <span className="mx-1 hidden h-4 w-px sm:block" style={{ background: "var(--hairline)" }} />
        <span className="hidden max-w-[160px] truncate text-[13px] text-muted-foreground sm:block">
          {user?.full_name || user?.email || ""}
        </span>
        <button type="button" onClick={() => logout()} className="icon-btn" aria-label="Sign out" title="Sign out">
          <LogOut className="h-[17px] w-[17px]" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}