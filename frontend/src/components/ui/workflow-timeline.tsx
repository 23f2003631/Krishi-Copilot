import { cn } from "@/lib/utils";
import { Check, Circle, Clock } from "lucide-react";

export interface TimelineStep {
  label: string;
  status: "completed" | "current" | "upcoming";
  timestamp?: string;
}

interface WorkflowTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function WorkflowTimeline({ steps, className }: WorkflowTimelineProps) {
  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            {step.status === "completed" ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-3.5 w-3.5" />
              </div>
            ) : step.status === "current" ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 ring-4 ring-blue-50">
                <Circle className="h-2 w-2 fill-current" />
              </div>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Clock className="h-3.5 w-3.5" />
              </div>
            )}
            {index < steps.length - 1 && (
              <div className={cn("w-px h-full min-h-[24px] mt-2", step.status === "completed" ? "bg-emerald-200" : "bg-gray-200")} />
            )}
          </div>
          <div className="flex flex-col pb-4 pt-0.5">
            <span className={cn("text-sm font-medium", 
              step.status === "completed" ? "text-foreground" : 
              step.status === "current" ? "text-blue-900" : "text-muted"
            )}>
              {step.label}
            </span>
            {step.timestamp && (
              <span className="text-xs text-muted mt-0.5">{step.timestamp}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
