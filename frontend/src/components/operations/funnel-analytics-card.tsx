import { BarChart3 } from "lucide-react";
import { CampaignFunnelChart } from "@/components/charts/campaign-funnel-chart";
import { ChartFrame } from "@/components/charts/chart-frame";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";

export function FunnelAnalyticsCard({ data }: { data: { week: string; baseline: number; recommended: number }[] }) {
  return (
    <DashboardCard>
      <SectionHeader icon={BarChart3} title="Funnel Analytics" description="Crop-stage activation compared with broad campaign baseline." />
      <ChartFrame height="h-[230px]">
        <CampaignFunnelChart data={data} />
      </ChartFrame>
    </DashboardCard>
  );
}
