import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function TableWrapper({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "enterprise-inset soft-scrollbar overflow-x-auto rounded-[18px]",
        className
      )}
      {...props}
    />
  );
}
