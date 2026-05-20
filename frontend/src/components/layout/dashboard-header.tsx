"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { useRole } from "@/lib/contexts/RoleContext";
import { AVAILABLE_ROLES, RoleType } from "@/lib/config/roles";
import { cn } from "@/lib/utils";

export function DashboardHeader({ variant = "full" }: { variant?: "full" | "hero-preview" }) {
  const { role, setRole } = useRole();
  const compact = variant === "hero-preview";

  return (
    <header
      className={cn(
        "relative z-10 flex flex-col gap-4 rounded-[18px] border border-white/70 bg-white/54 shadow-[0_16px_40px_rgba(9,18,13,0.055),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl xl:flex-row xl:items-center xl:justify-between",
        compact ? "px-4 py-3" : "px-4 py-4 sm:px-5"
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#64706B]">
          Syngenta Krishi Copilot
        </p>
        <h1
          className={cn(
            "mt-1 font-semibold leading-tight text-[#07110B]",
            compact ? "text-[22px]" : "text-[26px] md:text-[30px]"
          )}
        >
          Good morning, Campaign Manager
        </h1>
        {!compact && (
          <p className="mt-1 text-[14px] text-[#64706B]">
            Stay on top of field execution and AI-driven growth opportunities.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label
          className={cn(
            "flex h-10 items-center gap-2.5 rounded-full border border-[#0B5B34]/10 bg-white/72 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors focus-within:border-[#0D7A43]/35 focus-within:bg-white",
            compact ? "w-full xl:w-[230px]" : "w-full sm:w-[260px]"
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-[#6F7A74]" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[#08110C] outline-none placeholder:text-[#7C8982]"
            placeholder="Search insights..."
            aria-label="Search insights"
          />
        </label>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#0B5B34]/10 bg-white/78 text-[#5D6B62] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:bg-white hover:text-[#0B5B34]"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <label className="relative flex h-10 min-w-[158px] items-center rounded-full border border-[#0B5B34]/10 bg-white/78 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:bg-white">
          <span className="sr-only">Role selector</span>
          <select
            className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-[13px] font-semibold text-[#243028] outline-none"
            value={role}
            onChange={(event) => setRole(event.target.value as RoleType)}
          >
            {AVAILABLE_ROLES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
        </label>
      </div>
    </header>
  );
}
