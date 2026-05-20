"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

type ParallaxFrameProps = {
  children: ReactNode;
  className?: string;
  depth?: "soft" | "hero";
  disabled?: boolean;
};

export function ParallaxFrame({ children, className, depth = "soft", disabled = false }: ParallaxFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const frame = frameRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!root || !frame || disabled || reduceMotion) {
      return;
    }

    const strength = depth === "hero" ? 1.5 : 0.8;
    const rotateXTo = gsap.quickTo(frame, "rotationX", { duration: 0.8, ease: "power2.out" });
    const rotateYTo = gsap.quickTo(frame, "rotationY", { duration: 0.8, ease: "power2.out" });
    const xTo = gsap.quickTo(frame, "x", { duration: 0.8, ease: "power2.out" });
    const yTo = gsap.quickTo(frame, "y", { duration: 0.8, ease: "power2.out" });
    const scaleTo = gsap.quickTo(frame, "scale", { duration: 0.8, ease: "power2.out" });

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      rotateXTo(y * -16 * strength);
      rotateYTo(x * 20 * strength);
      xTo(x * 24 * strength);
      yTo(y * 16 * strength);
      scaleTo(depth === "hero" ? 1.03 : 1.01);
    };

    const onPointerLeave = () => {
      rotateXTo(0);
      rotateYTo(0);
      xTo(0);
      yTo(0);
      scaleTo(1);
    };

    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);

    return () => {
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [depth, disabled]);

  return (
    <div ref={rootRef} className={cn("perspective-[2000px]", className)}>
      <div ref={frameRef} className="transform-gpu will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}
