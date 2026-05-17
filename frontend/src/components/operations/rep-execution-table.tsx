import { ClipboardList } from "lucide-react";
import type { FieldAction } from "@/types/contracts";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Badge } from "@/components/ui/badge";

export function RepExecutionTable({ actions }: { actions: FieldAction[] }) {
  return (
    <DashboardCard>
      <SectionHeader icon={ClipboardList} title="Territory Field Execution" description="Rep ownership, village cluster, weather dependency, and stock gate for the deployment window." />
      <div className="mt-4 overflow-hidden rounded-[18px] border border-border bg-white">
        <div className="grid grid-cols-[0.8fr_0.9fr_1.55fr_1fr_0.75fr] bg-card-soft px-4 py-3 text-[11px] font-semibold uppercase text-muted">
          <span>Field owner</span>
          <span>Territory gate</span>
          <span>Deployment action</span>
          <span>Cluster signal</span>
          <span>Readiness</span>
        </div>
        <div className="divide-y divide-border">
          {actions.slice(0, 3).map((action, index) => (
            <div key={action.action_id} className="grid grid-cols-[0.8fr_0.9fr_1.55fr_1fr_0.75fr] gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-foreground">{action.rep_id}</p>
                <p className="text-[11px] text-muted">owner marker</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{action.territory_id}</p>
                <p className="text-[11px] text-muted">{action.due_date}</p>
              </div>
              <p className="text-xs leading-5 text-muted">{action.summary}</p>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">{index === 0 ? "Kanpur T023 wheat" : index === 1 ? "Non-opener villages" : "Sikar stock gate"}</p>
                <p className="text-[11px] text-muted">{index === 2 ? "replenish before grower blast" : "flowering + humidity watch"}</p>
              </div>
              <Badge variant={action.priority === "high" ? "danger" : "warning"}>{action.priority}</Badge>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
