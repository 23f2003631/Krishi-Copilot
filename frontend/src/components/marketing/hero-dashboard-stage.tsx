"use client";

import { PlannerClient } from "@/components/dashboard/planner-client";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { SidebarNav } from "@/components/layout/sidebar";
import { ParallaxFrame } from "@/components/motion/parallax-frame";
import {
  analyticsSummaryResponse,
  campaignContext,
  fieldActionsResponse,
  recommendationResponse,
  scenarios,
} from "@/data/mock-data";

const heroWorkflowState = {
  workflow_id: "",
  alerts: [],
  events: [],
  next_action: {
    action: "Review agronomic intelligence",
    reason: "High predictive accuracy for the current crop stage",
    assigned_role: "Campaign Manager",
    priority: "high",
  },
};

export function HeroDashboardStage() {
  return (
    <ParallaxFrame depth="hero" className="hero-dashboard-scene relative mt-16 w-full max-w-[1180px] md:mt-20">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[54%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(29,155,98,0.20),rgba(183,216,195,0.07)_46%,transparent_72%)] blur-[78px]" />
      <div className="pointer-events-none absolute left-1/2 top-[78%] h-[220px] w-[70%] -translate-x-1/2 rounded-[50%] bg-black/80 blur-[72px]" />
      <div className="cinematic-dashboard-frame relative rounded-[24px] border border-white/[0.12] bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04)_34%,rgba(8,18,12,0.6)_100%)] p-[1px] shadow-[0_34px_90px_rgba(0,0,0,0.62),0_110px_220px_rgba(0,0,0,0.54),0_0_120px_rgba(29,155,98,0.10)]">
        <div className="relative overflow-hidden rounded-[23px] bg-[#07100B] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-48px_90px_rgba(0,0,0,0.42)]">
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_70%_70%,rgba(29,155,98,0.08),transparent_35%)]" />
          <div className="relative h-[620px] overflow-hidden rounded-[18px] border border-black/[0.05] bg-[#EEF7F0] text-left shadow-[0_22px_60px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.9)] sm:h-[680px] lg:h-[760px]">
            <div className="grid h-full grid-cols-1 md:grid-cols-[64px_1fr]">
              <SidebarNav activePath="/planner" />
              <div className="relative flex min-w-0 flex-col overflow-hidden bg-[#EEF7F0] p-3 md:p-4">
                <DashboardHeader variant="hero-preview" />
                <div className="pointer-events-none mt-4 flex-1 overflow-hidden">
                  <PlannerClient
                    scenarios={scenarios}
                    context={campaignContext}
                    recommendations={recommendationResponse}
                    fieldActions={fieldActionsResponse}
                    analytics={analyticsSummaryResponse}
                    workflowState={heroWorkflowState}
                    displayMode="hero-preview"
                    disableLivePolling
                  />
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[210px] bg-gradient-to-t from-[#07100B] via-[#07100B]/48 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.18),transparent_28%,transparent_72%,rgba(255,255,255,0.07))] mix-blend-soft-light" />
          </div>
        </div>
      </div>
    </ParallaxFrame>
  );
}
