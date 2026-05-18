"use client";

import { ClipboardList, Download, PackageCheck, Store, UsersRound, AlertTriangle, CloudRain, Target } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { KpiStatCard } from "@/components/cards/kpi-stat-card";
import { OperationalTable } from "@/components/tables/operational-table";
import { SegmentEngagementChart } from "@/components/charts/segment-engagement-chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/lib/contexts/RoleContext";
import { OperationalAlertBanner } from "@/components/ui/operational-alert-banner";

export function FieldActionsClient({ fieldActions, analytics }: any) {
  const { role, roleConfig } = useRole();

  const renderKpis = () => {
    switch (role) {
      case "Campaign Manager":
        return (
          <>
            <KpiStatCard label="Field Work Orders" value={analytics.kpis.field_actions.toString()} trend="due by Feb 18" metadata="rep-owned" icon={ClipboardList} tone="ai" />
            <KpiStatCard label="Stock-Ready Retailers" value={analytics.kpis.stock_ready_retailers.toString()} trend="18 days cover" metadata="Kanpur cluster" icon={Store} tone="success" />
            <KpiStatCard label="Target Growers" value={analytics.kpis.target_growers.toLocaleString()} trend="high receptivity" metadata="wheat cohort" icon={UsersRound} tone="field" />
            <KpiStatCard label="Stock Gate" value="Pass" trend="no launch block" metadata="Tilt 250 EC" icon={PackageCheck} tone="success" />
          </>
        );
      case "Territory Manager":
        return (
          <>
            <KpiStatCard label="Territory Coverage" value="92%" trend="assigned" metadata="reps deployed" icon={ClipboardList} tone="success" />
            <KpiStatCard label="Blocked Tasks" value="2" trend="weather risk" metadata="needs routing" icon={AlertTriangle} tone="warning" />
            <KpiStatCard label="Retailer Readiness" value={analytics.kpis.stock_ready_retailers.toString()} trend="stock cover" metadata="Kanpur cluster" icon={Store} tone="ai" />
            <KpiStatCard label="Expected Lift" value={analytics.kpis.expected_leads.toString()} trend="inquiries" metadata="cohort proxy" icon={UsersRound} tone="field" />
          </>
        );
      case "Field Representative":
        return (
          <>
            <KpiStatCard label="My Assigned Tasks" value="18" trend="priority queue" metadata="due this week" icon={ClipboardList} tone="ai" />
            <KpiStatCard label="Urgent Visits" value="5" trend="disease risk" metadata="high focus" icon={Target} tone="warning" />
            <KpiStatCard label="Weather Delay" value="0" trend="clear conditions" metadata="safe to travel" icon={CloudRain} tone="success" />
            <KpiStatCard label="Retailer Status" value="Ready" trend="Tilt 250 EC" metadata="stock confirmed" icon={Store} tone="field" />
          </>
        );
      case "Retailer Support":
        return (
          <>
            <KpiStatCard label="Critical Stockouts" value="1" trend="Tilt 250 EC" metadata="Kanpur Nagar" icon={AlertTriangle} tone="warning" />
            <KpiStatCard label="Replenishment" value="Pending" trend="dispatch requested" metadata="48h ETA" icon={PackageCheck} tone="field" />
            <KpiStatCard label="Affected Tasks" value="4" trend="blocked reps" metadata="territory hold" icon={ClipboardList} tone="ai" />
            <KpiStatCard label="Coverage Gap" value="12%" trend="regional impact" metadata="monitoring" icon={Store} tone="success" />
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
              <Button variant="secondary">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Rep Brief
              </Button>
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
            {role === "Retailer Support" ? getEmptyState() : <OperationalTable actions={fieldActions.actions} />}
          </div>
        </DashboardCard>

        <div className="grid gap-5">
          <DashboardCard>
            <SectionHeader icon={PackageCheck} title="Retailer Coverage Alerts" description={role === "Retailer Support" ? "Active inventory signals and escalations." : "Grower demand is gated by available local stock."} />
            <div className="mt-5 space-y-3">
              <RetailerAlert label="RTL_0091 | Kanpur wheat cluster" status={role === "Retailer Support" ? "Resolving" : "Stock sufficient"} note="Confirm Tilt 250 EC display before Hindi advisory push." />
              <RetailerAlert label="RTL_0112 | T023 village route" status="Stock sufficient" note="Prepare rep talking points and grower inquiry log." />
              {(role === "Retailer Support" || role === "Territory Manager") && (
                <RetailerAlert label="Sikar mustard stock gate" status="Hold outreach" note="Score 250 EC stock cover is below territory threshold." warning />
              )}
            </div>
            {role === "Retailer Support" && (
              <Button className="mt-4 w-full" variant="secondary">{roleConfig.primaryAction}</Button>
            )}
          </DashboardCard>
          
          {(role === "Campaign Manager" || role === "Territory Manager") && (
            <DashboardCard>
              <SectionHeader icon={UsersRound} title="Grower Cohort Engagement" description="Predicted outcomes versus baseline." />
              <div className="mt-5 h-[240px]">
                <SegmentEngagementChart />
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
