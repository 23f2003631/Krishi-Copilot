import { Zap, MessageSquare } from "lucide-react";

export function AIRecommendationCard() {
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[#0D7A43]/15 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.72),transparent_34%),linear-gradient(145deg,#DDEADF,#F7FAF8_46%,#FFFFFF)] p-5 shadow-[0_18px_44px_rgba(9,18,13,0.075),inset_0_1px_0_rgba(255,255,255,0.88)]">
      <div className="pointer-events-none absolute inset-x-5 bottom-0 h-10 rounded-full bg-[#0B5B34]/[0.035] blur-xl" />
      {/* Header */}
      <div className="relative z-10 flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-[#0D7A43]" />
        <h3 className="text-[14px] font-bold text-[#0D7A43]">AI Recommendation Feed</h3>
      </div>

      {/* Main Inner Card */}
      <div className="enterprise-inset relative z-10 flex flex-1 flex-col rounded-[18px] p-5">
        <div className="flex items-start justify-between mb-4">
          <span className="inline-flex items-center rounded-md border border-[#0D7A43]/15 bg-[#DDEADF] px-2 py-1 text-[11px] font-bold text-[#0D7A43] uppercase tracking-wider">
            High Priority
          </span>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Reliance Score</p>
            <p className="text-[26px] font-bold text-[#0D7A43] leading-none mt-1">92%</p>
          </div>
        </div>

        <h4 className="text-[18px] font-bold text-gray-900 mb-6">Activate WhatsApp Blast</h4>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-[13px] text-gray-500">Segment</span>
            <span className="text-[13px] font-semibold text-gray-900">Tier 1 Growers</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-[13px] text-gray-500">Product Focus</span>
            <span className="text-[13px] font-semibold text-gray-900">Fortenza</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-[13px] text-gray-500">Optimal Timing</span>
            <span className="text-[13px] font-semibold text-gray-900">Next 48hrs</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-[13px] text-gray-500">Channel</span>
            <span className="text-[13px] font-semibold text-gray-900 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              WhatsApp
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-auto flex items-center gap-3">
          <button className="flex-1 rounded-[10px] bg-white border border-[#0B5B34]/10 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            Snooze
          </button>
          <button className="flex-1 rounded-[10px] bg-[#0D7A43] py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(13,122,67,0.2)] hover:bg-[#0A6235] transition-colors">
            Deploy Now
          </button>
        </div>
      </div>
    </article>
  );
}
