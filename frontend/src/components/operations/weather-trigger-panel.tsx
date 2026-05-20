import { CloudRain } from "lucide-react";
import type { WeatherInsight } from "@/types/contracts";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

export function WeatherTriggerPanel({ insight }: { insight: WeatherInsight }) {
  const risk = insight?.risk_level ?? "low";
  const title = risk === "high" ? "High Risk Trigger" : risk === "medium" ? "Weather Watch" : "No Active Trigger";

  return (
    <DashboardCard className="min-h-[220px] border-[#B4232A]/20 bg-[linear-gradient(145deg,#FFFFFF,#FFF8F8)] p-5">
      <div className="flex items-center gap-2">
        <CloudRain className="h-4 w-4 text-[#B4232A]" />
        <h3 className="text-[15px] font-semibold text-[#08110C]">Weather Trigger</h3>
      </div>
      <p className="mt-5 text-[13px] font-semibold text-[#B4232A]">
        {title}
      </p>
      <p className="mt-3 text-[13px] leading-6 text-[#35433A]">
        {insight?.summary ?? "No processed weather escalation is active for the selected crop window."}
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-[#B4232A]/10 pt-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5D6B62]">Confidence</span>
        <span className="text-[15px] font-semibold text-[#08110C]">
          {Math.round((insight?.confidence ?? 0) * 100)}%
        </span>
      </div>
    </DashboardCard>
  );
}
