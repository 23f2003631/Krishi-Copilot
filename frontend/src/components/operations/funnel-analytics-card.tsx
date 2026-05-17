import { BarChart3 } from "lucide-react";
import { CampaignFunnelChart } from "@/components/charts/campaign-funnel-chart";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";

export function FunnelAnalyticsCard({ data }: { data: { week: string; baseline: number; recommended: number }[] }) {
  return (
    <DashboardCard>
      <SectionHeader icon={BarChart3} title="Grower Response Lift" description="Crop-stage activation compared with broad campaign baseline." />
      <div className="mt-4 h-[210px]">
        <CampaignFunnelChart data={data} />
      </div>
    </DashboardCard>
  );
}
