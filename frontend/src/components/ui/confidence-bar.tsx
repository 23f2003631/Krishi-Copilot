"use client";

import { cn } from "@/lib/utils";

interface ConfidenceBarProps {
  value: number; // 0.0 - 1.0
  label?: string;
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
}

export function ConfidenceBar({ value, label, size = "md", showValue = true, className }: ConfidenceBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  
  const barHeight = size === "sm" ? "h-1.5" : "h-2.5";
  
  // Dynamic gradient: low=amber, mid=blue, high=emerald
  const getGradient = () => {
    if (pct >= 80) return "from-emerald-400 to-emerald-500";
    if (pct >= 60) return "from-blue-400 to-blue-500";
    if (pct >= 40) return "from-amber-400 to-amber-500";
    return "from-rose-400 to-rose-500";
  };
  
  const getTextColor = () => {
    if (pct >= 80) return "text-emerald-700";
    if (pct >= 60) return "text-blue-700";
    if (pct >= 40) return "text-amber-700";
    return "text-rose-700";
  };

  return (
    <div className={cn("space-y-1", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-[10px] font-medium text-muted uppercase tracking-wide">{label}</span>}
          {showValue && <span className={cn("text-xs font-bold tabular-nums", getTextColor())}>{pct}%</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-gray-100 overflow-hidden", barHeight)}>
        <div 
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", getGradient())}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
