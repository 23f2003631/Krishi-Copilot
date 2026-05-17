import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none", {
  variants: {
    variant: {
      default: "border-olive/15 bg-olive/10 text-olive",
      soft: "border-border bg-card-soft text-muted",
      outline: "border-border bg-white text-foreground",
      success: "border-success/15 bg-success/10 text-success",
      warning: "border-warning/20 bg-warning/10 text-warning",
      danger: "border-danger/15 bg-danger/10 text-danger"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}
