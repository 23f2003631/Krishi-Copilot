import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ChartFrameProps = HTMLAttributes<HTMLDivElement> & {
  height?: string;
};

export function ChartFrame({ className, height = "h-[240px]", ...props }: ChartFrameProps) {
  return (
    <div
      className={cn(
        "enterprise-inset relative mt-4 overflow-hidden rounded-[16px] p-3",
        height,
        className
      )}
      {...props}
    />
  );
}
