import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function DashboardCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("control-card rounded-[22px] border border-border/90 bg-card p-4 sm:p-5", className)} {...props} />;
}
