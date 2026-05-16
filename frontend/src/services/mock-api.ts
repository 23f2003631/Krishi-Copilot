import {
  analyticsSummaryResponse,
  campaignContext,
  contentGenerationResponse,
  fieldActionsResponse,
  recommendationResponse,
  scenarios
} from "@/data/mock-data";

async function withDemoDelay<T>(value: T): Promise<T> {
  return value;
}

export async function getScenarios() {
  return withDemoDelay(scenarios);
}

export async function getCampaignContext() {
  return withDemoDelay(campaignContext);
}

export async function getRecommendations() {
  return withDemoDelay(recommendationResponse);
}

export async function getContentVariants() {
  return withDemoDelay(contentGenerationResponse);
}

export async function getFieldActions() {
  return withDemoDelay(fieldActionsResponse);
}

export async function getAnalyticsSummary() {
  return withDemoDelay(analyticsSummaryResponse);
}

