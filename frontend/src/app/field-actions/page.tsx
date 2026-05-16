import { ClipboardList, Download, PackageCheck, Store, UsersRound } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { KpiStatCard } from "@/components/cards/kpi-stat-card";
import { OperationalTable } from "@/components/tables/operational-table";
import { SegmentEngagementChart } from "@/components/charts/segment-engagement-chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAnalyticsSummary, getFieldActions } from "@/services/mock-api";

export default async function FieldActionsPage() {
  const [fieldActions, analytics] = await Promise.all([getFieldActions(), getAnalyticsSummary()]);

  return (
    <DashboardShell activePath="/field-actions">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-muted">Field Actions</p>
            <h1 className="mt-1 text-[22px] font-semibold leading-7 text-foreground">Operational plan for reps and retailers</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              The approved campaign becomes a field-ready work queue with due dates, retailer checks, success metrics, and exportable briefs.
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
          <KpiStatCard label="Field Actions" value={analytics.kpis.field_actions.toString()} trend="Due by Feb 18" icon={ClipboardList} tone="ai" />
          <KpiStatCard label="Stock-Ready Retailers" value={analytics.kpis.stock_ready_retailers.toString()} trend="18 days cover" icon={Store} tone="success" />
          <KpiStatCard label="Target Growers" value={analytics.kpis.target_growers.toLocaleString()} trend="High receptivity" icon={UsersRound} tone="field" />
          <KpiStatCard label="Inventory Guardrail" value="Pass" trend="No launch block" icon={PackageCheck} tone="success" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <DashboardCard>
            <SectionHeader icon={ClipboardList} title="Rep Action Board" description="A dense work queue for territory execution." />
            <div className="mt-5">
              <OperationalTable actions={fieldActions.actions} />
            </div>
          </DashboardCard>

          <div className="grid gap-5">
            <DashboardCard>
              <SectionHeader icon={PackageCheck} title="Retailer Alerts" description="Demand generation is gated by available local stock." />
              <div className="mt-5 space-y-3">
                <RetailerAlert label="RTL_0091" status="Healthy stock" note="Confirm Tilt 250 EC display before WhatsApp push." />
                <RetailerAlert label="RTL_0112" status="Healthy stock" note="Prepare field-rep talking points and lead log." />
                <RetailerAlert label="Sikar mustard scenario" status="Hold campaign" note="Score 250 EC stock cover is below threshold." warning />
              </div>
            </DashboardCard>
            <DashboardCard>
              <SectionHeader icon={UsersRound} title="Segment Engagement" description="Predicted outcomes versus baseline." />
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

