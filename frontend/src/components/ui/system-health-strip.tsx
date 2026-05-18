"use client";

import { useEffect, useState } from "react";
import { fetchSystemHealth } from "@/services/api";
import type { SystemHealth } from "@/types/workflow";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500",
  connected: "bg-emerald-500",
  enabled: "bg-emerald-500",
  disabled: "bg-zinc-400",
  unavailable: "bg-rose-500",
  degraded: "bg-amber-500",
  fallback: "bg-amber-500",
  unknown: "bg-zinc-400",
};

function StatusDot({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.unknown;
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
  );
}

export function SystemHealthStrip() {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const data = await fetchSystemHealth();
        if (mounted) setHealth(data);
      } catch {
        // silent
      }
    };
    poll();
    const interval = setInterval(poll, 30_000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (!health) return null;

  return (
    <div className="flex items-center gap-4 px-4 py-1.5 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-500 font-mono">
      <span className="font-semibold text-zinc-600">System</span>
      <span className="flex items-center gap-1.5">
        <StatusDot status={health.gemini} />
        Gemini: {health.gemini}
      </span>
      <span className="flex items-center gap-1.5">
        <StatusDot status={health.supabase} />
        Supabase: {health.supabase}
      </span>
      <span className="flex items-center gap-1.5">
        <StatusDot status={health.data_mode === "hybrid" ? "connected" : health.data_mode} />
        Mode: {health.data_mode}
      </span>
      <span className="flex items-center gap-1.5">
        <StatusDot status={health.last_generation_source === "gemini" ? "active" : health.last_generation_source === "cache" ? "connected" : "fallback"} />
        Last: {health.last_generation_source}
      </span>
      {health.active_workflows > 0 && (
        <span className="text-emerald-600 font-semibold">
          {health.active_workflows} active workflow{health.active_workflows > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
