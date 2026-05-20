import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchAnalyticsSummary, fetchRecommendations } from "@/services/api";
import { RecommendationsClient } from "@/components/dashboard/recommendations-client";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ context_id?: string; plan_id?: string }>;
}) {
  const resolvedParams = (await searchParams) || {};
  const contextId = resolvedParams.context_id || "CTX_001";
  const planId = resolvedParams.plan_id || "PLAN_001";

  const [recommendations, analytics] = await Promise.all([
    fetchRecommendations(contextId),
    fetchAnalyticsSummary(planId),
  ]);

  return (
    <DashboardShell activePath="/recommendations">
      <RecommendationsClient recommendations={recommendations} analytics={analytics} />
    </DashboardShell>
  );
}
