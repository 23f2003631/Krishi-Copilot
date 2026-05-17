import {
  BarChart3,
  BrainCircuit,
  ClipboardList,
  FileText,
  Map,
  Settings,
  Sprout,
  Store,
  UsersRound,
  WandSparkles
} from "lucide-react";

export const navigationItems = [
  { label: "Campaign Windows", href: "/planner", icon: Sprout },
  { label: "Agronomic AI", href: "/recommendations", icon: BrainCircuit },
  { label: "Advisory Studio", href: "/content-studio", icon: WandSparkles },
  { label: "Grower Cohorts", href: "#grower-segments", icon: UsersRound },
  { label: "Field Execution", href: "/field-actions", icon: ClipboardList },
  { label: "Retailer Coverage", href: "#retailer-alerts", icon: Store },
  { label: "Campaign Signals", href: "#analytics", icon: BarChart3 },
  { label: "Control Settings", href: "#settings", icon: Settings }
];

export const quickActions = [
  { label: "Demo route", href: "#demo-script", icon: FileText },
  { label: "Signal API contract", href: "#api", icon: Map }
];
