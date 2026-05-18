import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneClasses = {
  ai: "text-deep-emerald bg-primary/20",
  field: "text-secondary-emerald bg-secondary-emerald/10",
  success: "text-secondary-emerald bg-secondary-emerald/10",
  warning: "text-warning bg-warning/10",
  danger: "text-danger bg-danger/10"
};

const barClasses = {
  ai: "bg-primary",
  field: "bg-secondary-emerald",
  success: "bg-secondary-emerald",
  warning: "bg-warning",
  danger: "bg-danger"
};

export function KpiStatCard({
  label,
  value,
  trend,
  icon: Icon,
  tone = "ai",
  metadata,
  sparkline = [44, 58, 49, 70, 62, 82]
}: {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
  metadata?: string;
  sparkline?: number[];
}) {
  return (
    <section className="group rounded-card border border-border bg-card p-5 sm:p-6 shadow-level-2 transition-all hover:-translate-y-0.5 hover:shadow-level-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase leading-tight tracking-wider text-muted-text/80">{label}</p>
          {metadata ? <p className="mt-1 text-xs leading-tight text-muted-text">{metadata}</p> : null}
        </div>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]", toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-bold leading-tight tracking-tight text-foreground">{value}</p>
          <p className="text-xs font-medium mt-1 leading-tight text-muted-text">{trend}</p>
        </div>
        <div className="flex h-8 items-end gap-1">
          {sparkline.map((height, index) => (
            <span
              key={`${label}-${index}`}
              className={cn("w-1.5 rounded-full opacity-20 transition group-hover:opacity-70", barClasses[tone])}
              style={{ height: `${Math.max(8, Math.min(height, 88))}%` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
