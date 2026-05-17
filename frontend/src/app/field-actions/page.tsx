import { ClipboardList, Download, PackageCheck, Store, UsersRound } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { KpiStatCard } from "@/components/cards/kpi-stat-card";
import { OperationalTable } from "@/components/tables/operational-table";
import { SegmentEngagementChart } from "@/components/charts/segment-engagement-chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchAnalyticsSummary, fetchFieldActions } from "@/services/api";

export default async function FieldActionsPage() {
  const [fieldActions, analytics] = await Promise.all([fetchFieldActions(), fetchAnalyticsSummary()]);

  return (
    <DashboardShell activePath="/field-actions">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-muted">Field Execution</p>
            <h1 className="mt-1 text-[22px] font-semibold leading-7 text-foreground">Territory deployment plan for reps and retailers</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              The approved advisory becomes a territory-ready work queue with due dates, retailer coverage checks, stock gates, and exportable rep briefs.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button>
              <Download className="h-4 w-4" />
              Export Rep Brief
            </Button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <KpiStatCard label="Field Work Orders" value={analytics.kpis.field_actions.toString()} trend="due by Feb 18" metadata="rep-owned" icon={ClipboardList} tone="ai" />
          <KpiStatCard label="Stock-Ready Retailers" value={analytics.kpis.stock_ready_retailers.toString()} trend="18 days cover" metadata="Kanpur cluster" icon={Store} tone="success" />
          <KpiStatCard label="Target Growers" value={analytics.kpis.target_growers.toLocaleString()} trend="high receptivity" metadata="wheat cohort" icon={UsersRound} tone="field" />
          <KpiStatCard label="Stock Gate" value="Pass" trend="no launch block" metadata="Tilt 250 EC" icon={PackageCheck} tone="success" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <DashboardCard>
            <SectionHeader icon={ClipboardList} title="Rep Territory Board" description="A dense deployment queue for territory execution." />
            <div className="mt-5">
              <OperationalTable actions={fieldActions.actions} />
            </div>
          </DashboardCard>

          <div className="grid gap-5">
            <DashboardCard>
              <SectionHeader icon={PackageCheck} title="Retailer Coverage Alerts" description="Grower demand is gated by available local stock." />
              <div className="mt-5 space-y-3">
                <RetailerAlert label="RTL_0091 | Kanpur wheat cluster" status="Stock sufficient" note="Confirm Tilt 250 EC display before Hindi advisory push." />
                <RetailerAlert label="RTL_0112 | T023 village route" status="Stock sufficient" note="Prepare rep talking points and grower inquiry log." />
                <RetailerAlert label="Sikar mustard stock gate" status="Hold outreach" note="Score 250 EC stock cover is below territory threshold." warning />
              </div>
            </DashboardCard>
            <DashboardCard>
              <SectionHeader icon={UsersRound} title="Grower Cohort Engagement" description="Predicted outcomes versus baseline." />
              <div className="mt-5 h-[240px]">
                <SegmentEngagementChart />
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </DashboardShell>
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
