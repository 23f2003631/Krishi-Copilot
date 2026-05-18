"use client";

import { Bell, Search, Settings2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/contexts/RoleContext";
import { AVAILABLE_ROLES, RoleType } from "@/lib/config/roles";

export function DashboardHeader() {
  const { role, setRole } = useRole();

  return (
    <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 overflow-hidden rounded-full border border-white bg-gradient-to-br from-[#d8f4e4] to-[#dce7ff] shadow-[0_10px_24px_rgba(31,56,88,0.08)]">
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-field">SK</div>
        </div>
        <div>
          <h1 className="text-[22px] font-semibold leading-7 text-foreground">Krishi Ops Desk</h1>
          <p className="text-xs leading-5 text-muted">Rabi campaign control | Sunday, May 17, 2026</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Role Selector */}
        <div className="relative flex items-center h-11 rounded-full border border-border bg-white px-3 shadow-[0_8px_24px_rgba(31,56,88,0.05)]">
          <Users className="h-4 w-4 shrink-0 text-field mr-2" />
          <select 
            className="appearance-none bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer pr-4"
            value={role}
            onChange={(e) => setRole(e.target.value as RoleType)}
          >
            {AVAILABLE_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {/* Custom chevron */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="#5F738C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <label className="flex h-11 min-w-0 items-center gap-3 rounded-full border border-border bg-white px-4 shadow-[0_8px_24px_rgba(31,56,88,0.05)] sm:w-[280px]">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-[#b6c0c7]"
            placeholder="Start searching here..."
          />
        </label>
        <div className="flex gap-2">
          <Button variant="secondary" size="icon" aria-label="Settings">
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
