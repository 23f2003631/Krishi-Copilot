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
  { label: "Campaign Windows", href: "/planner", icon: Sprout, roles: ["Campaign Manager", "Territory Manager"] },
  { label: "Agronomic AI", href: "/recommendations", icon: BrainCircuit, roles: ["Campaign Manager", "Territory Manager", "Field Representative", "Retailer Support"] },
  { label: "Advisory Studio", href: "/content-studio", icon: WandSparkles, roles: ["Campaign Manager", "Field Representative"] },
  { label: "Grower Cohorts", href: "#grower-segments", icon: UsersRound, roles: ["Campaign Manager", "Territory Manager", "Field Representative"] },
  { label: "Field Execution", href: "/field-actions", icon: ClipboardList, roles: ["Territory Manager", "Field Representative"] },
  { label: "Retailer Coverage", href: "#retailer-alerts", icon: Store, roles: ["Territory Manager", "Retailer Support", "Campaign Manager"] },
  { label: "Campaign Signals", href: "#analytics", icon: BarChart3, roles: ["Campaign Manager", "Territory Manager", "Retailer Support"] },
  { label: "Control Settings", href: "#settings", icon: Settings, roles: ["Campaign Manager"] }
];

export const quickActions = [
  { label: "Demo route", href: "#demo-script", icon: FileText },
  { label: "Signal API contract", href: "#api", icon: Map }
];
