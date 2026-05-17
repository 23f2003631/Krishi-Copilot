import Link from "next/link";
import { ArrowRight, BrainCircuit, Gauge, ShieldCheck } from "lucide-react";
import type { Recommendation } from "@/types/contracts";
import { AIReasoningChips } from "@/components/insights/ai-reasoning-chips";
import { RiskIntensityBadge } from "@/components/cards/risk-intensity-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AIRecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const confidence = Math.round(recommendation.receptivity.confidence * 100);

  return (
    <article className="rounded-[22px] border border-border bg-white p-4 shadow-[0_10px_32px_rgba(31,56,88,0.06)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Crop-stage next action</Badge>
            <RiskIntensityBadge level={recommendation.timing.urgency} label={`${recommendation.timing.urgency} agronomic urgency`} />
            <Badge variant={recommendation.blocked ? "danger" : "success"}>{recommendation.blocked ? "Stock gate hold" : "Deployment ready"}</Badge>
          </div>
          <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">{recommendation.segment_label}</h3>
          <p className="mt-1 text-sm leading-5 text-muted">
            {recommendation.product} | {recommendation.target_count.toLocaleString()} growers in cohort | {recommendation.timing.send_window}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-[16px] border border-border bg-card-soft px-3 py-2 text-right">
            <p className="text-[11px] font-medium text-muted">Deployment score</p>
            <p className="text-xl font-semibold text-foreground">{recommendation.priority_score}</p>
          </div>
          <Button asChild size="sm">
            <Link href="/content-studio">
              Draft advisory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Signal icon={BrainCircuit} label="Recommendation confidence" value={`${confidence}%`} />
        <Signal icon={Gauge} label="Grower response proxy" value={`${Math.round(recommendation.expected_impact.expected_click_rate * 100)}%`} />
        <Signal icon={ShieldCheck} label="Stock sufficiency gate" value={recommendation.blocked ? "Hold" : "Passed"} />
      </div>

      <div className="mt-4">
        <AIReasoningChips reasons={recommendation.reason_codes} />
      </div>
    </article>
  );
}

function Signal({ icon: Icon, label, value }: { icon: typeof BrainCircuit; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-border bg-card-soft px-3 py-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-field/10 text-field">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[11px] font-medium leading-4 text-muted">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

