"use client";

import Link from "next/link";
import { BarChart3, BrainCircuit, CheckCircle2, Clock3, AlertTriangle } from "lucide-react";
import { RecommendationCard } from "@/components/cards/recommendation-card";
import { KpiStatCard } from "@/components/cards/kpi-stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { CampaignFunnelChart } from "@/components/charts/campaign-funnel-chart";
import { ChannelPerformanceChart } from "@/components/charts/channel-performance-chart";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/contexts/RoleContext";
import { OperationalAlertBanner } from "@/components/ui/operational-alert-banner";
import { formatPercent } from "@/lib/formatters";
import { ExportButton } from "@/components/actions/export-button";

export function RecommendationsClient({ recommendations, analytics }: any) {
  const { role } = useRole();
  const recs = recommendations.recommendations || [];
  const top = recs[0];
  const executiveSummary = recommendations.executive_summary;

  const renderKpis = () => {
    // If we have an executive summary from the backend, bind the cards dynamically
    if (executiveSummary) {
      return (
        <>
          <KpiStatCard 
            label="Deployment Score" 
            value={top ? `${top.priority_score}` : "0"} 
            trend={recommendations.source_mode === "live_ml" ? "live ML model" : "hybrid rules"} 
            metadata={`model version: ${recommendations.model_version || "v1.0.0"}`} 
            icon={BrainCircuit} 
            tone="ai" 
          />
          <KpiStatCard 
            label="Target Growers" 
            value={executiveSummary.total_target_growers.toLocaleString()} 
            trend={`open rate: ${formatPercent(executiveSummary.predicted_open_rate)}`} 
            metadata={`expected leads: ${executiveSummary.expected_leads}`} 
            icon={CheckCircle2} 
            tone="field" 
          />
          <KpiStatCard 
            label="Expected Inquiries" 
            value={executiveSummary.expected_leads.toString()} 
            trend={`click rate: ${formatPercent(executiveSummary.predicted_click_rate)}`} 
            metadata="response proxy" 
            icon={BarChart3} 
            tone="success" 
          />
          <KpiStatCard 
            label="Retailer Readiness" 
            value={`${executiveSummary.stock_ready_retailers} / 12`} 
            trend="ready stock" 
            metadata={`snapshot: ${recommendations.inventory_snapshot ? recommendations.inventory_snapshot.substring(11, 16) : "06:00"}`} 
            icon={Clock3} 
            tone="warning" 
          />
        </>
      );
    }

    // If there is no real executive summary from the backend, we DO NOT render fake KPIs.
    // We enforce data lineage by returning null or skeletons.
    return null;
  };

  return (
    <div className="space-y-5">
      <OperationalAlertBanner />

      {recommendations.warnings && recommendations.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-900 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-800 text-[13px]">System Fallback Notice:</span>{" "}
            {recommendations.warnings.map((w: string, idx: number) => (
              <span key={idx} className="block mt-0.5 text-xs text-amber-700 font-medium">{w}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-muted">Agronomic AI</p>
          <h1 className="mt-1 text-[22px] font-semibold leading-7 text-foreground">
            Ranked crop-stage actions for {recommendations.context?.geography?.district || "Kanpur Nagar"} {recommendations.context?.crop || "wheat"} cohorts
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {role === "Campaign Manager" && "Recommendations are scored using crop stage, grower language, device reach, disease-weather pressure, receptivity, field coverage, and retailer stock gates."}
            {role === "Territory Manager" && "Territory execution priorities based on localized weather, active pest risks, and retailer inventory readiness."}
            {role === "Field Representative" && "Your priority grower outreach list, sorted by agronomic urgency and conversion likelihood."}
            {role === "Retailer Support" && "Upcoming campaign demand forecasts intersecting with real-time retailer inventory stockouts."}
          </p>
        </div>
        {role === "Campaign Manager" && top && (
          <div className="flex gap-3">
            <ExportButton label="Export to CSV" planId={recommendations.plan_id} type="csv" />
            <Button asChild>
              <Link href={`/content-studio?plan_id=${recommendations.plan_id}&recommendation_id=${top.recommendation_id}&context_id=${recommendations.context_id}`}>
                Draft Advisory Pack
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Dynamic and Responsive Metadata Ribbon */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-[#0B5B34]/10 bg-[#F8FAF9] px-4 py-3 text-[11px] text-[#55625D]">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground">Model:</span>
          <code className="rounded bg-white border px-1.5 py-0.5 text-[10px] font-mono text-slate-800">
            {recommendations.model_version || "v1.0.0"}
          </code>
        </div>
        <div className="h-3 w-px bg-slate-300/60 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground">Feature Store:</span>
          <code className="rounded bg-white border px-1.5 py-0.5 text-[10px] font-mono text-slate-800">
            {recommendations.feature_version || "v3"}
          </code>
        </div>
        <div className="h-3 w-px bg-slate-300/60 hidden md:block" />
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground">Last Trained:</span>
          <span>
            {recommendations.model_last_trained 
              ? recommendations.model_last_trained.replace("T", " ").substring(0, 16)
              : "2026-02-17 22:00"}
          </span>
        </div>
        <div className="h-3 w-px bg-slate-300/60 hidden lg:block" />
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground">Data Snap:</span>
          <span>
            {recommendations.data_last_updated
              ? recommendations.data_last_updated.replace("T", " ").substring(0, 16)
              : "2026-02-18 00:00"}
          </span>
        </div>
        <div className="h-3 w-px bg-slate-300/60 hidden xl:block" />
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground">Response Timing:</span>
          <span className="font-bold text-emerald-700">
            {recommendations.response_time_ms ? `${recommendations.response_time_ms} ms` : "live"}
          </span>
        </div>
      </div>

      {/* Server-Side Executive Summary Alert Box */}
      {executiveSummary?.summary_text && (
        <div className="rounded-2xl border border-[#B7D8C3] bg-[#DDEADF]/20 p-4 text-sm text-foreground flex items-start gap-3">
          <BrainCircuit className="h-5 w-5 text-[#0D7A43] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#0D7A43]">Executive Digest:</span>{" "}
            {executiveSummary.summary_text}
          </div>
        </div>
      )}

      {top && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {renderKpis()}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardCard>
          <SectionHeader 
            icon={BrainCircuit} 
            title="Crop-Stage Recommendation Queue" 
            description="Explainable actions with channel strategy, stock gates, and field ownership." 
          />
          
          {recs.length === 0 ? (
            <div className="mt-5 rounded-[22px] border border-dashed border-border/80 bg-[#F8FAF9] p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">No recommendations generated for this scope</h3>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted">
                Try expanding your target geography, reducing the minimum stock cover days constraint, or adjusting the active agronomic crop-stage filters.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {recs.map((recommendation: any) => (
                <RecommendationCard key={recommendation.recommendation_id} recommendation={recommendation} />
              ))}
            </div>
          )}
        </DashboardCard>

        <div id="analytics" className="grid gap-5">
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
