import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function ChartContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("h-[300px] w-full", className)} {...props} />;
}

