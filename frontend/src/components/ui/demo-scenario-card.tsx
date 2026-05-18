"use client";

import { cn } from "@/lib/utils";
import { useRole } from "@/lib/contexts/RoleContext";
import { Play, ChevronRight } from "lucide-react";

export function DemoScenarioCard({ className }: { className?: string }) {
  const { roleConfig } = useRole();

  const scenarioDetails: Record<string, { context: string; steps: string[] }> = {
    "Campaign Manager": {
      context: "Humidity surge in Kanpur Nagar has triggered a disease-weather activation window for wheat. The AI has generated a fungicide awareness advisory pack ready for your approval.",
      steps: [
        "Review crop-stage activation signal",
        "Inspect AI recommendation confidence & rationale",
        "Navigate to Content Studio to review advisory drafts",
        "Approve campaign for territory deployment",
      ]
    },
    "Territory Manager": {
      context: "A cotton campaign in Maharashtra is blocked due to retailer stock shortages in 2 districts. Weather-triggered pest pressure is rising.",
      steps: [
        "Review blocked campaigns on planner dashboard",
        "Check retailer coverage alerts for stock gaps",
        "Assign field team to resolve stock blockers",
        "Escalate territory to unblock campaign",
      ]
    },
    "Field Representative": {
      context: "You have 5 overdue high-priority grower visits in a pest risk cluster. The AI has updated your talking points for today's fungicide advisory outreach.",
      steps: [
        "Review assigned actions in your work queue",
        "Check updated talking points in Advisory Studio",
        "Execute visits — mark each as complete",
        "Log grower feedback and confirm leads",
      ]
    },
    "Retailer Support": {
      context: "Critical stockout detected for Tilt 250 EC at RTL_0112 in Kanpur Nagar. Campaign deployment will be blocked unless replenishment is dispatched within 48 hours.",
      steps: [
        "Review inventory escalation alert",
        "Check retailer coverage alerts for affected stores",
        "Request replenishment dispatch",
        "Confirm stock received before campaign deadline",
      ]
    }
  };

  const scenario = scenarioDetails[roleConfig.id] || scenarioDetails["Campaign Manager"];

  return (
    <div className={cn("rounded-[22px] border border-border bg-gradient-to-br from-white to-card-soft p-5 shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-olive/10 text-olive">
          <Play className="h-3.5 w-3.5 fill-current" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Demo Scenario</h3>
          <p className="text-[10px] text-muted font-medium">{roleConfig.label}</p>
        </div>
      </div>
      
      <div className="rounded-xl bg-white border border-border p-3 mb-3">
        <p className="text-xs font-semibold text-olive mb-1">"{roleConfig.demoScenario}"</p>
        <p className="text-[11px] leading-4 text-muted">{scenario.context}</p>
      </div>

      <div className="space-y-1.5">
        {scenario.steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-foreground">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive text-[10px] font-bold">{i + 1}</span>
            <span className="font-medium">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
