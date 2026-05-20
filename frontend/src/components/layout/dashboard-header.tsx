"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Search, X } from "lucide-react";
import { useRole } from "@/lib/contexts/RoleContext";
import { AVAILABLE_ROLES, RoleType } from "@/lib/config/roles";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/lib/navigation";
import { fetchOperationalEvents } from "@/services/api";
import type { OperationalEvent } from "@/types/workflow";

export function DashboardHeader({ variant = "full" }: { variant?: "full" | "hero-preview" }) {
  const { role, setRole } = useRole();
  const router = useRouter();
  const compact = variant === "hero-preview";
  const [query, setQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [events, setEvents] = useState<OperationalEvent[]>([]);

  const roleKey = role.toLowerCase().replace(/ /g, "_");
  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return navigationItems
      .filter((item) => item.roles.includes(role))
      .filter((item) => `${item.label} ${item.href}`.toLowerCase().includes(normalized))
      .slice(0, 5);
  }, [query, role]);

  useEffect(() => {
    if (!notificationsOpen) return;
    const workflowId = typeof window !== "undefined" ? localStorage.getItem("syngenta_workflow_id") || undefined : undefined;
    fetchOperationalEvents(roleKey, workflowId)
      .then((data) => setEvents(data.events || []))
      .catch(() => setEvents([]));
  }, [notificationsOpen, roleKey]);

  function submitSearch() {
    const result = searchResults[0];
    if (result) {
      router.push(result.href);
      setQuery("");
    }
  }

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
        <div
          className={cn(
            "relative flex h-10 items-center gap-2.5 rounded-full border border-[#0B5B34]/10 bg-white/72 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors focus-within:border-[#0D7A43]/35 focus-within:bg-white",
            compact ? "w-full xl:w-[230px]" : "w-full sm:w-[260px]"
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-[#6F7A74]" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[#08110C] outline-none placeholder:text-[#7C8982]"
            placeholder="Search insights..."
            aria-label="Search insights"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitSearch();
              if (event.key === "Escape") setQuery("");
            }}
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
              <X className="h-3.5 w-3.5 text-[#6F7A74]" />
            </button>
          )}
          {query && (
            <div className="absolute right-0 top-12 z-50 w-[280px] overflow-hidden rounded-[16px] border border-[#0B5B34]/10 bg-white shadow-[0_18px_45px_rgba(9,18,13,0.16)]">
              {searchResults.length ? (
                searchResults.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-[13px] font-semibold text-[#243028] transition-colors hover:bg-[#F4F8F5]"
                    onClick={() => {
                      router.push(item.href);
                      setQuery("");
                    }}
                  >
                    <span>{item.label}</span>
                    <span className="text-[11px] text-[#6F7A74]">{item.href.split("#")[0]}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-[12px] text-[#64706B]">No matching live dashboard section.</div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#0B5B34]/10 bg-white/78 text-[#5D6B62] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:bg-white hover:text-[#0B5B34]"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell className="h-4 w-4" />
            {events.length > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#D9480F]" />
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-[320px] overflow-hidden rounded-[18px] border border-[#0B5B34]/10 bg-white shadow-[0_18px_45px_rgba(9,18,13,0.16)]">
              <div className="border-b border-[#0B5B34]/10 px-4 py-3">
                <p className="text-[13px] font-semibold text-[#08110C]">Live operational notifications</p>
                <p className="text-[11px] text-[#64706B]">Updated from the active workflow</p>
              </div>
              {events.length ? (
                <div className="max-h-[260px] overflow-y-auto">
                  {events.map((event) => (
                    <div key={event.event_id} className="border-b border-[#0B5B34]/[0.06] px-4 py-3 last:border-b-0">
                      <p className="text-[12px] font-medium leading-5 text-[#243028]">{event.text}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[#6F7A74]">{event.time}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-5 text-[12px] leading-5 text-[#64706B]">
                  No live alerts for this role in the active workflow.
                </div>
              )}
            </div>
          )}
        </div>

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
