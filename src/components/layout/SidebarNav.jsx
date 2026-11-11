import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import NAV_ITEMS from "./nav-items";

export default function SidebarNav({ collapsed = false, onNavigate }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            data-active={active}
            aria-current={active ? "page" : undefined}
            className={cn(
              "nav-item group flex items-center gap-3 rounded-[10px] px-3 py-[9px] text-[15px] font-medium",
              collapsed && "justify-center px-0"
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
            {!collapsed && <span className="truncate">{label}</span>}
            {active && !collapsed && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: "#0A84FF" }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}