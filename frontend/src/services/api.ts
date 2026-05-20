import type {
  AnalyticsSummaryResponse,
  CampaignContextRequest,
  CampaignContextResponse,
  ContentApprovalResponse,
  ContentGenerationResponse,
  ExportResponse,
  FieldActionsResponse,
  RecommendationResponse,
  ScenarioResponse
} from "@/types/contracts";
import {
  analyticsSummaryResponse,
  campaignContext,
  contentApprovalResponse,
  contentGenerationResponse,
  exportResponse,
  fieldActionsResponse,
  recommendationResponse,
  scenariosResponse
} from "@/data/mock-data";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function withCachedWarning<T>(fallback: T): T {
  if (typeof fallback !== "object" || fallback === null) {
    return fallback;
  }
  const envelope = fallback as any;
  const existingWarnings = Array.isArray(envelope.warnings) ? envelope.warnings : [];
  return {
    ...envelope,
    warnings: Array.from(new Set([...existingWarnings, "Backend unavailable; showing cached fallback"]))
  };
}

async function fetchOrFallback<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  if (DEMO_MODE) {
    return withCachedWarning(fallback);
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {})
      },
      cache: "no-store"
    });
    if (!response.ok) {
      return withCachedWarning(fallback);
    }
    return (await response.json()) as T;
  } catch {
    return withCachedWarning(fallback);
  }
}

export function resolveDownloadUrl(downloadUrl: string): string {
  if (downloadUrl.startsWith("http://") || downloadUrl.startsWith("https://")) {
    return downloadUrl;
  }
  return `${API_BASE}${downloadUrl.startsWith("/") ? downloadUrl : `/${downloadUrl}`}`;
}

export function fetchScenarios(): Promise<ScenarioResponse> {
  return fetchOrFallback("/api/v1/scenarios", scenariosResponse);
}

export function createCampaignContext(request: CampaignContextRequest): Promise<CampaignContextResponse> {
  return fetchOrFallback("/api/v1/campaign-context", campaignContext, {
    method: "POST",
    body: JSON.stringify(request)
  });
}

export function fetchRecommendations(contextId = "CTX_001"): Promise<RecommendationResponse> {
  return fetchOrFallback("/api/v1/recommendations", recommendationResponse, {
    method: "POST",
    body: JSON.stringify({ context_id: contextId })
  });
}

export function generateContent(planId = "PLAN_001", recommendationId = "REC_001"): Promise<ContentGenerationResponse> {
  return fetchOrFallback("/api/v1/content/generate", contentGenerationResponse, {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      recommendation_id: recommendationId,
      languages: ["Hindi", "English"],
      formats: ["whatsapp", "sms", "ivr", "rep_script", "visual_concept"]
    })
  });
}

export function approveContent(contentId: string, approvalState: "approved" | "rejected", reviewer = "demo_reviewer"): Promise<ContentApprovalResponse> {
  return fetchOrFallback("/api/v1/content/approve", contentApprovalResponse, {
    method: "POST",
    body: JSON.stringify({
      content_id: contentId,
      approval_state: approvalState,
      reviewer: reviewer
    })
  });
}

export function fetchFieldActions(planId = "PLAN_001"): Promise<FieldActionsResponse> {
  return fetchOrFallback(`/api/v1/field-actions?plan_id=${planId}`, fieldActionsResponse);
}

export function fetchAnalyticsSummary(planId = "PLAN_001"): Promise<AnalyticsSummaryResponse> {
  return fetchOrFallback(`/api/v1/analytics-summary?plan_id=${planId}`, analyticsSummaryResponse);
}

export function exportPlan(planId = "PLAN_001", exportType: "csv" | "whatsapp_pack" | "rep_brief" = "csv"): Promise<ExportResponse> {
  return fetchOrFallback("/api/v1/export", exportResponse, {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      export_type: exportType
    })
  });
}


// ---------------------------------------------------------------------------
// Workflow Orchestration API
// ---------------------------------------------------------------------------

import type {
  WorkflowState,
  WorkflowStartRequest,
  KpiData,
  OperationalEvent,
  SystemHealth,
  WorkflowEvent
} from "@/types/workflow";

const EMPTY_WORKFLOW: WorkflowState = {
  schema_version: "syngenta-copilot.v1",
  request_id: "",
  generated_at: new Date().toISOString(),
  source_mode: "mock",
  warnings: ["Using demo fallback"],
  model_version: "v1.0.0",
  feature_version: "v3",
  trained_on: "2025-10 to 2026-01",
  data_last_updated: "2026-02-18T00:00:00Z",
  inventory_snapshot: "2026-02-18T06:00:00Z",
  model_last_trained: "2026-02-17T22:00:00Z",
  response_time_ms: 12,
  workflow_id: "",
  plan_id: "PLAN_001",
  context_id: "CTX_001",
  status: "fallback",
  context: null,
  recommendations: [],
  content_variants: [],
  events: [],
  kpis: null,
  alerts: [],
  next_action: null,
  system_health: null,
  executive_summary: null,
};

export async function startWorkflow(request?: WorkflowStartRequest): Promise<WorkflowState> {
  const body = request || {
    crop: "wheat",
    product: "Tilt 250 EC",
    objective: "lead_generation",
    week_start_date: "2026-02-16",
    geography: { state: "Uttar Pradesh", district: "Kanpur Nagar" },
    audience: { languages: ["Hindi"], device_types: ["smartphone"] },
    channel_preferences: ["whatsapp", "sms", "field_rep"],
    constraints: { low_bandwidth: true, human_review_required: true, min_stock_cover_days: 10 },
    role: "campaign_manager",
  };
  return fetchOrFallback<WorkflowState>("/api/v1/workflow/start", EMPTY_WORKFLOW, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchWorkflowState(workflowId: string): Promise<WorkflowState> {
  return fetchOrFallback<WorkflowState>(`/api/v1/workflow/${workflowId}`, EMPTY_WORKFLOW);
}

export async function fetchDynamicKpis(role = "campaign_manager", workflowId?: string): Promise<KpiData> {
  const fallback: KpiData = { role, kpis: [] };
  if (!workflowId) return fallback;
  return fetchOrFallback<KpiData>(`/api/v1/workflow/${workflowId}/kpis?role=${encodeURIComponent(role)}`, fallback);
}

export async function fetchOperationalEvents(role = "campaign_manager", workflowId?: string): Promise<{ role: string; events: OperationalEvent[] }> {
  const fallback = { role, events: [] as OperationalEvent[] };
  const params = new URLSearchParams({ role });
  if (workflowId) params.set("workflow_id", workflowId);
  return fetchOrFallback(`/api/v1/operational-events?${params.toString()}`, fallback);
}

export async function fetchWorkflowEvents(workflowId: string): Promise<{ workflow_id: string; events: WorkflowEvent[] }> {
  return fetchOrFallback(`/api/v1/workflow/${workflowId}/events`, { workflow_id: workflowId, events: [] });
}

export async function fetchSystemHealth(): Promise<SystemHealth> {
  const fallback: SystemHealth = { gemini: "unknown", supabase: "unknown", cache: "unknown", data_mode: "unknown", active_workflows: 0, last_generation_source: "unknown" };
  return fetchOrFallback("/api/v1/system/health", fallback);
}

