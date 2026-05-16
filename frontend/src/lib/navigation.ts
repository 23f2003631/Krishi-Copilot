import {
  BarChart3,
  BrainCircuit,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  Store,
  UsersRound,
  WandSparkles
} from "lucide-react";

export const navigationItems = [
  { label: "Campaign Planner", href: "/planner", icon: LayoutDashboard },
  { label: "AI Recommendations", href: "/recommendations", icon: BrainCircuit },
  { label: "Content Studio", href: "/content-studio", icon: WandSparkles },
  { label: "Grower Segments", href: "#grower-segments", icon: UsersRound },
  { label: "Field Actions", href: "/field-actions", icon: ClipboardList },
  { label: "Retailer Alerts", href: "#retailer-alerts", icon: Store },
  { label: "Analytics", href: "#analytics", icon: BarChart3 },
  { label: "Settings", href: "#settings", icon: Settings }
];

export const quickActions = [
  { label: "Demo script", href: "#demo-script", icon: FileText },
  { label: "Model-ready API", href: "#api", icon: BrainCircuit }
];

