import type {
  AnalyticsSummaryResponse,
  CampaignContextRequest,
  CampaignContextResponse,
  ContentGenerationResponse,
  FieldActionsResponse,
  RecommendationResponse,
  Scenario
} from "@/types/contracts";
import {
  analyticsSummaryResponse,
  campaignContext,
  contentGenerationResponse,
  fieldActionsResponse,
  recommendationResponse,
  scenarios
} from "@/data/mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

async function fetchOrFallback<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  if (!API_BASE || DEMO_MODE) {
    return fallback;
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
      return fallback;
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export function fetchScenarios(): Promise<Scenario[]> {
  return fetchOrFallback("/api/v1/scenarios", scenarios);
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

export function generateContent(): Promise<ContentGenerationResponse> {
  return fetchOrFallback("/api/v1/content/generate", contentGenerationResponse, {
    method: "POST",
    body: JSON.stringify({
      plan_id: "PLAN_001",
      recommendation_id: "REC_001",
      languages: ["Hindi", "English"],
      formats: ["whatsapp", "sms", "ivr", "rep_script", "visual_concept"]
    })
  });
}

export function fetchFieldActions(planId = "PLAN_001"): Promise<FieldActionsResponse> {
  return fetchOrFallback(`/api/v1/field-actions?plan_id=${planId}`, fieldActionsResponse);
}

export function fetchAnalyticsSummary(planId = "PLAN_001"): Promise<AnalyticsSummaryResponse> {
  return fetchOrFallback(`/api/v1/analytics-summary?plan_id=${planId}`, analyticsSummaryResponse);
}

