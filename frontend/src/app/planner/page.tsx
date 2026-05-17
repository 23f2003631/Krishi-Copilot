import Link from "next/link";
import { BrainCircuit, CloudRain, Languages, Leaf, MapPin, PackageCheck, ShieldCheck, Smartphone } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AiInsightBanner } from "@/components/insights/ai-insight-banner";
import { AIRecommendationCard } from "@/components/insights/ai-recommendation-card";
import { KpiStatCard } from "@/components/cards/kpi-stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { CampaignPriorityCard } from "@/components/operations/campaign-priority-card";
import { FunnelAnalyticsCard } from "@/components/operations/funnel-analytics-card";
import { OperationalTimeline } from "@/components/operations/operational-timeline";
import { RepExecutionTable } from "@/components/operations/rep-execution-table";
import { RetailerReadinessCard } from "@/components/operations/retailer-readiness-card";
import { SegmentOpportunityCard } from "@/components/operations/segment-opportunity-card";
import { WeatherTriggerPanel } from "@/components/operations/weather-trigger-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAnalyticsSummary, getCampaignContext, getFieldActions, getRecommendations, getScenarios } from "@/services/mock-api";

export default async function PlannerPage() {
  const [scenarios, context, recommendations, fieldActions, analytics] = await Promise.all([
    getScenarios(),
    getCampaignContext(),
    getRecommendations(),
    getFieldActions(),
    getAnalyticsSummary()
  ]);
  const topRecommendation = recommendations.recommendations[0];

  return (
    <DashboardShell activePath="/planner">
      <div className="space-y-4">
        <AiInsightBanner
          title="Crop-stage activation window detected"
          description="Flowering-stage wheat, disease-weather pressure, Hindi grower reach, and 18-day retailer stock cover align for a launch-ready advisory deployment."
          actionLabel="Review field signal"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiStatCard label="Priority Grower Cohorts" value="12" trend="+3 this week" metadata="TER_001 | wheat" icon={Leaf} tone="ai" />
          <KpiStatCard label="Expected Inquiries" value="69" trend="+26 over baseline" metadata="response proxy" icon={Languages} tone="field" />
          <KpiStatCard label="Stock Sufficiency" value="86%" trend="6 retailers ready" metadata="18 days cover" icon={PackageCheck} tone="success" />
          <KpiStatCard label="Disease Weather" value="High" trend="humidity + rain" metadata="76% confidence" icon={CloudRain} tone="warning" />
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <DashboardCard className="xl:col-span-4">
            <SectionHeader
              icon={MapPin}
              title="Territory Activation Context"
              description="The field brief used by the crop-stage recommendation engine."
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <PlannerField label="Crop" value="Wheat" />
              <PlannerField label="Product" value="Tilt 250 EC" />
              <PlannerField label="Region" value="Kanpur Nagar, UP" />
              <PlannerField label="Week" value="Feb 16, 2026" />
              <PlannerField label="Objective" value="Grower inquiry" />
              <PlannerField label="Audience" value="1,180 growers" />
            </div>
            <div className="mt-4 rounded-[18px] border border-border bg-white p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>Deployment gates passed</span>
                <span>4 / 4</span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {["Crop stage", "Stock", "Weather", "Language"].map((gate) => (
                  <div key={gate} className="rounded-[12px] border border-field/20 bg-field/10 px-2 py-2 text-center text-[11px] font-semibold text-[#237143]">
                    {gate}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="soft">Human review required</Badge>
              <Badge variant="soft">Low-bandwidth safe</Badge>
              <Badge variant="soft">Stock gate: 10 days</Badge>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/recommendations?context_id=CTX_001">Rank Campaign Windows</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/field-actions?scenario=blocked-stock">Preview stock gate</Link>
              </Button>
            </div>
          </DashboardCard>

          <div className="xl:col-span-5">
            <DashboardCard className="h-full">
              <SectionHeader icon={BrainCircuit} title="Agronomic Recommendation Feed" description="Explainable next-best action for the selected crop-stage window." />
              <div className="mt-4">
                <AIRecommendationCard recommendation={topRecommendation} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <SignalTile icon={Smartphone} label="WhatsApp reach" value={`${Math.round(context.grower_summary.smartphone_share * 100)}%`} />
                <SignalTile icon={Languages} label="Primary language" value={context.grower_summary.primary_language} />
                <SignalTile icon={ShieldCheck} label="Agronomy review" value="Required" />
              </div>
            </DashboardCard>
          </div>

          <div className="grid gap-4 xl:col-span-3">
            <RetailerReadinessCard alerts={context.inventory_alerts} />
            <WeatherTriggerPanel insight={context.weather_insights[0]} />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <CampaignPriorityCard scenarios={scenarios} />
          </div>
          <div className="grid gap-4 xl:col-span-4">
            <SegmentOpportunityCard />
            <OperationalTimeline />
          </div>
          <div className="xl:col-span-3">
            <FunnelAnalyticsCard data={analytics.charts.weekly_funnel} />
          </div>
        </div>

        <RepExecutionTable actions={fieldActions.actions} />
      </div>
    </DashboardShell>
  );
}

function PlannerField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-border bg-card-soft px-3 py-2.5">
      <p className="text-[11px] font-medium text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-foreground">{value}</p>
    </div>
  );
}

function SignalTile({ icon: Icon, label, value }: { icon: typeof Smartphone; label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-border bg-white px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-field" />
        <p className="text-[11px] font-medium text-muted">{label}</p>
      </div>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
