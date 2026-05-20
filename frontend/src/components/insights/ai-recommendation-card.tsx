"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { MessageSquare, Zap } from "lucide-react";
import { IntelligenceCard } from "@/components/dashboard/intelligence-card";
import { OperationalPanel } from "@/components/dashboard/operational-panel";

type AIRecommendationCardProps = {
  recommendation?: any;
  compact?: boolean;
};

export function AIRecommendationCard({ recommendation, compact = false }: AIRecommendationCardProps) {
  const [status, setStatus] = useState<"ready" | "deployed" | "snoozed">("ready");

  if (!recommendation) {
    return (
      <IntelligenceCard className="flex h-full min-h-[360px] flex-col p-5">
        <div className="relative z-10 flex flex-1 items-center justify-center rounded-[16px] border border-dashed border-[#0B5B34]/15 bg-white/70 p-5 text-center text-[13px] leading-6 text-[#5D6B62]">
          No live recommendation is available for the selected crop and territory.
        </div>
      </IntelligenceCard>
    );
  }

  const score = recommendation.priority_score;
  const segment = recommendation.segment_label;
  const product = recommendation.product;
  const timing = recommendation.timing?.send_window ?? recommendation.timing?.recommended_send_date ?? "Not scheduled";
  const channel = recommendation.channel_strategy?.[0]?.channel ?? "field_rep";
  const targetCount = recommendation.target_count?.toLocaleString?.() ?? "0";
  const blocked = Boolean(recommendation.blocked);

  return (
    <IntelligenceCard className="flex h-full min-h-[360px] flex-col p-5">
      <div className="pointer-events-none absolute inset-x-6 bottom-0 h-10 rounded-full bg-[#0B5B34]/[0.035] blur-xl" />
      <div className="relative z-10 mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#0D7A43]" />
          <h3 className="text-[16px] font-semibold text-[#0B5B34]">AI Recommendation Feed</h3>
        </div>
        <span className="rounded-full border border-[#0D7A43]/15 bg-[#DDEADF]/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0D7A43]">
          {blocked ? "Review Required" : status === "deployed" ? "Queued" : status === "snoozed" ? "Snoozed" : "High Priority"}
        </span>
      </div>

      <OperationalPanel className="relative z-10 flex flex-1 flex-col rounded-[16px] bg-white/72 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0D7A43]">Deployment directive</p>
            <h4 className="mt-2 text-[20px] font-semibold leading-tight text-[#08110C]">
              {blocked ? "Resolve Stock Gate" : `Activate ${String(channel).replace("_", " ")} Advisory`}
            </h4>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#5D6B62]">Reliance Score</p>
            <p className="mt-1 text-[30px] font-semibold leading-none text-[#0D7A43]">{score}%</p>
          </div>
        </div>

        <div className="my-6 space-y-0 divide-y divide-[#0B5B34]/10">
          <SignalRow label="Segment" value={segment} />
          <SignalRow label="Product Focus" value={product} />
          <SignalRow label="Optimal Timing" value={timing} />
          <SignalRow label="Target Reach" value={targetCount} />
          {!compact && (
            <SignalRow
              label="Channel"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {channel}
                </span>
              }
            />
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStatus("snoozed")}
            className="h-11 rounded-[12px] border border-[#0B5B34]/12 bg-white text-[14px] font-semibold text-[#243028] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:bg-[#F7FAF8]"
          >
            {status === "snoozed" ? "Snoozed 24h" : "Snooze"}
          </button>
          <button
            type="button"
            disabled={blocked}
            onClick={() => setStatus("deployed")}
            className="h-11 rounded-[12px] bg-[#0D7A43] text-[14px] font-semibold text-white shadow-[0_12px_28px_rgba(13,122,67,0.24),inset_0_1px_0_rgba(255,255,255,0.18)] transition-colors hover:bg-[#0B5B34] disabled:cursor-not-allowed disabled:bg-[#9AA7A0]"
          >
            {blocked ? "Blocked" : status === "deployed" ? "Deployment Queued" : "Deploy Now"}
          </button>
        </div>
      </OperationalPanel>
    </IntelligenceCard>
  );
}

function SignalRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-[13px]">
      <span className="text-[#5D6B62]">{label}</span>
      <span className="text-right font-semibold text-[#08110C]">{value}</span>
    </div>
  );
}
