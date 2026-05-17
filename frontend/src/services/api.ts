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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

function withCachedWarning<T>(fallback: T): T {
  if (typeof fallback !== "object" || fallback === null || !("warnings" in fallback)) {
    return fallback;
  }
  const envelope = fallback as T & { warnings: string[] };
  return {
    ...envelope,
    warnings: Array.from(new Set([...(envelope.warnings ?? []), "Using cached demo output"]))
  };
}

async function fetchOrFallback<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  if (!API_BASE || DEMO_MODE) {
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
