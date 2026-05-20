import { Sprout } from "lucide-react";
import type { Scenario } from "@/types/contracts";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";

export function CampaignPriorityCard({ scenarios }: { scenarios: Scenario[] }) {
  const activeScenario = scenarios[0];
  const priorities = (scenarios.length ? scenarios : []).slice(0, 3).map((scenario) => {
    const riskScore = scenario.risk_level === "high" ? 88 : scenario.risk_level === "medium" ? 64 : 42;
    const stockAdjustment = scenario.stock_status === "healthy" ? 8 : scenario.stock_status === "watch" ? 0 : -18;
    return {
      label: scenario.name,
      value: Math.max(10, Math.min(100, riskScore + stockAdjustment)),
    };
  });

  return (
    <DashboardCard className="min-h-[300px]">
      <SectionHeader
        icon={Sprout}
        title="Campaign Priority"
        description={activeScenario ? `${activeScenario.name} anchors this week's operating window.` : "Prioritized campaign windows for the territory."}
      />
      <div className="mt-6 space-y-6">
        {priorities.map((priority) => (
          <div key={priority.label}>
            <div className="mb-2 flex items-center justify-between gap-4 text-[14px]">
              <span className="font-medium text-[#243028]">{priority.label}</span>
              <span className="font-semibold text-[#08110C]">{priority.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#D7E1DA]">
              <div className="h-full rounded-full bg-[#0D7A43]" style={{ width: `${priority.value}%` }} />
            </div>
          </div>
        ))}
        {!priorities.length && (
          <div className="rounded-[16px] border border-dashed border-[#0B5B34]/15 p-4 text-[13px] text-[#5D6B62]">
            No live campaign windows returned by the API.
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
