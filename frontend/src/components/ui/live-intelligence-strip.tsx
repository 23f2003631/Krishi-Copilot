"use client";

import { cn } from "@/lib/utils";
import { useRole } from "@/lib/contexts/RoleContext";
import { Activity, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface IntelEvent {
  id: string;
  text: string;
  time: string;
  type: "info" | "warning" | "success";
}

const EVENTS_BY_ROLE: Record<string, IntelEvent[]> = {
  "Campaign Manager": [
    { id: "e1", text: "Wheat fungicide campaign content approved by agronomy team", time: "2m ago", type: "success" },
    { id: "e2", text: "Kanpur Nagar cohort receptivity score updated: 78% → 82%", time: "8m ago", type: "info" },
    { id: "e3", text: "New weather trigger: humidity surge detected in UP East", time: "12m ago", type: "warning" },
    { id: "e4", text: "Rep brief exported for T023 territory cluster", time: "18m ago", type: "info" },
    { id: "e5", text: "Sikar mustard campaign blocked — stock gate failed", time: "25m ago", type: "warning" },
  ],
  "Territory Manager": [
    { id: "e1", text: "Maharashtra cotton territory escalation resolved", time: "5m ago", type: "success" },
    { id: "e2", text: "2 reps dispatched to Kanpur wheat cluster", time: "11m ago", type: "info" },
    { id: "e3", text: "Weather alert: pest pressure rising in Vidarbha", time: "15m ago", type: "warning" },
    { id: "e4", text: "Retailer RTL_0091 confirmed Tilt 250 EC stock", time: "22m ago", type: "success" },
    { id: "e5", text: "Field completion rate updated: 58% → 64%", time: "30m ago", type: "info" },
  ],
  "Field Representative": [
    { id: "e1", text: "New priority grower assigned: G-1042 (wheat, high pest risk)", time: "3m ago", type: "warning" },
    { id: "e2", text: "Visit completed: G-0987 — lead confirmed", time: "15m ago", type: "success" },
    { id: "e3", text: "Talking points updated for fungicide advisory", time: "20m ago", type: "info" },
    { id: "e4", text: "Weather clear for tomorrow's route — no delays expected", time: "35m ago", type: "success" },
    { id: "e5", text: "Grower G-1055 rescheduled visit to Thursday", time: "42m ago", type: "info" },
  ],
  "Retailer Support": [
    { id: "e1", text: "Critical: Tilt 250 EC stock below threshold at RTL_0112", time: "1m ago", type: "warning" },
    { id: "e2", text: "Replenishment dispatched to Kanpur Nagar cluster", time: "10m ago", type: "success" },
    { id: "e3", text: "Campaign demand forecast updated for next week", time: "18m ago", type: "info" },
    { id: "e4", text: "RTL_0091 inventory audit passed — stock sufficient", time: "28m ago", type: "success" },
    { id: "e5", text: "Score 250 EC low coverage detected in Sikar", time: "35m ago", type: "warning" },
  ]
};

export function LiveIntelligenceStrip({ className, events }: { className?: string, events?: any[] }) {
  const { role } = useRole();
  const displayEvents = events && events.length > 0 ? events : EVENTS_BY_ROLE[role] || [];
  const [visibleCount, setVisibleCount] = useState(3);

  // Simulate progressive reveal
  useEffect(() => {
    setVisibleCount(3);
    const timer = setTimeout(() => setVisibleCount(5), 2000);
    return () => clearTimeout(timer);
  }, [role]);

  const typeStyles = {
    info: "text-blue-600 bg-blue-50",
    warning: "text-amber-600 bg-amber-50",
    success: "text-emerald-600 bg-emerald-50"
  };

  return (
    <div className={cn("rounded-[18px] border border-border bg-white p-4 shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-field" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Live Intelligence Feed</h3>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>
      <div className="space-y-2">
        {displayEvents.slice(0, visibleCount).map((event: any, i: number) => (
          <div 
            key={event.event_id || event.id || `event-${i}`} 
            className={cn(
              "flex items-start gap-3 rounded-xl px-3 py-2 transition-all duration-500",
              i === 0 ? "bg-card-soft" : ""
            )}
            style={{ opacity: 1, animationDelay: `${i * 100}ms` }}
          >
            <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]", typeStyles[(event.type || (event.severity === 'high' ? 'warning' : 'info')) as keyof typeof typeStyles] || typeStyles.info)}>
              {(event.type || event.severity) === "success" ? "✓" : (event.type === "warning" || event.severity === "high") ? "!" : "·"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground leading-4">{event.text}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted whitespace-nowrap">
              <Clock className="h-2.5 w-2.5" />
              {event.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
