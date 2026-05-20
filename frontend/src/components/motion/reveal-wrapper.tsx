"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type RevealWrapperProps = HTMLAttributes<HTMLDivElement> & {
  reveal?: "hero" | "section" | "footer" | "none";
};

export function RevealWrapper({ className, reveal = "section", ...props }: RevealWrapperProps) {
  return (
    <div
      className={cn(
        reveal !== "none" && "motion-reveal will-change-transform",
        reveal === "hero" && "hero-reveal",
        reveal === "footer" && "footer-reveal",
        className
      )}
      {...props}
    />
  );
}
