import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchAnalyticsSummary, fetchRecommendations } from "@/services/api";
import { RecommendationsClient } from "@/components/dashboard/recommendations-client";

export default async function RecommendationsPage() {
  const [recommendations, analytics] = await Promise.all([fetchRecommendations(), fetchAnalyticsSummary()]);

  return (
    <DashboardShell activePath="/recommendations">
      <RecommendationsClient recommendations={recommendations} analytics={analytics} />
    </DashboardShell>
  );
}
