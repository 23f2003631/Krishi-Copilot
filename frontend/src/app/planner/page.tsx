import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchAnalyticsSummary, createCampaignContext, fetchFieldActions, fetchRecommendations, fetchScenarios } from "@/services/api";
import { PlannerClient } from "@/components/dashboard/planner-client";

export default async function PlannerPage() {
  const [scenariosResp, context, recommendations, fieldActions, analytics] = await Promise.all([
    fetchScenarios(),
    createCampaignContext({
      crop: "wheat", product: "Tilt 250 EC", objective: "lead_generation",
      week_start_date: "2026-02-16", geography: { state: "Uttar Pradesh", district: "Kanpur Nagar" },
      audience: { languages: ["Hindi"], device_types: ["smartphone"] },
      channel_preferences: ["whatsapp", "sms", "field_rep"],
      constraints: { low_bandwidth: true, human_review_required: true, min_stock_cover_days: 10 },
    }),
    fetchRecommendations("CTX_001"),
    fetchFieldActions("PLAN_001"),
    fetchAnalyticsSummary("PLAN_001"),
  ]);
  const scenarios = scenariosResp.scenarios;

  return (
    <DashboardShell activePath="/planner">
      <PlannerClient 
        scenarios={scenarios} 
        context={context} 
        recommendations={recommendations} 
        fieldActions={fieldActions} 
        analytics={analytics} 
      />
    </DashboardShell>
  );
}
