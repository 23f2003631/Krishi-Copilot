import { CloudRain, Droplets, ThermometerSun, Waves } from "lucide-react";
import type { WeatherInsight } from "@/types/contracts";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { RiskIntensityBadge } from "@/components/cards/risk-intensity-badge";

export function WeatherTriggerPanel({ insight }: { insight: WeatherInsight }) {
  return (
    <DashboardCard>
      <SectionHeader icon={CloudRain} title="Agronomic Weather Trigger" description="Humidity, rainfall, and crop stage translated into advisory timing." />
      <div className="mt-4 rounded-[18px] border border-[#d8ad4d]/30 bg-[#fff8e7] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold capitalize text-foreground">Flowering disease-weather window</p>
            <p className="mt-1 text-xs leading-5 text-muted">{insight.summary}</p>
          </div>
          <RiskIntensityBadge level={insight.risk_level} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Trigger icon={Droplets} label="Humidity" value="78%" />
        <Trigger icon={CloudRain} label="Rainfall" value="Light" />
        <Trigger icon={ThermometerSun} label="Canopy stress" value="Watch" />
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-border bg-white px-4 py-3">
        <Waves className="h-5 w-5 text-cyan" />
        <div>
          <p className="text-xs font-semibold text-foreground">Crop-stage activation rule</p>
          <p className="text-[11px] leading-4 text-muted">Disease advisory priority rises when flowering, humidity, and light rain align in the same territory week.</p>
        </div>
      </div>
    </DashboardCard>
  );
}

function Trigger({ icon: Icon, label, value }: { icon: typeof CloudRain; label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-border bg-white px-3 py-2 text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-warning" />
      <p className="mt-1 text-[11px] text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
