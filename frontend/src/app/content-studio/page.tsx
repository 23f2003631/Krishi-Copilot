import { DashboardShell } from "@/components/layout/dashboard-shell";
import { generateContent, fetchRecommendations } from "@/services/api";
import { ContentStudioClient } from "@/components/dashboard/content-studio-client";

export default async function ContentStudioPage() {
  const [content, recommendations] = await Promise.all([generateContent(), fetchRecommendations()]);

  return (
    <DashboardShell activePath="/content-studio">
      <ContentStudioClient content={content} recommendations={recommendations} />
    </DashboardShell>
  );
}
