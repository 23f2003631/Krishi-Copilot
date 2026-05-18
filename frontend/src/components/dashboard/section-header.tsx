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
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#0B5B34]/10 bg-white/78 text-[#0B5B34] shadow-[0_10px_26px_rgba(9,18,13,0.07),inset_0_1px_0_rgba(255,255,255,0.9)]">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div>
        <h2 className="text-base font-semibold leading-[22px] text-[#07110B]">{title}</h2>
        {description ? <p className="mt-1 text-xs leading-5 text-[#64706B]">{description}</p> : null}
      </div>
    </div>
  );
}
