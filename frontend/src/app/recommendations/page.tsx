import Link from "next/link";
import { BarChart3, BrainCircuit, CheckCircle2, Clock3 } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RecommendationCard } from "@/components/cards/recommendation-card";
import { KpiStatCard } from "@/components/cards/kpi-stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { CampaignFunnelChart } from "@/components/charts/campaign-funnel-chart";
import { ChannelPerformanceChart } from "@/components/charts/channel-performance-chart";
import { Button } from "@/components/ui/button";
import { getAnalyticsSummary, getRecommendations } from "@/services/mock-api";

export default async function RecommendationsPage() {
  const [recommendations, analytics] = await Promise.all([getRecommendations(), getAnalyticsSummary()]);
  const top = recommendations.recommendations[0];

  return (
    <DashboardShell activePath="/recommendations">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-muted">AI Recommendations</p>
            <h1 className="mt-1 text-[22px] font-semibold leading-7 text-foreground">Ranked campaign actions for Kanpur Nagar wheat growers</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Recommendations are scored using crop stage, language, device mix, weather risk, receptivity, field coverage, and retailer stock guardrails.
            </p>
          </div>
          <Button asChild>
            <Link href={`/content-studio?plan_id=${recommendations.plan_id}&recommendation_id=${top.recommendation_id}`}>Generate Content</Link>
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <KpiStatCard label="Priority Score" value={`${top.priority_score}`} trend="Launch-ready" icon={BrainCircuit} tone="ai" />
          <KpiStatCard label="Target Growers" value={top.target_count.toLocaleString()} trend="Hindi smartphone segment" icon={CheckCircle2} tone="field" />
          <KpiStatCard label="Expected Leads" value={analytics.kpis.expected_leads.toString()} trend="Click proxy" icon={BarChart3} tone="success" />
          <KpiStatCard label="Send Window" value="7-10 AM" trend="Before field visits" icon={Clock3} tone="warning" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <DashboardCard>
            <SectionHeader icon={BrainCircuit} title="Recommendation Queue" description="Explainable actions with channel strategy, guardrails, and field ownership." />
            <div className="mt-5 space-y-4">
              {recommendations.recommendations.map((recommendation) => (
                <RecommendationCard key={recommendation.recommendation_id} recommendation={recommendation} />
              ))}
            </div>
          </DashboardCard>

          <div className="grid gap-5">
            <DashboardCard>
              <SectionHeader icon={BarChart3} title="Campaign Funnel" description="Expected lift against generic campaign baseline." />
              <div className="mt-5 h-[260px]">
                <CampaignFunnelChart data={analytics.charts.weekly_funnel} />
              </div>
            </DashboardCard>
            <DashboardCard>
              <SectionHeader icon={CheckCircle2} title="Channel Mix" description="Recommended delivery split for selected segment." />
              <div className="mt-5 h-[220px]">
                <ChannelPerformanceChart data={analytics.charts.channel_mix} />
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

