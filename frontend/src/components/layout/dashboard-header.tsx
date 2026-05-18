"use client";

import { Bell, Search } from "lucide-react";
import { useRole } from "@/lib/contexts/RoleContext";
import { AVAILABLE_ROLES, RoleType } from "@/lib/config/roles";

export function DashboardHeader() {
  const { role, setRole } = useRole();

  return (
    <header className="relative z-10 flex flex-col gap-4 rounded-[24px] border border-white/70 bg-white/48 px-4 py-4 shadow-[0_16px_40px_rgba(9,18,13,0.055),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#64706B]">Syngenta Krishi Copilot</p>
        <h1 className="mt-1 text-[26px] font-semibold leading-tight text-[#07110B]">Good morning, Campaign Manager</h1>
        <p className="text-[14px] text-[#64706B] mt-1">Stay on top of field execution and AI-driven growth opportunities.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        
        {/* Search */}
        <label className="flex h-[40px] w-[260px] items-center gap-2.5 rounded-full border border-[#0B5B34]/10 bg-white/70 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors focus-within:border-[#0D7A43]/35 focus-within:bg-white">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-gray-900 outline-none placeholder:text-gray-400"
            placeholder="Search insights..."
          />
        </label>

        {/* Bell */}
        <button className="flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#0B5B34]/10 bg-white/78 text-gray-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:bg-white hover:text-[#0B5B34]">
          <Bell className="h-4 w-4" />
        </button>

        {/* Role Selector */}
        <div className="relative flex h-[40px] items-center rounded-full border border-[#0B5B34]/10 bg-white/78 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:bg-white">
          <select 
            className="appearance-none bg-transparent text-[13px] font-semibold text-[#243028] outline-none cursor-pointer pr-6 w-full"
            value={role}
            onChange={(e) => setRole(e.target.value as RoleType)}
          >
            {AVAILABLE_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

      </div>
    </header>
  );
}
