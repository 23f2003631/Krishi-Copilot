import { CloudRain } from "lucide-react";
import type { RiskLevel } from "@/types/contracts";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { RiskBadge } from "@/components/cards/risk-badge";

export function WeatherAlertCard({
  title,
  description,
  riskLevel,
  confidence
}: {
  title: string;
  description: string;
  riskLevel: RiskLevel;
  confidence: number;
}) {
  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white text-cyan">
            <CloudRain className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h3 className="text-base font-semibold capitalize text-foreground">{title.replace("_", " ")}</h3>
            <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
          </div>
        </div>
        <RiskBadge level={riskLevel} />
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-medium text-muted">
          <span>Confidence</span>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-[#e8eef0]">
          <div className="h-2 rounded-full bg-cyan" style={{ width: `${confidence * 100}%` }} />
        </div>
      </div>
    </DashboardCard>
  );
}

