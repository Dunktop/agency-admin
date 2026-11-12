import {
  LayoutDashboard,
  Banknote,
  Users,
  CalendarDays,
  Target,
  Lightbulb,
  Frame,
  BarChart3,
  UserRound,
  Rocket,
  Settings,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/money", label: "Money", icon: Banknote },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/leads", label: "Leads", icon: Target },
  { to: "/ideation", label: "Ideation", icon: Lightbulb },
  { to: "/thumbnails", label: "Thumbnails", icon: Frame },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/team", label: "Team", icon: UserRound },
  { to: "/onboarding", label: "Onboarding", icon: Rocket },
  { to: "/brand", label: "Brand", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default NAV_ITEMS;