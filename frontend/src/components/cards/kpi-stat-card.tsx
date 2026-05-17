import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneClasses = {
  ai: "text-ai bg-ai/10",
  field: "text-field bg-field/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  danger: "text-danger bg-danger/10"
};

const barClasses = {
  ai: "bg-ai",
  field: "bg-field",
  success: "bg-success",
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
    <section className="group h-[112px] rounded-[18px] border border-border/90 bg-white p-4 card-shadow transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(31,56,88,0.1)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase leading-4 tracking-normal text-muted">{label}</p>
          {metadata ? <p className="mt-0.5 text-[11px] leading-4 text-muted/80">{metadata}</p> : null}
        </div>
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[26px] font-semibold leading-8 text-foreground">{value}</p>
          <p className="text-[11px] leading-4 text-muted">{trend}</p>
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
