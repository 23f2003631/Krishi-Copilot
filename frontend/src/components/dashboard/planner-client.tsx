"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  AlertTriangle,
  BrainCircuit,
  ClipboardList,
  CloudRain,
  EllipsisVertical,
  Languages,
  Leaf,
  MapPin,
  Megaphone,
  PackageCheck,
  ShieldCheck,
  Store,
  Target,
  UsersRound,
} from "lucide-react";
import { AIRecommendationCard } from "@/components/insights/ai-recommendation-card";
import { PlannerForm } from "@/components/planner/planner-form";
import { KpiStatCard } from "@/components/cards/kpi-stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { OperationalPanel } from "@/components/dashboard/operational-panel";
import { CampaignPriorityCard } from "@/components/operations/campaign-priority-card";
import { FunnelAnalyticsCard } from "@/components/operations/funnel-analytics-card";
import { RepExecutionTable } from "@/components/operations/rep-execution-table";
import { RetailerReadinessCard } from "@/components/operations/retailer-readiness-card";
import { SegmentOpportunityCard } from "@/components/operations/segment-opportunity-card";
import { WeatherTriggerPanel } from "@/components/operations/weather-trigger-panel";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/contexts/RoleContext";
import { fetchDynamicKpis } from "@/services/api";
import type { KpiItem } from "@/types/workflow";
import { cn } from "@/lib/utils";

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

type PlannerClientProps = {
  scenarios: any[];
  context: any;
  recommendations: any;
  fieldActions: any;
  analytics: any;
  workflowState: any;
  displayMode?: "full" | "hero-preview";
  disableLivePolling?: boolean;
};

export function PlannerClient({
  scenarios,
  context,
  recommendations,
  fieldActions,
  analytics,
  workflowState,
  displayMode = "full",
  disableLivePolling = false,
}: PlannerClientProps) {
  const { role, roleConfig } = useRole();
  const reduceMotion = useReducedMotion();
  const workflowId = workflowState?.workflow_id;
  const isPreview = displayMode === "hero-preview";
  const topRecommendation = recommendations?.recommendations?.[0];
  const [dynamicKpis, setDynamicKpis] = useState<KpiItem[]>([]);

  useEffect(() => {
    if (!workflowId || disableLivePolling || isPreview) {
      return;
    }

    const roleKey = role.toLowerCase().replace(/ /g, "_");

    fetchDynamicKpis(roleKey, workflowId)
      .then((data) => {
        if (data?.kpis?.length) {
          setDynamicKpis(data.kpis);
        }
      })
      .catch(() => {});

    const interval = setInterval(() => {
      fetchDynamicKpis(roleKey, workflowId)
        .then((data) => {
          if (data?.kpis?.length) {
            setDynamicKpis(data.kpis);
          }
        })
        .catch(() => {});
    }, 30_000);

    return () => clearInterval(interval);
  }, [disableLivePolling, isPreview, role, workflowId]);

  const variants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: reduceMotion ? { duration: 0 } : { staggerChildren: isPreview ? 0.035 : 0.08 },
    },
  };

  const itemTransition = reduceMotion ? { duration: 0 } : { duration: 0.55, ease: "easeOut" as const };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: itemTransition,
    },
  };

  const renderKpis = () => {
    if (dynamicKpis.length > 0) {
      return dynamicKpis.slice(0, 4).map((kpi) => (
        <KpiStatCard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          trend={kpi.trend}
          metadata={kpi.metadata || ""}
          icon={ICON_MAP[kpi.label] || Target}
          tone={kpi.tone as any}
        />
      ));
    }

    return getFallbackKpis(role, roleConfig).map((kpi: any) => <KpiStatCard key={kpi.label} {...kpi} />);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={cn(
        "mx-auto w-full max-w-[1500px]",
        isPreview ? "space-y-4" : "space-y-6"
      )}
      data-display-mode={displayMode}
    >
      <motion.div
        variants={itemVariants}
        className={cn(
          "grid gap-4",
          isPreview ? "grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-4"
        )}
      >
        {renderKpis()}
      </motion.div>

      <motion.div variants={itemVariants} className="grid items-stretch gap-5 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <TerritoryContextPanel context={context} scenarios={scenarios} />
        </div>
        <div className="xl:col-span-5">
          <AIRecommendationCard recommendation={topRecommendation} compact={isPreview} />
        </div>
        <div className="grid gap-5 xl:col-span-3">
          <RetailerReadinessCard alerts={context?.inventory_alerts ?? []} />
          <WeatherTriggerPanel insight={context?.weather_insights?.[0]} />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <CampaignPriorityCard scenarios={scenarios ?? []} />
        </div>
        <div className="xl:col-span-4">
          <SegmentOpportunityCard />
        </div>
        <div className="xl:col-span-3">
          {isPreview ? <FunnelPreviewCard /> : <FunnelAnalyticsCard data={analytics?.charts?.weekly_funnel ?? []} />}
        </div>
      </motion.div>

      {!isPreview && (
        <motion.div variants={itemVariants}>
          <RepExecutionTable actions={fieldActions?.actions ?? []} />
        </motion.div>
      )}
    </motion.div>
  );
}

function FunnelPreviewCard() {
  const stages = [
    ["Awareness", "980k", "bg-[#DDEADF] text-[#0B5B34]"],
    ["Engagement", "240k", "bg-[#B7D8C3] text-[#0B5B34]"],
    ["Conversion", "45k", "bg-[#1F9D62] text-white"],
    ["Retention", "38k", "bg-[#0D7A43] text-white"],
  ];

  return (
    <DashboardCard className="min-h-[300px]">
      <h3 className="text-[15px] font-semibold text-[#08110C]">Funnel Analytics</h3>
      <div className="mt-5 space-y-3">
        {stages.map(([label, value, className]) => (
          <div key={label} className={cn("rounded-[10px] px-4 py-3 text-center text-[13px] font-semibold", className)}>
            {label} ({value})
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function TerritoryContextPanel({ context, scenarios }: { context: any; scenarios: any[] }) {
  return (
    <DashboardCard className="flex h-full min-h-[360px] flex-col p-5">
      <div className="flex items-center justify-between border-b border-[#0B5B34]/[0.08] pb-4">
        <div>
          <h3 className="text-[18px] font-semibold text-[#08110C]">Territory Activation Context</h3>
          <p className="text-[11px] text-[#64706B] mt-0.5">The field brief used by the crop-stage recommendation engine.</p>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#5D6B62] transition-colors hover:bg-[#DDEADF]/55 hover:text-[#0B5B34]"
          aria-label="More territory options"
        >
          <EllipsisVertical className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 flex-1">
        <PlannerForm scenarios={scenarios} />
      </div>
    </DashboardCard>
  );
}

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
        { label: roleConfig.kpiPriorities[0], value: "92%", trend: "ready", metadata: "3 regions", icon: MapPin, tone: "success" },
        { label: roleConfig.kpiPriorities[1], value: "2", trend: "risks", metadata: "requires escalation", icon: AlertTriangle, tone: "warning" },
        { label: roleConfig.kpiPriorities[2], value: "142", trend: "+6%", metadata: "active retailers", icon: Store, tone: "ai" },
        { label: roleConfig.kpiPriorities[3], value: "64%", trend: "+4%", metadata: "rep completion", icon: ClipboardList, tone: "field" },
      ];
    case "Field Representative":
      return [
        { label: roleConfig.kpiPriorities[0], value: "18", trend: "+3", metadata: "assigned today", icon: ClipboardList, tone: "field" },
        { label: roleConfig.kpiPriorities[1], value: "12", trend: "high", metadata: "due this week", icon: Target, tone: "warning" },
        { label: roleConfig.kpiPriorities[2], value: "6", trend: "watch", metadata: "urgent visits", icon: CloudRain, tone: "ai" },
        { label: roleConfig.kpiPriorities[3], value: "2d", trend: "+1", metadata: "average deadline", icon: Leaf, tone: "success" },
      ];
    case "Retailer Support":
      return [
        { label: roleConfig.kpiPriorities[0], value: "High", trend: "Tilt", metadata: "critical alert", icon: AlertTriangle, tone: "warning" },
        { label: roleConfig.kpiPriorities[1], value: "4", trend: "+1", metadata: "needs dispatch", icon: PackageCheck, tone: "field" },
        { label: roleConfig.kpiPriorities[2], value: "3", trend: "hold", metadata: "due to stock", icon: Store, tone: "ai" },
        { label: roleConfig.kpiPriorities[3], value: "94%", trend: "+5%", metadata: "overall health", icon: ShieldCheck, tone: "success" },
      ];
    default:
      return [];
  }
}
