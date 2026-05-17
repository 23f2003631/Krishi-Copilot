import { CheckCircle2, CircleDot, Clock3 } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";

const steps = [
  { label: "Crop-stage signal locked", time: "10:00", state: "done" },
  { label: "Grower cohorts ranked", time: "10:01", state: "done" },
  { label: "Agronomy review", time: "Next", state: "active" },
  { label: "Field pack export", time: "Feb 18", state: "pending" }
];

export function OperationalTimeline() {
  return (
    <DashboardCard>
      <SectionHeader icon={Clock3} title="Deployment Readiness Timeline" description="From crop signal detection to territory execution." />
      <div className="mt-4 space-y-3">
        {steps.map((step, index) => {
          const Icon = step.state === "done" ? CheckCircle2 : step.state === "active" ? CircleDot : Clock3;
          return (
            <div key={step.label} className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-field">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 rounded-[16px] border border-border bg-white px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{step.label}</p>
                  <p className="text-[11px] text-muted">{step.time}</p>
                </div>
              </div>
              {index < steps.length - 1 ? null : null}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
