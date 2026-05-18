import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function DashboardCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("control-card rounded-card border border-border bg-card p-4 sm:p-5 shadow-level-2 transition-shadow hover:shadow-level-3", className)} {...props} />;
}
