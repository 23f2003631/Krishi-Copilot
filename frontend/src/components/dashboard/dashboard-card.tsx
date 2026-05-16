import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function DashboardCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("rounded-[24px] border border-border bg-card p-5 card-shadow", className)} {...props} />;
}

