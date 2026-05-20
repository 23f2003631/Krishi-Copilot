import { UsersRound } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";

export function SegmentOpportunityCard({ analytics, recommendations }: { analytics?: any; recommendations?: any }) {
  const totalGrowers = analytics?.kpis?.target_growers ?? 0;
  const expectedLeads = analytics?.kpis?.expected_leads ?? 0;
  const readiness = recommendations?.recommendations?.[0]?.operational_readiness_score;
  const growthPct = totalGrowers ? Math.min(100, Math.round((expectedLeads / totalGrowers) * 1000)) : Math.round((readiness ?? 0) * 100);
  const topSegment = recommendations?.recommendations?.[0]?.segment_label ?? "No active segment";

  return (
    <DashboardCard className="min-h-[300px]">
      <SectionHeader icon={UsersRound} title="Segment Opportunity" description={topSegment} />
      <div className="mt-7 flex flex-col items-center justify-center">
        <div
          className="relative flex h-40 w-40 items-center justify-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_18px_42px_rgba(9,18,13,0.07)]"
          style={{ background: `conic-gradient(#0D7A43 0 ${Math.round(growthPct * 3.6)}deg,#D7E1DA ${Math.round(growthPct * 3.6)}deg 360deg)` }}
        >
          <div className="absolute inset-4 rounded-full bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
          <div className="relative text-center">
            <p className="text-[30px] font-semibold leading-none text-[#08110C]">{growthPct}%</p>
            <p className="mt-1 text-[13px] text-[#5D6B62]">Response</p>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-[13px] text-[#35433A]">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0D7A43]" />
            {expectedLeads} expected leads
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#D7E1DA]" />
            {totalGrowers.toLocaleString()} growers
          </span>
        </div>
      </div>
    </DashboardCard>
  );
}
