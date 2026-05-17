import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  icon: Icon,
  title,
  description,
  className
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-4", className)}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white text-olive shadow-[0_8px_24px_rgba(31,56,88,0.06)]">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div>
        <h2 className="text-base font-semibold leading-[22px] text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-xs leading-5 text-muted">{description}</p> : null}
      </div>
    </div>
  );
}
