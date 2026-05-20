import { UsersRound } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";

export function SegmentOpportunityCard() {
  return (
    <DashboardCard className="min-h-[300px]">
      <SectionHeader icon={UsersRound} title="Segment Opportunity" description="Strategic grower segment growth potential." />
      <div className="mt-7 flex flex-col items-center justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-[conic-gradient(#0D7A43_0_230deg,#D7E1DA_230deg_360deg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_18px_42px_rgba(9,18,13,0.07)]">
          <div className="absolute inset-4 rounded-full bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]" />
          <div className="relative text-center">
            <p className="text-[30px] font-semibold leading-none text-[#08110C]">64%</p>
            <p className="mt-1 text-[13px] text-[#5D6B62]">Growth</p>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-[13px] text-[#35433A]">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0D7A43]" />
            Tier 1 Growers
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#D7E1DA]" />
            Marginal
          </span>
        </div>
      </div>
    </DashboardCard>
  );
}
