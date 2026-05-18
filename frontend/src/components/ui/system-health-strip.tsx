"use client";

import { useEffect, useState } from "react";
import { fetchSystemHealth } from "@/services/api";
import type { SystemHealth } from "@/types/workflow";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-[#1F9D62]",
  connected: "bg-[#1F9D62]",
  enabled: "bg-[#1F9D62]",
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
    <div className="enterprise-surface flex items-center gap-5 rounded-[18px] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-text/70">
      <span className="text-foreground tracking-widest font-bold">Sys Ops</span>
      <span className="flex items-center gap-2">
        <StatusDot status={health.gemini} />
        Gemini {health.gemini}
      </span>
      <span className="flex items-center gap-2">
        <StatusDot status={health.supabase} />
        Supabase {health.supabase}
      </span>
      <span className="flex items-center gap-2">
        <StatusDot status={health.data_mode === "hybrid" ? "connected" : health.data_mode} />
        Mode {health.data_mode}
      </span>
      <span className="flex items-center gap-2">
        <StatusDot status={health.last_generation_source === "gemini" ? "active" : health.last_generation_source === "cache" ? "connected" : "fallback"} />
        Last Source {health.last_generation_source}
      </span>
      {health.active_workflows > 0 && (
        <span className="ml-auto text-primary font-bold">
          {health.active_workflows} active workflow{health.active_workflows > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
