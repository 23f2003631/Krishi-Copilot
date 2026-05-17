import { UsersRound } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Badge } from "@/components/ui/badge";

const segments = [
  { label: "Hindi smartphone wheat cohort", growers: "860", lift: "+3.0pp inquiry", tone: "success" },
  { label: "Keypad wheat voice fallback", growers: "212", lift: "+1.0pp response", tone: "warning" },
  { label: "Non-opener village follow-up", growers: "184", lift: "Rep-owned", tone: "default" }
] as const;

export function SegmentOpportunityCard() {
  return (
    <DashboardCard>
      <SectionHeader icon={UsersRound} title="Grower Cohort Opportunity" description="Audience cohorts translated into channel and field decisions." />
      <div className="mt-4 space-y-3">
        {segments.map((segment) => (
          <div key={segment.label} className="rounded-[18px] border border-border bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{segment.label}</p>
              <Badge variant={segment.tone}>{segment.lift}</Badge>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted">
              <span>Growers in cohort</span>
              <span className="font-semibold text-foreground">{segment.growers}</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
