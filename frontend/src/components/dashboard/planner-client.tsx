"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, CloudRain, Languages, Leaf, MapPin, PackageCheck, ShieldCheck, Smartphone, Target, AlertTriangle, Store, ClipboardList, UsersRound, Megaphone } from "lucide-react";
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
import { useRole } from "@/lib/contexts/RoleContext";
import { OperationalAlertBanner } from "@/components/ui/operational-alert-banner";
import { LiveIntelligenceStrip } from "@/components/ui/live-intelligence-strip";
import { DemoScenarioCard } from "@/components/ui/demo-scenario-card";
import { SystemHealthStrip } from "@/components/ui/system-health-strip";
import { fetchOperationalEvents, fetchDynamicKpis } from "@/services/api";
import type { KpiItem, OperationalEvent } from "@/types/workflow";

// Icon map for dynamic KPI rendering
const ICON_MAP: Record<string, any> = {
  "Expected Campaign Lift": Target,
  "Approval Queue": BrainCircuit,
  "Conversion Forecast": Languages,
  "Segment Reach": UsersRound,
  "Territory Readiness": MapPin,
  "Blocked Campaigns": AlertTriangle,
  "Retailer Coverage": Store,
  "Field Completion %": ClipboardList,
  "Assigned Actions": ClipboardList,
  "Pending Visits": Target,
  "Priority Growers": CloudRain,
  "Execution Deadlines": Leaf,
  "Stock Risk": AlertTriangle,
  "Replenishment Urgency": PackageCheck,
  "Inventory Blockers": Store,
  "Coverage Gaps": ShieldCheck,
};

export function PlannerClient({ scenarios, context, recommendations, fieldActions, analytics, workflowState }: any) {
  const { role, roleConfig } = useRole();
  const topRecommendation = recommendations.recommendations[0];
  const workflowId = workflowState?.workflow_id;

  // Dynamic KPIs from backend
  const [dynamicKpis, setDynamicKpis] = useState<KpiItem[]>([]);
  const [liveEvents, setLiveEvents] = useState<OperationalEvent[]>([]);

  useEffect(() => {
    if (!workflowId) return;
    const roleKey = role.toLowerCase().replace(/ /g, "_");

    // Fetch dynamic KPIs
    fetchDynamicKpis(roleKey, workflowId).then(data => {
      if (data?.kpis?.length) setDynamicKpis(data.kpis);
    }).catch(() => {});

    // Fetch operational events for intelligence strip
    fetchOperationalEvents(roleKey, workflowId).then(data => {
      if (data?.events?.length) setLiveEvents(data.events);
    }).catch(() => {});

    // Polling interval for live events
    const interval = setInterval(() => {
      fetchOperationalEvents(roleKey, workflowId).then(data => {
        if (data?.events?.length) setLiveEvents(data.events);
      }).catch(() => {});
    }, 30_000);

    return () => clearInterval(interval);
  }, [workflowId, role]);

  const renderKpis = () => {
    // Use backend-computed KPIs if available
    if (dynamicKpis.length > 0) {
      return (
        <>
          {dynamicKpis.slice(0, 4).map((kpi, i) => (
            <KpiStatCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.trend}
              metadata={kpi.metadata || ""}
              icon={ICON_MAP[kpi.label] || Target}
              tone={kpi.tone as any}
            />
          ))}
        </>
      );
    }

    // Fallback: static KPIs from roleConfig (backward compatibility)
    const fallbackKpis = getFallbackKpis(role, roleConfig);
    return (
      <>
        {fallbackKpis.map((kpi: any) => (
          <KpiStatCard key={kpi.label} {...kpi} />
        ))}
      </>
    );
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
      className="mx-auto w-full max-w-[1500px] space-y-6"
    >
      {/* Level 1: System Reality & Live Intelligence */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col gap-2">
        <SystemHealthStrip />
        <LiveIntelligenceStrip events={liveEvents} />
      </motion.div>

      {/* Level 2: Escalations & Priorities */}
      <OperationalAlertBanner alerts={workflowState?.alerts} />

      {/* Level 3: AI Directive (What should happen next?) */}
      {role === "Campaign Manager" ? (
        <AiInsightBanner
          title="Crop-stage activation window detected"
          description="Flowering-stage wheat, disease-weather pressure, Hindi grower reach, and 18-day retailer stock cover align for a launch-ready advisory deployment."
          actionLabel="Review field signal"
        />
      ) : workflowState?.next_action && (
        <div className="rounded-[16px] border border-primary/20 bg-primary/5 px-5 py-4 flex items-center justify-between shadow-glow-subtle">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground tracking-tight">{workflowState.next_action.action}</p>
              <p className="text-[13px] text-muted-text mt-0.5">{workflowState.next_action.reason} / Assigned to: {workflowState.next_action.assigned_role}</p>
            </div>
          </div>
          <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${
            workflowState.next_action.priority === "high" ? "bg-warning/15 text-warning border border-warning/20" :
            workflowState.next_action.priority === "medium" ? "bg-cyan/15 text-cyan border border-cyan/20" :
            "bg-muted/10 text-muted-text border border-border"
          }`}>
            {workflowState.next_action.priority} Priority
          </span>
        </div>
      )}

      {/* Level 4: Current Status (KPIs) */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }} className="grid gap-4 pt-1 md:grid-cols-2 xl:grid-cols-5 [&>section:first-child]:xl:col-span-2">
        {renderKpis()}
      </motion.div>

      {/* Level 5: Deep Context & Orchestration */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }} className="grid items-stretch gap-6 xl:grid-cols-[0.95fr_1.15fr_0.9fr]">
        
        {/* Territory Context */}
        <DashboardCard className="flex h-full flex-col p-0">
          <div className="p-5 flex justify-between items-center border-b border-[#0B5B34]/[0.08]">
            <h3 className="text-[16px] font-semibold text-[#07110B]">Territory Context</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            <PlannerField label="CROP" value="Corn" />
            <PlannerField label="PRODUCT" value="Fortenza" />
            <PlannerField label="REGION" value="Karnataka" />
            <PlannerField label="WEEK" value="W24" />
            <PlannerField label="OBJECTIVE" value="Yield" />
            <PlannerField label="AUDIENCE" value="Enterprise" />
          </div>
          <div className="px-5 pb-5 mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-[#0D7A43]/20 bg-[#DDEADF] px-3 py-1 text-[11px] font-semibold text-[#0D7A43]">Supply Ready</span>
            <span className="inline-flex items-center rounded-full border border-[#0D7A43]/20 bg-[#DDEADF] px-3 py-1 text-[11px] font-semibold text-[#0D7A43]">Retailer Signed</span>
            <span className="inline-flex items-center rounded-full border border-[#0D7A43]/20 bg-[#DDEADF] px-3 py-1 text-[11px] font-semibold text-[#0D7A43]">Staff Trained</span>
            <span className="inline-flex items-center rounded-full border border-[#0D7A43]/20 bg-[#DDEADF] px-3 py-1 text-[11px] font-semibold text-[#0D7A43]">Digital Live</span>
          </div>
          <div className="p-5 mt-auto border-t border-[#0B5B34]/[0.08]">
             <Button className="w-full bg-[#0D7A43] hover:bg-[#0A6235] text-white font-semibold">Review Recommendations</Button>
          </div>
        </DashboardCard>

        {/* AI Recommendation Feed */}
        <div className="h-full">
          <AIRecommendationCard />
        </div>

        {/* Readiness & Triggers */}
        <div className="flex flex-col gap-6 h-full">
          <DashboardCard className="p-5 flex-1">
             <div className="flex items-center gap-2 mb-4">
               <Store className="h-4 w-4 text-gray-500" />
               <h3 className="text-[14px] font-semibold text-gray-900">Retailer Readiness</h3>
             </div>
             <div className="flex justify-between items-end mb-2">
               <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Current Stock</span>
               <span className="text-[16px] font-bold text-gray-900">85%</span>
             </div>
             <div className="h-1.5 w-full bg-[#E8EEE9] rounded-full mb-6 overflow-hidden flex">
               <div className="h-full bg-[#0D7A43] w-[85%] rounded-full" />
             </div>
             <div className="enterprise-inset flex justify-between items-center rounded-[12px] px-3 py-2">
               <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Coverage</span>
               <span className="text-[13px] font-semibold text-gray-900">12 Days</span>
             </div>
          </DashboardCard>

          <DashboardCard className="border-[#E8C36F]/35 bg-[#FFF8E7] p-5 flex-1">
             <div className="flex items-center gap-2 mb-3">
               <CloudRain className="h-4 w-4 text-red-500" />
               <h3 className="text-[14px] font-semibold text-gray-900">Weather Trigger</h3>
             </div>
             <p className="text-[13px] font-semibold text-red-600 mb-2">High Risk: Heavy Rain</p>
             <p className="text-[12px] text-gray-700 leading-relaxed mb-4">Deployment delay suggested for Northern Karnataka blocks.</p>
             <div className="mt-auto flex justify-between items-center pt-2">
               <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Confidence</span>
               <span className="text-[14px] font-bold text-gray-900">88%</span>
             </div>
          </DashboardCard>
        </div>

      </motion.div>

      {/* Level 6: Execution Tracking */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }} className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <CampaignPriorityCard scenarios={scenarios} />
        </div>
        <div className="grid gap-4 xl:col-span-4">
          <SegmentOpportunityCard />
          <OperationalTimeline events={workflowState?.events} />
        </div>
        <div className="grid gap-4 xl:col-span-3">
          <FunnelAnalyticsCard data={analytics.charts.weekly_funnel} />
          <DemoScenarioCard />
        </div>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }}>
        <RepExecutionTable actions={fieldActions.actions} />
      </motion.div>
    </motion.div>
  );
}

function PlannerField({ label, value }: { label: string; value: string }) {
  return (
    <div className="enterprise-inset rounded-[16px] px-3 py-2.5">
      <p className="text-[11px] font-medium text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-foreground">{value}</p>
    </div>
  );
}

function SignalTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="enterprise-inset rounded-[16px] px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-field" />
        <p className="text-[11px] font-medium text-muted">{label}</p>
      </div>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

/** Fallback static KPIs for backward compatibility when backend is unavailable */
function getFallbackKpis(role: string, roleConfig: any) {
  switch (role) {
    case "Campaign Manager":
      return [
        { label: "TOTAL FIELD REACH", value: "1.2M", trend: "+12%", icon: UsersRound, tone: "ai" },
        { label: "ACTIVE CAMPAIGNS", value: "48", trend: "-2%", icon: Megaphone, tone: "warning" },
        { label: "AI INSIGHTS GENERATED", value: "892", trend: "+24%", icon: BrainCircuit, tone: "ai" },
        { label: "DEPLOYMENT READINESS", value: "94%", trend: "+5%", icon: ShieldCheck, tone: "success" },
      ];
    case "Territory Manager":
      return [
        { label: roleConfig.kpiPriorities[0], value: "92%", trend: "ready to deploy", metadata: "3 regions", icon: MapPin, tone: "success" },
        { label: roleConfig.kpiPriorities[1], value: "2", trend: "weather/stock risks", metadata: "requires escalation", icon: AlertTriangle, tone: "warning" },
        { label: roleConfig.kpiPriorities[2], value: "142", trend: "active retailers", metadata: "96% coverage", icon: Store, tone: "ai" },
        { label: roleConfig.kpiPriorities[3], value: "64%", trend: "on track", metadata: "rep completion", icon: ClipboardList, tone: "field" },
      ];
    case "Field Representative":
      return [
        { label: roleConfig.kpiPriorities[0], value: "18", trend: "assigned today", metadata: "in queue", icon: ClipboardList, tone: "field" },
        { label: roleConfig.kpiPriorities[1], value: "12", trend: "high priority", metadata: "due this week", icon: Target, tone: "warning" },
        { label: roleConfig.kpiPriorities[2], value: "6", trend: "weather risk", metadata: "urgent visits", icon: CloudRain, tone: "ai" },
        { label: roleConfig.kpiPriorities[3], value: "2 days", trend: "average deadline", metadata: "on time", icon: Leaf, tone: "success" },
      ];
    case "Retailer Support":
      return [
        { label: roleConfig.kpiPriorities[0], value: "High", trend: "Tilt 250 EC", metadata: "critical alert", icon: AlertTriangle, tone: "warning" },
        { label: roleConfig.kpiPriorities[1], value: "4", trend: "escalations", metadata: "needs dispatch", icon: PackageCheck, tone: "field" },
        { label: roleConfig.kpiPriorities[2], value: "3", trend: "blocked campaigns", metadata: "due to stock", icon: Store, tone: "ai" },
        { label: roleConfig.kpiPriorities[3], value: "94%", trend: "overall health", metadata: "steady", icon: ShieldCheck, tone: "success" },
      ];
    default:
      return [];
  }
}
