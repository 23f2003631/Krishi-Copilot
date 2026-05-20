import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function DashboardCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn(
        "enterprise-surface relative rounded-[16px] p-5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[#0D7A43]/15 hover:shadow-[0_2px_3px_rgba(9,18,13,0.045),0_22px_52px_rgba(9,18,13,0.085),inset_0_1px_0_rgba(255,255,255,0.86)]",
        className
      )}
      {...props}
    />
  );
}
