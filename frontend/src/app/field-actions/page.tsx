import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchAnalyticsSummary, fetchFieldActions } from "@/services/api";
import { FieldActionsClient } from "@/components/dashboard/field-actions-client";

export const dynamic = "force-dynamic";

export default async function FieldActionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan_id?: string }>;
}) {
  const resolvedParams = (await searchParams) || {};
  const planId = resolvedParams.plan_id || "PLAN_001";
  const [fieldActions, analytics] = await Promise.all([fetchFieldActions(planId), fetchAnalyticsSummary(planId)]);

  return (
    <DashboardShell activePath="/field-actions">
      <FieldActionsClient fieldActions={fieldActions} analytics={analytics} />
    </DashboardShell>
  );
}
