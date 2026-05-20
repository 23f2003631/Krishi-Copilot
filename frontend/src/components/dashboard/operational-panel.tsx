import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function OperationalPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "enterprise-inset relative overflow-hidden rounded-[14px] px-4 py-3",
        className
      )}
      {...props}
    />
  );
}
