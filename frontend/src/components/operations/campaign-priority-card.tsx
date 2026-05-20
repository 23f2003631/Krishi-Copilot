import { Sprout } from "lucide-react";
import type { Scenario } from "@/types/contracts";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";

const priorities = [
  { label: "Pre-Sowing Awareness", value: 42 },
  { label: "Yield Protection Expo", value: 78 },
  { label: "Post-Harvest Support", value: 15 },
];

export function CampaignPriorityCard({ scenarios }: { scenarios: Scenario[] }) {
  const activeScenario = scenarios[0];

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
      </div>
    </DashboardCard>
  );
}
