"use client";

import { ClipboardList, PackageCheck, Store, UsersRound, AlertTriangle, CloudRain, Target } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { KpiStatCard } from "@/components/cards/kpi-stat-card";
import { OperationalTable } from "@/components/tables/operational-table";
import { SegmentEngagementChart } from "@/components/charts/segment-engagement-chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/lib/contexts/RoleContext";
import { OperationalAlertBanner } from "@/components/ui/operational-alert-banner";
import { ExportButton } from "@/components/actions/export-button";

export function FieldActionsClient({ fieldActions, analytics }: any) {
  const { role, roleConfig } = useRole();
  const actions = fieldActions?.actions ?? [];
  const highPriority = actions.filter((action: any) => action.priority === "high").length;
  const stockCoverDays = analytics?.kpis?.stock_cover_days ?? 0;
  const stockReadyRetailers = analytics?.kpis?.stock_ready_retailers ?? 0;
  const targetGrowers = analytics?.kpis?.target_growers ?? 0;
  const expectedLeads = analytics?.kpis?.expected_leads ?? 0;

  const renderKpis = () => {
    switch (role) {
      case "Campaign Manager":
        return (
          <>
            <KpiStatCard label="Field Work Orders" value={actions.length.toString()} trend="from visit logs" metadata="rep-owned" icon={ClipboardList} tone="ai" />
            <KpiStatCard label="Stock-Ready Retailers" value={stockReadyRetailers.toString()} trend={`${stockCoverDays} days cover`} metadata="inventory/POS" icon={Store} tone="success" />
            <KpiStatCard label="Target Growers" value={targetGrowers.toLocaleString()} trend="processed cohort" metadata="feature table" icon={UsersRound} tone="field" />
            <KpiStatCard label="Stock Gate" value={stockCoverDays >= 10 ? "Pass" : "Hold"} trend={stockCoverDays >= 10 ? "no launch block" : "below threshold"} metadata="stock guardrail" icon={PackageCheck} tone={stockCoverDays >= 10 ? "success" : "warning"} />
          </>
        );
      case "Territory Manager":
        return (
          <>
            <KpiStatCard label="Territory Coverage" value={actions.length.toString()} trend="assigned reps" metadata="current plan" icon={ClipboardList} tone="success" />
            <KpiStatCard label="Blocked Tasks" value={highPriority.toString()} trend="high priority" metadata="needs routing" icon={AlertTriangle} tone={highPriority ? "warning" : "success"} />
            <KpiStatCard label="Retailer Readiness" value={stockReadyRetailers.toString()} trend={`${stockCoverDays} days cover`} metadata="inventory/POS" icon={Store} tone="ai" />
            <KpiStatCard label="Expected Lift" value={expectedLeads.toString()} trend="inquiries" metadata="cohort proxy" icon={UsersRound} tone="field" />
          </>
        );
      case "Field Representative":
        return (
          <>
            <KpiStatCard label="My Assigned Tasks" value={actions.length.toString()} trend="priority queue" metadata="due this week" icon={ClipboardList} tone="ai" />
            <KpiStatCard label="Urgent Visits" value={highPriority.toString()} trend="field priority" metadata="high focus" icon={Target} tone={highPriority ? "warning" : "success"} />
            <KpiStatCard label="Weather Delay" value={analytics?.charts?.weekly_funnel?.length ? "0" : "N/A"} trend="from weather signal" metadata="route check" icon={CloudRain} tone="success" />
            <KpiStatCard label="Retailer Status" value={stockCoverDays >= 10 ? "Ready" : "Hold"} trend={`${stockCoverDays} days cover`} metadata="stock confirmed" icon={Store} tone="field" />
          </>
        );
      case "Retailer Support":
        return (
          <>
            <KpiStatCard label="Critical Stockouts" value={stockCoverDays === 0 ? "1" : "0"} trend="stock guardrail" metadata={`${stockCoverDays} days cover`} icon={AlertTriangle} tone={stockCoverDays === 0 ? "warning" : "success"} />
            <KpiStatCard label="Replenishment" value={stockCoverDays < 10 ? "Needed" : "Not needed"} trend="dispatch decision" metadata="inventory/POS" icon={PackageCheck} tone="field" />
            <KpiStatCard label="Affected Tasks" value={highPriority.toString()} trend="priority reps" metadata="territory hold" icon={ClipboardList} tone="ai" />
            <KpiStatCard label="Coverage Gap" value={String(Math.max(0, actions.length - stockReadyRetailers))} trend="retailer actions" metadata="monitoring" icon={Store} tone="success" />
          </>
        );
      default:
        return null;
    }
  };

  const getEmptyState = () => {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-[18px] border border-dashed border-border bg-card-soft text-center px-6">
        <ClipboardList className="h-8 w-8 text-muted mb-3 opacity-50" />
        <p className="text-sm font-medium text-foreground">{roleConfig.emptyStates.actions}</p>
        <p className="text-xs text-muted mt-1 max-w-xs">Enjoy the rest of your day, or switch context to another territory.</p>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <OperationalAlertBanner />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-muted">Field Execution</p>
          <h1 className="mt-1 text-[22px] font-semibold leading-7 text-foreground">
            {role === "Field Representative" ? "My Priority Work Queue" : "Territory deployment plan for reps and retailers"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {role === "Field Representative" 
              ? "Your daily assigned agronomic outreach and follow-up activities, prioritized by AI score."
              : "The approved advisory becomes a territory-ready work queue with due dates, retailer coverage checks, stock gates, and exportable rep briefs."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {(role === "Campaign Manager" || role === "Territory Manager") && (
            <>
              <ExportButton label="Export CSV" planId={fieldActions.plan_id} type="csv" />
              <ExportButton label="Export Rep Brief" planId={fieldActions.plan_id} type="rep_brief" />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {renderKpis()}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardCard>
          <SectionHeader 
            icon={ClipboardList} 
            title={role === "Field Representative" ? "My Task Board" : "Rep Territory Board"} 
            description={role === "Field Representative" ? "Action items assigned to you." : "A dense deployment queue for territory execution."} 
          />
          <div className="mt-5">
            {/* Demonstrate empty states for Retailer Support since they shouldn't see rep tasks normally */}
            {role === "Retailer Support" ? getEmptyState() : <OperationalTable actions={actions} />}
          </div>
        </DashboardCard>

        <div className="grid gap-5">
          <DashboardCard id="retailer-alerts">
            <SectionHeader icon={PackageCheck} title="Retailer Coverage Alerts" description={role === "Retailer Support" ? "Active inventory signals and escalations." : "Grower demand is gated by available local stock."} />
            <div className="mt-5 space-y-3">
              {actions.slice(0, 3).map((action: any) => (
                <RetailerAlert
                  key={action.action_id}
                  label={`${action.territory_id} | ${action.retailer_ids?.[0] ?? "retailer route"}`}
                  status={action.priority === "high" ? "Action needed" : "Ready"}
                  note={action.summary}
                  warning={action.priority === "high"}
                />
              ))}
              {!actions.length && <RetailerAlert label="No active retailer alerts" status="Clear" note="No field action rows returned for the active plan." />}
            </div>
            {role === "Retailer Support" && (
              <Button className="mt-4 w-full" variant="secondary">{roleConfig.primaryAction}</Button>
            )}
          </DashboardCard>
          
          {(role === "Campaign Manager" || role === "Territory Manager") && (
            <DashboardCard>
              <SectionHeader icon={UsersRound} title="Grower Cohort Engagement" description="Predicted outcomes versus baseline." />
              <div className="mt-5 h-[240px]">
                <SegmentEngagementChart data={analytics?.charts?.engagement_funnel ?? []} />
              </div>
            </DashboardCard>
          )}
        </div>
      </div>
    </div>
  );
}

function RetailerAlert({ label, status, note, warning }: { label: string; status: string; note: string; warning?: boolean }) {
  return (
    <div className="rounded-[18px] border border-border bg-card-soft px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <Badge variant={warning ? "warning" : "success"}>{status}</Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">{note}</p>
    </div>
  );
}
