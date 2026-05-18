import { cn } from "@/lib/utils";
import { BrainCircuit, CloudLightning, PackageOpen, Target, AlertTriangle } from "lucide-react";

export type ExplainabilityType = "engagement" | "weather" | "visit" | "stock" | "confidence";

interface ExplainabilityBadgeProps {
  type: ExplainabilityType;
  value: string;
  className?: string;
}

export function ExplainabilityBadge({ type, value, className }: ExplainabilityBadgeProps) {
  const config = {
    engagement: { 
      icon: Target, 
      style: "bg-indigo-50 text-indigo-700 border-indigo-100", 
      prefix: "Engagement" 
    },
    weather: { 
      icon: CloudLightning, 
      style: "bg-sky-50 text-sky-700 border-sky-100", 
      prefix: "Trigger" 
    },
    visit: { 
      icon: Target, 
      style: "bg-violet-50 text-violet-700 border-violet-100", 
      prefix: "Priority" 
    },
    stock: { 
      icon: PackageOpen, 
      style: "bg-orange-50 text-orange-700 border-orange-100", 
      prefix: "Inventory" 
    },
    confidence: {
      icon: BrainCircuit,
      style: "bg-purple-50 text-purple-700 border-purple-100",
      prefix: "AI Confidence"
    }
  };

  const { icon: Icon, style, prefix } = config[type];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border", style, className)}>
      <Icon className="h-3.5 w-3.5" />
      <span><span className="opacity-75">{prefix}:</span> {value}</span>
    </div>
  );
}
