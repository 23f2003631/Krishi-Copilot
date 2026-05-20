import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function IntelligenceCard({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={cn(
        "enterprise-intelligence-surface relative overflow-hidden rounded-[18px] border border-[#0D7A43]/15 p-5 shadow-[0_18px_44px_rgba(9,18,13,0.075),inset_0_1px_0_rgba(255,255,255,0.88)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[#0D7A43]/25 hover:shadow-[0_22px_54px_rgba(9,18,13,0.095),inset_0_1px_0_rgba(255,255,255,0.9)]",
        className
      )}
      {...props}
    />
  );
}
