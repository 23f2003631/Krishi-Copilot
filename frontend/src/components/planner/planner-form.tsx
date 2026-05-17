"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CampaignContextRequest, Channel, Crop, DeviceType, Language, Objective, Scenario } from "@/types/contracts";
import { createCampaignContext } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const channels: Channel[] = ["whatsapp", "sms", "field_rep"];

export function PlannerForm({ scenarios }: { scenarios: Scenario[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [scenarioId, setScenarioId] = useState("WHEAT_UP_FLOWERING_RISK");
  const [language, setLanguage] = useState<Language>("Hindi");
  const [deviceType, setDeviceType] = useState<DeviceType>("smartphone");
  const [objective, setObjective] = useState<Objective>("lead_generation");

  const selected = useMemo(
    () => scenarios.find((scenario) => scenario.scenario_id === scenarioId) ?? scenarios[0],
    [scenarioId, scenarios]
  );

  const product = selected.crop === "mustard" ? "Score 250 EC" : selected.crop === "potato" ? "Kavach 75 WP" : "Tilt 250 EC";

  function submitPlanner() {
    const request: CampaignContextRequest = {
      scenario_id: selected.scenario_id,
      crop: selected.crop as Crop,
      product,
      objective,
      week_start_date: "2026-02-16",
      geography: selected.geography,
      audience: {
        languages: [language],
        device_types: [deviceType],
        max_target_count: selected.crop === "mustard" ? 980 : 1180
      },
      channel_preferences: selected.crop === "mustard" ? ["field_rep", "retailer"] : channels,
      constraints: {
        low_bandwidth: true,
        human_review_required: true,
        min_stock_cover_days: 10
      }
    };

    startTransition(async () => {
      const response = await createCampaignContext(request);
      localStorage.setItem("syngenta_context_id", response.context_id);
      localStorage.setItem("syngenta_scenario_id", selected.scenario_id);
      router.push(`/recommendations?context_id=${response.context_id}`);
    });
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <PlannerSelect label="Scenario" value={scenarioId} onChange={setScenarioId}>
          {scenarios.map((scenario) => (
            <option key={scenario.scenario_id} value={scenario.scenario_id}>
              {scenario.name}
            </option>
          ))}
        </PlannerSelect>
        <PlannerField label="Product" value={product} />
        <PlannerField label="Region" value={`${selected.geography.district}, ${selected.geography.state}`} />
        <PlannerSelect label="Objective" value={objective} onChange={(value) => setObjective(value as Objective)}>
          <option value="lead_generation">Grower inquiry</option>
          <option value="retailer_sellthrough">Retailer sell-through</option>
          <option value="field_visit">Field visit</option>
        </PlannerSelect>
        <PlannerSelect label="Language" value={language} onChange={(value) => setLanguage(value as Language)}>
          <option value="Hindi">Hindi</option>
          <option value="Bengali">Bengali</option>
          <option value="English">English</option>
        </PlannerSelect>
        <PlannerSelect label="Device" value={deviceType} onChange={(value) => setDeviceType(value as DeviceType)}>
          <option value="smartphone">Smartphone</option>
          <option value="keypad">Keypad</option>
          <option value="unknown">Unknown</option>
        </PlannerSelect>
      </div>

      <div className="rounded-[18px] border border-border bg-card-soft p-4">
        <div className="flex items-center justify-between text-xs font-medium text-muted">
          <span>Deployment gates passed</span>
          <span>{selected.stock_status === "low" ? "3 / 4" : "4 / 4"}</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {["Crop stage", "Stock", "Weather", "Language"].map((gate) => (
            <div key={gate} className="rounded-[12px] border border-field/20 bg-field/10 px-2 py-2 text-center text-[11px] font-semibold text-lime">
              {gate}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="soft">Human review required</Badge>
        <Badge variant="soft">Low-bandwidth safe</Badge>
        <Badge variant={selected.stock_status === "low" ? "danger" : "soft"}>Stock gate: {selected.stock_status}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={submitPlanner} disabled={isPending}>
          {isPending ? "Creating context..." : "Rank Campaign Windows"}
        </Button>
        <Button asChild variant="secondary">
          <a href="/field-actions?scenario=blocked-stock">Preview stock gate</a>
        </Button>
      </div>
    </div>
  );
}

function PlannerField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-border bg-card-soft px-3 py-2.5">
      <p className="text-[11px] font-medium text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-foreground">{value}</p>
    </div>
  );
}

function PlannerSelect({
  children,
  label,
  onChange,
  value
}: {
  children: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="rounded-[16px] border border-border bg-card-soft px-3 py-2.5">
      <span className="text-[11px] font-medium text-muted">{label}</span>
      <select
        className="mt-1 w-full border-0 bg-transparent text-sm font-semibold leading-5 text-foreground outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
