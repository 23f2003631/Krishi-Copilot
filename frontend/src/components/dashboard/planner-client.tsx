"use client";

import Link from "next/link";
import { BrainCircuit, CloudRain, Languages, Leaf, MapPin, PackageCheck, ShieldCheck, Smartphone, Target, AlertTriangle, Store, ClipboardList } from "lucide-react";
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
import { useRole } from "@/lib/contexts/RoleContext";
import { OperationalAlertBanner } from "@/components/ui/operational-alert-banner";

export function PlannerClient({ scenarios, context, recommendations, fieldActions, analytics }: any) {
  const { role, roleConfig } = useRole();
  const topRecommendation = recommendations.recommendations[0];

  const renderKpis = () => {
    switch (role) {
      case "Campaign Manager":
        return (
          <>
            <KpiStatCard label={roleConfig.kpiPriorities[0]} value="12.4%" trend="+2.1% this week" metadata="conversion rate" icon={Target} tone="success" />
            <KpiStatCard label={roleConfig.kpiPriorities[1]} value="3" trend="needs attention" metadata="pending approval" icon={BrainCircuit} tone="warning" />
            <KpiStatCard label={roleConfig.kpiPriorities[2]} value="4,250" trend="+800 over baseline" metadata="expected leads" icon={Languages} tone="ai" />
            <KpiStatCard label={roleConfig.kpiPriorities[3]} value="85%" trend="steady" metadata="segment penetration" icon={UsersRound} tone="field" />
          </>
        );
      case "Territory Manager":
        return (
          <>
            <KpiStatCard label={roleConfig.kpiPriorities[0]} value="92%" trend="ready to deploy" metadata="3 regions" icon={MapPin} tone="success" />
            <KpiStatCard label={roleConfig.kpiPriorities[1]} value="2" trend="weather/stock risks" metadata="requires escalation" icon={AlertTriangle} tone="warning" />
            <KpiStatCard label={roleConfig.kpiPriorities[2]} value="142" trend="active retailers" metadata="96% coverage" icon={Store} tone="ai" />
            <KpiStatCard label={roleConfig.kpiPriorities[3]} value="64%" trend="on track" metadata="rep completion" icon={ClipboardList} tone="field" />
          </>
        );
      case "Field Representative":
        return (
          <>
            <KpiStatCard label={roleConfig.kpiPriorities[0]} value="18" trend="assigned today" metadata="in queue" icon={ClipboardList} tone="field" />
            <KpiStatCard label={roleConfig.kpiPriorities[1]} value="12" trend="high priority" metadata="due this week" icon={Target} tone="warning" />
            <KpiStatCard label={roleConfig.kpiPriorities[2]} value="6" trend="weather risk" metadata="urgent visits" icon={CloudRain} tone="ai" />
            <KpiStatCard label={roleConfig.kpiPriorities[3]} value="2 days" trend="average deadline" metadata="on time" icon={Leaf} tone="success" />
          </>
        );
      case "Retailer Support":
        return (
          <>
            <KpiStatCard label={roleConfig.kpiPriorities[0]} value="High" trend="Tilt 250 EC" metadata="critical alert" icon={AlertTriangle} tone="warning" />
            <KpiStatCard label={roleConfig.kpiPriorities[1]} value="4" trend="escalations" metadata="needs dispatch" icon={PackageCheck} tone="field" />
            <KpiStatCard label={roleConfig.kpiPriorities[2]} value="3" trend="blocked campaigns" metadata="due to stock" icon={Store} tone="ai" />
            <KpiStatCard label={roleConfig.kpiPriorities[3]} value="94%" trend="overall health" metadata="steady" icon={ShieldCheck} tone="success" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <OperationalAlertBanner />

      {role === "Campaign Manager" && (
        <AiInsightBanner
          title="Crop-stage activation window detected"
          description="Flowering-stage wheat, disease-weather pressure, Hindi grower reach, and 18-day retailer stock cover align for a launch-ready advisory deployment."
          actionLabel="Review field signal"
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {renderKpis()}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        {(role === "Campaign Manager" || role === "Territory Manager") && (
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
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/recommendations?context_id=CTX_001">{roleConfig.primaryAction}</Link>
              </Button>
            </div>
          </DashboardCard>
        )}

        <div className={role === "Campaign Manager" || role === "Territory Manager" ? "xl:col-span-5" : "xl:col-span-8"}>
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

function SignalTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
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
// Add UsersRound missing import above
import { UsersRound } from "lucide-react";
