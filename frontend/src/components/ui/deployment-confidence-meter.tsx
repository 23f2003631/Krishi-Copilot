"use client";

import { cn } from "@/lib/utils";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { BrainCircuit } from "lucide-react";

interface DeploymentConfidenceMeterProps {
  confidence: number;
  urgency: "high" | "medium" | "low";
  blocked?: boolean;
  className?: string;
}

export function DeploymentConfidenceMeter({ confidence, urgency, blocked, className }: DeploymentConfidenceMeterProps) {
  const getUrgencyLabel = () => {
    if (blocked) return "Blocked";
    switch (urgency) {
      case "high": return "Urgent";
      case "medium": return "Moderate";
      case "low": return "Low Priority";
    }
  };

  const getCardStyle = () => {
    if (blocked) return "border-rose-200 bg-rose-50/50 shadow-[0_0_0_1px_rgba(244,63,94,0.08),0_8px_24px_rgba(244,63,94,0.06)]";
    if (urgency === "high") return "border-[#B7D8C3] bg-[#DDEADF]/45 shadow-[0_0_0_1px_rgba(29,155,98,0.08),0_8px_24px_rgba(29,155,98,0.06)]";
    if (urgency === "medium") return "border-amber-200 bg-amber-50/30 shadow-[0_8px_24px_rgba(245,158,11,0.05)]";
    return "border-border bg-card-soft";
  };
  
  const getUrgencyDot = () => {
    if (blocked) return "bg-rose-500";
    if (urgency === "high") return "bg-[#1F9D62] animate-pulse";
    if (urgency === "medium") return "bg-amber-500";
    return "bg-gray-400";
  };

  return (
    <div className={cn("rounded-[18px] border p-3 transition-all duration-300", getCardStyle(), className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-3.5 w-3.5 text-muted" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Deployment Confidence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", getUrgencyDot())} />
          <span className="text-[10px] font-semibold text-foreground">{getUrgencyLabel()}</span>
        </div>
      </div>
      <ConfidenceBar value={confidence} size="md" showValue={true} />
    </div>
  );
}
