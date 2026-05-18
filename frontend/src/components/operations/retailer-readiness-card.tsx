import { MapPinned, PackageCheck, Store } from "lucide-react";
import type { InventoryAlert } from "@/types/contracts";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Badge } from "@/components/ui/badge";

export function RetailerReadinessCard({ alerts }: { alerts: InventoryAlert[] }) {
  const alert = alerts[0];
  const coverPct = Math.min(100, Math.round((alert.stock_cover_days / 21) * 100));

  return (
    <DashboardCard>
      <SectionHeader icon={Store} title="Retailer Coverage Signals" description="Grower demand is gated by district stock sufficiency and cluster coverage." />
      <div className="enterprise-inset mt-4 rounded-[18px] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{alert.product}</p>
            <p className="mt-1 text-xs text-muted">{alert.affected_retailers} retailers covering Kanpur village clusters</p>
          </div>
          <Badge variant={alert.stock_status === "healthy" ? "success" : "warning"}>{alert.stock_status}</Badge>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span>Stock sufficiency cover</span>
            <span>{alert.stock_cover_days} days</span>
          </div>
        <div className="mt-2 h-2 rounded-full bg-[#E8EEE9]">
            <div className="h-2 rounded-full bg-field" style={{ width: `${coverPct}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <ReadinessMetric label="Covered clusters" value="14" />
        <ReadinessMetric label="Stock gate flags" value="1" />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-[18px] border border-field/20 bg-[#DDEADF]/70 px-4 py-3 text-xs font-medium text-[#0B5B34]">
        <PackageCheck className="h-4 w-4" />
        Deployment allowed: retailer stock exceeds territory threshold.
      </div>
      <div className="enterprise-inset mt-3 flex items-center gap-2 rounded-[18px] px-4 py-3 text-xs font-medium text-muted">
        <MapPinned className="h-4 w-4 text-field" />
        Cluster focus: Kanpur Nagar T023, top wheat villages first.
      </div>
    </DashboardCard>
  );
}

function ReadinessMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="enterprise-inset rounded-[16px] px-3 py-2">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
