import { ArrowUpRight, MapPin, Sprout } from "lucide-react";
import type { Scenario } from "@/types/contracts";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { RiskIntensityBadge } from "@/components/cards/risk-intensity-badge";
import { Badge } from "@/components/ui/badge";

export function CampaignPriorityCard({ scenarios }: { scenarios: Scenario[] }) {
  return (
    <DashboardCard className="min-h-[310px]">
      <SectionHeader icon={Sprout} title="Campaign Window Queue" description="Ranked crop-stage windows where field action is possible now." />
      <div className="mt-4 space-y-3">
        {scenarios.map((scenario, index) => (
          <div key={scenario.scenario_id} className="rounded-[18px] border border-border bg-white px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-olive px-2 py-1 text-[11px] font-semibold text-white">W{index + 1}</span>
                  <RiskIntensityBadge level={scenario.risk_level} />
                  <Badge variant={scenario.stock_status === "healthy" ? "success" : scenario.stock_status === "low" ? "danger" : "warning"}>
                    {scenario.stock_status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{scenario.name}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{scenario.description}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-field" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-muted">
              <MapPin className="h-3.5 w-3.5 text-field" />
              {scenario.geography.district}, {scenario.geography.state} | village priority cluster
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
