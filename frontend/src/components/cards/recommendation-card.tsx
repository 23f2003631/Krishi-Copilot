"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarClock, UserRoundCheck, AlertTriangle, ShieldCheck } from "lucide-react";
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
    if (recommendation.blocked) return "border-rose-200 bg-rose-50/20";
    const status = recommendation.actionability_status;
    if (status === "Needs Human Review") return "border-amber-200 bg-amber-50/20";
    if (recommendation.timing.urgency === "high") return "border-[#B7D8C3]/70 bg-[#DDEADF]/40";
    return "border-border bg-card-soft";
  };

  const getActionabilityBadge = () => {
    const status = recommendation.actionability_status || (recommendation.blocked ? "Blocked" : "Ready to Execute");
    if (status === "Blocked") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
          Blocked
        </span>
      );
    }
    if (status === "Needs Human Review") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          Needs Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        Ready to Execute
      </span>
    );
  };

  // Safe check for confidence label fallback
  const confidenceLabel = recommendation.receptivity.confidence_label || 
    (typeof recommendation.receptivity.confidence === "string" ? recommendation.receptivity.confidence : "Medium");

  // Determine readiness display color
  const getReadinessColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-600";
    if (score >= 0.5) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <motion.article
      data-testid="recommendation-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn("rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_38px_rgba(31,56,88,0.08)]", getCardBorder())}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {recommendation.recommendation_priority_rank && (
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">
                Rank #{recommendation.recommendation_priority_rank}
              </span>
            )}
            <span className="rounded-full bg-olive px-3 py-1 text-xs font-semibold text-white">
              Score {recommendation.priority_score}
            </span>
            <RiskBadge level={recommendation.timing.urgency === "blocked" ? "low" : recommendation.timing.urgency} />
            {getActionabilityBadge()}
          </div>
          <h3 className="mt-3 text-base font-semibold text-foreground">{recommendation.segment_label}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">
            {recommendation.product} / {recommendation.target_count.toLocaleString()} growers / expected leads {recommendation.expected_impact.expected_leads}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {recommendation.operational_readiness_score !== undefined && (
            <div className="text-right text-xs font-medium mr-1">
              Readiness:{" "}
              <span className={cn("font-bold", getReadinessColor(recommendation.operational_readiness_score))}>
                {Math.round(recommendation.operational_readiness_score * 100)}%
              </span>
            </div>
          )}
          <Button asChild variant={recommendation.blocked ? "secondary" : "default"} size="sm">
            <Link
              href={
                recommendation.blocked
                  ? `/field-actions?plan_id=${(recommendation as any).plan_id ?? "PLAN_001"}#retailer-alerts`
                  : `/content-studio?plan_id=${(recommendation as any).plan_id ?? "PLAN_001"}&recommendation_id=${recommendation.recommendation_id}`
              }
            >
              {recommendation.blocked ? "Review stock" : "Use recommendation"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Blocked reasons */}
      {recommendation.blocked && recommendation.blocked_reasons && recommendation.blocked_reasons.length > 0 && (
        <div className="mt-3.5 p-3 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-900 flex gap-2.5 items-start">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-rose-800">Launch Blockers Detected:</p>
            <ul className="list-disc list-inside mt-1 text-[11px] text-rose-700 space-y-0.5">
              {recommendation.blocked_reasons.map((reason, idx) => (
                <li key={idx} className="capitalize">{reason.replace(/_/g, " ")}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Data Quality Warnings */}
      {recommendation.data_quality_warnings && recommendation.data_quality_warnings.length > 0 && (
        <div className="mt-3.5 p-3 rounded-xl border border-amber-200 bg-amber-50/30 text-amber-900 flex gap-2.5 items-start">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800">Operational Observations:</p>
            <ul className="list-disc list-inside mt-1 text-[11px] text-amber-700 space-y-0.5">
              {recommendation.data_quality_warnings.map((warning, idx) => (
                <li key={idx}>{warning.message} (Severity: <span className="font-semibold">{warning.severity}</span>)</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <MiniMetric 
          label="Advisory open probability" 
          value={recommendation.receptivity.open_probability !== null ? formatPercent(recommendation.receptivity.open_probability) : "N/A"} 
          barValue={recommendation.receptivity.open_probability !== null ? recommendation.receptivity.open_probability : undefined} 
        />
        <MiniMetric 
          label="Grower response probability" 
          value={recommendation.receptivity.click_probability !== null ? formatPercent(recommendation.receptivity.click_probability) : "N/A"} 
          barValue={recommendation.receptivity.click_probability !== null ? recommendation.receptivity.click_probability : undefined} 
        />
        <MiniMetric 
          label="Recommendation confidence" 
          value={confidenceLabel} 
          barValue={recommendation.receptivity.open_probability !== null ? recommendation.receptivity.open_probability : undefined} 
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[18px] border border-border bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarClock className="h-4 w-4 text-warning" />
            Crop window timing
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">
            {recommendation.timing.recommended_send_date ? (
              <>Send on {recommendation.timing.recommended_send_date}, window {recommendation.timing.send_window}</>
            ) : (
              <>Outreach window paused (low stock)</>
            )}
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
