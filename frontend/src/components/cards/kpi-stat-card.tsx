import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneClasses = {
  ai: "text-ai bg-ai/10",
  field: "text-field bg-field/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  danger: "text-danger bg-danger/10"
};

export function KpiStatCard({
  label,
  value,
  trend,
  icon: Icon,
  tone = "ai"
}: {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <section className="h-[104px] rounded-[18px] border border-border bg-white p-5 card-shadow">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium leading-4 text-muted">{label}</p>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-[26px] font-semibold leading-8 text-foreground">{value}</p>
        <p className="truncate text-right text-[11px] leading-4 text-muted">{trend}</p>
      </div>
    </section>
  );
}

