import { DashboardShell } from "@/components/layout/dashboard-shell";
import { generateContent, fetchRecommendations } from "@/services/api";
import { ContentStudioClient } from "@/components/dashboard/content-studio-client";

export const dynamic = "force-dynamic";

export default async function ContentStudioPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan_id?: string; recommendation_id?: string; context_id?: string }>;
}) {
  const resolvedParams = (await searchParams) || {};
  const planId = resolvedParams.plan_id || "PLAN_001";
  const recommendationId = resolvedParams.recommendation_id || "REC_001";
  const contextId = resolvedParams.context_id || "CTX_001";
  const [content, recommendations] = await Promise.all([
    generateContent(planId, recommendationId),
    fetchRecommendations(contextId),
  ]);

  return (
    <DashboardShell activePath="/content-studio">
      <ContentStudioClient content={content} recommendations={recommendations} />
    </DashboardShell>
  );
}
