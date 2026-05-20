import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneClasses = {
  ai: "text-[#0D7A43] bg-[#DDEADF] border-[#B7D8C3]/70",
  field: "text-[#0B5B34] bg-[#DDEADF] border-[#B7D8C3]/70",
  success: "text-[#0D7A43] bg-[#DDEADF] border-[#B7D8C3]/70",
  warning: "text-[#B4232A] bg-[#FDE8E8] border-[#E9B7BA]/55",
  danger: "text-[#B42318] bg-[#FFF3F0] border-[#F0B8AE]/55"
};

const barClasses = {
  ai: "bg-[#B7D8C3]",
  field: "bg-[#B7D8C3]",
  success: "bg-[#B7D8C3]",
  warning: "bg-[#E9B7BA]",
  danger: "bg-[#F0B8AE]"
};

export function KpiStatCard({
  label,
  value,
  trend,
  icon: Icon,
  tone = "ai",
  sparkline = [44, 58, 49, 70, 62], // 5 bars
  metadata
}: {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
  sparkline?: number[];
  metadata?: string;
}) {
  const isNegative = trend.startsWith("-");
  
  return (
    <section className="group relative min-h-[184px] overflow-hidden rounded-[16px] border border-[#0B5B34]/[0.08] bg-[#F8FAF9] p-[1px] shadow-[0_1px_2px_rgba(9,18,13,0.04),0_18px_42px_rgba(9,18,13,0.065)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[#0D7A43]/15 hover:shadow-[0_2px_3px_rgba(9,18,13,0.04),0_24px_56px_rgba(9,18,13,0.09)]">
      <div className="absolute inset-x-5 -bottom-4 h-10 rounded-full bg-[#0B5B34]/[0.035] blur-xl" />
      <div className="relative flex h-full min-h-[182px] flex-col justify-between overflow-hidden rounded-[15px] bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.95),transparent_36%),linear-gradient(145deg,#FFFFFF_0%,#F7FAF8_45%,#EEF3EF_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-24px_48px_rgba(9,18,13,0.035)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),transparent_32%,transparent_72%,rgba(13,122,67,0.035))]" />
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

      <div className="relative z-10 flex items-start justify-between">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex items-center gap-1">
          <span className={cn("text-[12px] font-semibold", isNegative ? "text-[#B42318]" : "text-[#0B5B34]")}>
            {trend}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cn(isNegative ? "text-[#B42318]" : "text-[#0B5B34]", isNegative && "rotate-180")}>
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
        </div>
      </div>

      <div className="relative z-10 mt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#64706B]">{label}</p>
        {metadata && <p className="mt-1 text-[11px] font-medium text-[#7A8680]">{metadata}</p>}
      </div>

      <div className="relative z-10 mt-1 flex items-end justify-between">
        <p className="text-[32px] font-semibold leading-none text-[#07110B]">{value}</p>
        
        <div className="flex h-7 items-end gap-1.5 rounded-[10px] border border-[#0B5B34]/[0.06] bg-white/60 px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          {sparkline.slice(0, 5).map((height, index) => (
            <span
              key={`${label}-${index}`}
              className={cn("w-2.5 rounded-full opacity-90", barClasses[tone])}
              style={{ height: `${Math.max(10, Math.min(height, 100))}%` }}
            />
          ))}
        </div>
      </div>
      </div>

    </section>
  );
}
