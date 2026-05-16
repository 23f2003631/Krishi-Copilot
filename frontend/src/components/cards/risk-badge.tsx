import type { RiskLevel } from "@/types/contracts";
import { Badge } from "@/components/ui/badge";

export function RiskBadge({ level }: { level: RiskLevel }) {
  const variant = level === "high" ? "danger" : level === "medium" ? "warning" : "success";
  return <Badge variant={variant}>{level.toUpperCase()} RISK</Badge>;
}

