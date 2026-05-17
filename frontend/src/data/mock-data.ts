import type {
  AnalyticsSummaryResponse,
  CampaignContextResponse,
  ContentApprovalResponse,
  ContentGenerationResponse,
  ExportResponse,
  FieldActionsResponse,
  RecommendationResponse,
  ScenarioResponse
} from "@/types/contracts";

import analyticsSummaryJson from "../../public/demo-cache/analytics-summary.json";
import campaignContextJson from "../../public/demo-cache/campaign-context.json";
import contentApprovalJson from "../../public/demo-cache/content-approval.json";
import contentVariantsJson from "../../public/demo-cache/content-variants.json";
import exportJson from "../../public/demo-cache/export.json";
import fieldActionsJson from "../../public/demo-cache/field-actions.json";
import recommendationsJson from "../../public/demo-cache/recommendations.json";
import scenariosJson from "../../public/demo-cache/scenarios.json";

export const scenariosResponse = scenariosJson as unknown as ScenarioResponse;
export const scenarios = scenariosResponse.scenarios;
export const campaignContext = campaignContextJson as unknown as CampaignContextResponse;
export const recommendationResponse = recommendationsJson as unknown as RecommendationResponse;
export const contentGenerationResponse = contentVariantsJson as unknown as ContentGenerationResponse;
export const contentApprovalResponse = contentApprovalJson as unknown as ContentApprovalResponse;
export const fieldActionsResponse = fieldActionsJson as unknown as FieldActionsResponse;
export const analyticsSummaryResponse = analyticsSummaryJson as unknown as AnalyticsSummaryResponse;
export const exportResponse = exportJson as unknown as ExportResponse;
