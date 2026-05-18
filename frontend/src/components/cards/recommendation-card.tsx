"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarClock, UserRoundCheck } from "lucide-react";
import type { Recommendation } from "@/types/contracts";
import { formatPercent } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/cards/risk-badge";
import { useRole } from "@/lib/contexts/RoleContext";
import { ExplainabilityBadge } from "@/components/ui/explainability-badge";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { cn } from "@/lib/utils";

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const { roleConfig } = useRole();

  const getCardBorder = () => {
    if (recommendation.blocked) return "border-rose-200 bg-rose-50/30";
    if (recommendation.timing.urgency === "high") return "border-[#B7D8C3]/70 bg-[#DDEADF]/40";
    return "border-border bg-card-soft";
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn("rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_38px_rgba(31,56,88,0.08)]", getCardBorder())}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-olive px-3 py-1 text-xs font-semibold text-white">{recommendation.priority_score}</span>
            <RiskBadge level={recommendation.timing.urgency} />
            {recommendation.blocked ? <Badge variant="danger">Blocked by guardrail</Badge> : <Badge variant="success">Launch-ready</Badge>}
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">{recommendation.segment_label}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            {recommendation.product} / {recommendation.target_count.toLocaleString()} growers / expected leads {recommendation.expected_impact.expected_leads}
          </p>
        </div>
        <Button variant={recommendation.blocked ? "secondary" : "default"} size="sm">
          {recommendation.blocked ? "Review stock" : "Use recommendation"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <MiniMetric label="Advisory open probability" value={formatPercent(recommendation.receptivity.open_probability)} barValue={recommendation.receptivity.open_probability} />
        <MiniMetric label="Grower response probability" value={formatPercent(recommendation.receptivity.click_probability)} barValue={recommendation.receptivity.click_probability} />
        <MiniMetric label="Recommendation confidence" value={formatPercent(recommendation.receptivity.confidence)} barValue={recommendation.receptivity.confidence} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[18px] border border-border bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarClock className="h-4 w-4 text-warning" />
            Crop window timing
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">
            Send on {recommendation.timing.recommended_send_date}, window {recommendation.timing.send_window}
          </p>
        </div>
        <div className="rounded-[18px] border border-border bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserRoundCheck className="h-4 w-4 text-field" />
            Agronomic rationale
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {recommendation.reason_codes.map((reason) => (
              <ExplainabilityBadge 
                key={reason} 
                type={roleConfig.explainabilityFocus} 
                value={reason} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {recommendation.channel_strategy.map((channel) => (
          <Badge key={channel.channel} variant="outline">
            {channel.rank}. {channel.channel.replace("_", " ")} / {channel.reason}
          </Badge>
        ))}
      </div>
    </motion.article>
  );
}

function MiniMetric({ label, value, barValue }: { label: string; value: string; barValue?: number }) {
  return (
    <div className="rounded-[16px] border border-border bg-white px-4 py-3">
      <p className="text-[11px] font-medium text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      {barValue !== undefined && <ConfidenceBar value={barValue} size="sm" showValue={false} className="mt-1.5" />}
    </div>
  );
}
