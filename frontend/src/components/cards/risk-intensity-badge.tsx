import type { RiskLevel } from "@/types/contracts";
import { cn } from "@/lib/utils";

const styles = {
  low: "border-success/20 bg-success/10 text-success",
  medium: "border-[#d8ad4d]/30 bg-[#d8ad4d]/12 text-[#9a6a14]",
  high: "border-danger/20 bg-danger/10 text-danger"
};

export function RiskIntensityBadge({ level, label }: { level: RiskLevel; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none", styles[level])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? `${level} intensity`}
    </span>
  );
}
