"use client";

import Link from "next/link";
import { BarChart3, BrainCircuit, CheckCircle2, Clock3 } from "lucide-react";
import { RecommendationCard } from "@/components/cards/recommendation-card";
import { KpiStatCard } from "@/components/cards/kpi-stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { CampaignFunnelChart } from "@/components/charts/campaign-funnel-chart";
import { ChannelPerformanceChart } from "@/components/charts/channel-performance-chart";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/contexts/RoleContext";
import { OperationalAlertBanner } from "@/components/ui/operational-alert-banner";

export function RecommendationsClient({ recommendations, analytics }: any) {
  const { role, roleConfig } = useRole();
  const top = recommendations.recommendations[0];

  const renderKpis = () => {
    switch (role) {
      case "Campaign Manager":
        return (
          <>
            <KpiStatCard label="Deployment Score" value={`${top.priority_score}`} trend="launch-ready" metadata="stock gate passed" icon={BrainCircuit} tone="ai" />
            <KpiStatCard label="Target Growers" value={top.target_count.toLocaleString()} trend="Hindi wheat cohort" metadata="Kanpur T023" icon={CheckCircle2} tone="field" />
            <KpiStatCard label="Expected Inquiries" value={analytics.kpis.expected_leads.toString()} trend="response proxy" metadata="+26 over baseline" icon={BarChart3} tone="success" />
            <KpiStatCard label="Advisory Window" value="7-10 AM" trend="before field visits" metadata="Feb 18" icon={Clock3} tone="warning" />
          </>
        );
      case "Territory Manager":
        return (
          <>
            <KpiStatCard label="Regional Priority" value={`${top.priority_score}`} trend="critical action" metadata="stock gate passed" icon={BrainCircuit} tone="ai" />
            <KpiStatCard label="Target Reach" value={top.target_count.toLocaleString()} trend="Kanpur T023" metadata="cohort size" icon={CheckCircle2} tone="field" />
            <KpiStatCard label="Field Capacity" value="92%" trend="ready" metadata="no blockers" icon={BarChart3} tone="success" />
            <KpiStatCard label="Dispatch Window" value="7-10 AM" trend="aligns w/ visits" metadata="Feb 18" icon={Clock3} tone="warning" />
          </>
        );
      case "Field Representative":
        return (
          <>
            <KpiStatCard label="Urgent Priority" value={`${top.priority_score}`} trend="pest risk" metadata="action required" icon={BrainCircuit} tone="warning" />
            <KpiStatCard label="Grower Segment" value={top.target_count.toLocaleString()} trend="in your zone" metadata="Kanpur T023" icon={CheckCircle2} tone="field" />
            <KpiStatCard label="Action Queue" value="6" trend="pending" metadata="high focus" icon={BarChart3} tone="ai" />
            <KpiStatCard label="Visit Time" value="7-10 AM" trend="best conversion" metadata="Feb 18" icon={Clock3} tone="success" />
          </>
        );
      case "Retailer Support":
        return (
          <>
            <KpiStatCard label="Stock Priority" value={`${top.priority_score}`} trend="Tilt 250 EC" metadata="critical alert" icon={BrainCircuit} tone="warning" />
            <KpiStatCard label="Retailer Impact" value="4" trend="in zone" metadata="Kanpur T023" icon={CheckCircle2} tone="field" />
            <KpiStatCard label="Stock Alert" value="Low" trend="replenishment" metadata="needed" icon={BarChart3} tone="ai" />
            <KpiStatCard label="Lead Time" value="48 hrs" trend="before dispatch" metadata="Feb 18" icon={Clock3} tone="success" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <OperationalAlertBanner />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-muted">Agronomic AI</p>
          <h1 className="mt-1 text-[22px] font-semibold leading-7 text-foreground">Ranked crop-stage actions for Kanpur Nagar wheat cohorts</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {role === "Campaign Manager" && "Recommendations are scored using crop stage, grower language, device reach, disease-weather pressure, receptivity, field coverage, and retailer stock gates."}
            {role === "Territory Manager" && "Territory execution priorities based on localized weather, active pest risks, and retailer inventory readiness."}
            {role === "Field Representative" && "Your priority grower outreach list, sorted by agronomic urgency and conversion likelihood."}
            {role === "Retailer Support" && "Upcoming campaign demand forecasts intersecting with real-time retailer inventory stockouts."}
          </p>
        </div>
        {role === "Campaign Manager" && (
          <Button asChild>
            <Link href={`/content-studio?plan_id=${recommendations.plan_id}&recommendation_id=${top.recommendation_id}`}>Draft Advisory Pack</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {renderKpis()}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardCard>
          <SectionHeader icon={BrainCircuit} title="Crop-Stage Recommendation Queue" description="Explainable actions with channel strategy, stock gates, and field ownership." />
          <div className="mt-5 space-y-4">
            {recommendations.recommendations.map((recommendation: any) => (
              <RecommendationCard key={recommendation.recommendation_id} recommendation={recommendation} />
            ))}
          </div>
        </DashboardCard>

        <div className="grid gap-5">
          <DashboardCard>
            <SectionHeader icon={BarChart3} title="Grower Response Funnel" description="Expected lift against broad campaign baseline." />
            <div className="mt-5 h-[260px]">
              <CampaignFunnelChart data={analytics.charts.weekly_funnel} />
            </div>
          </DashboardCard>
          <DashboardCard>
            <SectionHeader icon={CheckCircle2} title="Channel Response Mix" description="Recommended delivery split for the selected grower cohort." />
            <div className="mt-5 h-[220px]">
              <ChannelPerformanceChart data={analytics.charts.channel_mix} />
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
