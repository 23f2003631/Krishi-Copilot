import { Store } from "lucide-react";
import type { InventoryAlert } from "@/types/contracts";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { OperationalPanel } from "@/components/dashboard/operational-panel";

export function RetailerReadinessCard({ alerts }: { alerts: InventoryAlert[] }) {
  const alert = alerts[0] ?? {
    product: "Fortenza",
    stock_status: "healthy",
    stock_cover_days: 12,
    affected_retailers: 8,
  };
  const stockPct = Math.min(100, Math.max(0, Math.round((alert.stock_cover_days / 14) * 100)));

  return (
    <DashboardCard className="min-h-[220px] p-5">
      <div className="flex items-center gap-2">
        <Store className="h-4 w-4 text-[#0B5B34]" />
        <h3 className="text-[15px] font-semibold text-[#08110C]">Retailer Readiness</h3>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-end justify-between gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5D6B62]">Current Stock</span>
          <span className="text-[16px] font-semibold text-[#08110C]">{stockPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#D7E1DA]">
          <div className="h-full rounded-full bg-[#0D7A43]" style={{ width: `${stockPct}%` }} />
        </div>
      </div>
      <OperationalPanel className="mt-5 flex items-center justify-between rounded-[12px]">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5D6B62]">Coverage</span>
        <span className="text-[13px] font-semibold text-[#08110C]">{alert.stock_cover_days} Days</span>
      </OperationalPanel>
      <p className="mt-4 text-[12px] leading-5 text-[#5D6B62]">
        {alert.affected_retailers} retailers clear for {alert.product} deployment.
      </p>
    </DashboardCard>
  );
}
