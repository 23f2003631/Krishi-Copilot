import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchAnalyticsSummary, fetchFieldActions, fetchRecommendations, fetchScenarios, startWorkflow } from "@/services/api";
import { PlannerClient } from "@/components/dashboard/planner-client";

export const dynamic = "force-dynamic";

export default async function PlannerPage() {
  // Bootstrap workflow via the orchestrator (creates all entities with real IDs)
  const workflowState = await startWorkflow();

  // Use workflow-generated plan_id for downstream requests, fall back to PLAN_001
  const planId = workflowState.plan_id || "PLAN_001";
  const contextId = workflowState.context_id || "CTX_001";

  // Fetch remaining data using the workflow's runtime IDs
  const [scenariosResp, recommendations, fieldActions, analytics] = await Promise.all([
    fetchScenarios(),
    fetchRecommendations(contextId),
    fetchFieldActions(planId),
    fetchAnalyticsSummary(planId),
  ]);
  const scenarios = scenariosResp.scenarios;

  // Use the workflow's context if available, otherwise fall back to API context
  const context = workflowState.context || {
    context_id: contextId,
    crop_stage: { stage: "flowering", days_to_stage: 3, confidence: 0.82 },
    grower_summary: { estimated_growers: 1180, smartphone_share: 0.74, keypad_share: 0.18, primary_language: "Hindi" },
    weather_insights: [{ risk_type: "humidity_rainfall", risk_level: "high", summary: "Humidity and light rainfall raise crop-stage disease advisory priority.", confidence: 0.76 }],
    inventory_alerts: [{ product: "Tilt 250 EC", stock_status: "healthy", stock_cover_days: 18, affected_retailers: 6 }],
  };

  return (
    <DashboardShell activePath="/planner">
      <PlannerClient
        scenarios={scenarios}
        context={context}
        recommendations={recommendations}
        fieldActions={fieldActions}
        analytics={analytics}
        workflowState={workflowState}
      />
    </DashboardShell>
  );
}
