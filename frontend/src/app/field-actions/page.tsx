import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchAnalyticsSummary, fetchFieldActions } from "@/services/api";
import { FieldActionsClient } from "@/components/dashboard/field-actions-client";

export default async function FieldActionsPage() {
  const [fieldActions, analytics] = await Promise.all([fetchFieldActions(), fetchAnalyticsSummary()]);

  return (
    <DashboardShell activePath="/field-actions">
      <FieldActionsClient fieldActions={fieldActions} analytics={analytics} />
    </DashboardShell>
  );
}
