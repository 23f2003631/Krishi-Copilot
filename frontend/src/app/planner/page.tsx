import Link from "next/link";
import { CloudRain, Languages, Leaf, MapPin, PackageCheck, Smartphone } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AiInsightBanner } from "@/components/insights/ai-insight-banner";
import { KpiStatCard } from "@/components/cards/kpi-stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { RiskBadge } from "@/components/cards/risk-badge";
import { SegmentCard } from "@/components/cards/segment-card";
import { WeatherAlertCard } from "@/components/cards/weather-alert-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCampaignContext, getScenarios } from "@/services/mock-api";

export default async function PlannerPage() {
  const [scenarios, context] = await Promise.all([getScenarios(), getCampaignContext()]);
  const scenario = scenarios[0];

  return (
    <DashboardShell activePath="/planner">
      <div className="space-y-5">
        <AiInsightBanner
          title="Campaign window detected"
          description="Wheat growers in Kanpur Nagar are close to flowering, humidity risk is rising, and stock cover is above launch threshold."
          actionLabel="View Detail"
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <KpiStatCard label="High Priority Segments" value="12" trend="+3 vs last week" icon={Leaf} tone="ai" />
          <KpiStatCard label="Expected Leads" value="69" trend="+60% vs baseline" icon={Languages} tone="field" />
          <KpiStatCard label="Inventory Readiness" value="86%" trend="6 retailers ready" icon={PackageCheck} tone="success" />
          <KpiStatCard label="Weather Risk" value="High" trend="Humidity + rain" icon={CloudRain} tone="warning" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <DashboardCard>
            <SectionHeader
              icon={MapPin}
              title="Campaign Planner"
              description="Define the context Syngenta should evaluate before launching a grower campaign."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <PlannerField label="Crop" value="Wheat" />
              <PlannerField label="Product" value="Tilt 250 EC" />
              <PlannerField label="State / District" value="Uttar Pradesh / Kanpur Nagar" />
              <PlannerField label="Week" value="2026-02-16" />
              <PlannerField label="Objective" value="Lead generation" />
              <PlannerField label="Audience" value="Smartphone + keypad growers" />
              <PlannerField label="Primary language" value="Hindi" />
              <PlannerField label="Preferred channels" value="WhatsApp, SMS, field rep" />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge variant="soft">Human review required</Badge>
              <Badge variant="soft">Low-bandwidth safe</Badge>
              <Badge variant="soft">Minimum stock cover: 10 days</Badge>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/recommendations?context_id=CTX_001">Generate Recommendations</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/field-actions?scenario=blocked-stock">Preview blocked stock case</Link>
              </Button>
            </div>
          </DashboardCard>

          <div className="grid gap-5">
            <DashboardCard>
              <SectionHeader icon={Smartphone} title="Context Summary" description="The control room combines grower, device, crop, weather, and stock signals." />
              <div className="mt-5 grid gap-3">
                <SegmentCard label="Estimated growers" value={context.grower_summary.estimated_growers.toLocaleString()} caption="Within selected district and crop window" />
                <SegmentCard label="Smartphone share" value={`${Math.round(context.grower_summary.smartphone_share * 100)}%`} caption="WhatsApp eligible first touch" />
                <SegmentCard label="Keypad share" value={`${Math.round(context.grower_summary.keypad_share * 100)}%`} caption="SMS or IVR fallback" />
              </div>
            </DashboardCard>

            <WeatherAlertCard
              riskLevel={context.weather_insights[0].risk_level}
              title={context.weather_insights[0].risk_type}
              description={context.weather_insights[0].summary}
              confidence={context.weather_insights[0].confidence}
            />
          </div>
        </div>

        <DashboardCard>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-muted">Selected hero scenario</p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">{scenario.name}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">{scenario.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <RiskBadge level="high" />
              <Badge variant="outline">Stock cover: 18 days</Badge>
              <Badge variant="outline">Hindi primary</Badge>
            </div>
          </div>
        </DashboardCard>
      </div>
    </DashboardShell>
  );
}

function PlannerField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-border bg-card-soft px-4 py-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

