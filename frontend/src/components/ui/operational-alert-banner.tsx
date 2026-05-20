"use client";

import { AlertTriangle, Info, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/contexts/RoleContext";
import { useState, useEffect } from "react";
import type { OperationalEvent } from "@/types/workflow";
import { fetchOperationalEvents } from "@/services/api";

interface OperationalAlertBannerProps {
  className?: string;
  alerts?: OperationalEvent[];
}

export function OperationalAlertBanner({ className, alerts }: OperationalAlertBannerProps) {
  const { role } = useRole();
  const [dismissed, setDismissed] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<OperationalEvent[]>(alerts || []);

  // Reset dismissed state when role or alerts change
  useEffect(() => {
    setDismissed(false);
  }, [role, alerts]);

  useEffect(() => {
    if (alerts?.length) {
      setLiveAlerts(alerts);
      return;
    }
    const roleKey = role.toLowerCase().replace(/ /g, "_");
    const workflowId = typeof window !== "undefined" ? localStorage.getItem("syngenta_workflow_id") || undefined : undefined;
    fetchOperationalEvents(roleKey, workflowId)
      .then((data) => setLiveAlerts(data.events || []))
      .catch(() => setLiveAlerts([]));
  }, [alerts, role]);

  if (dismissed) return null;

  let alertContent = null;

  if (liveAlerts && liveAlerts.length > 0) {
    const primaryAlert = liveAlerts[0];
    const isWarning = primaryAlert.severity === "high" || primaryAlert.severity === "medium";
    
    let Icon = Info;
    let style = "bg-blue-50 text-blue-900 border-blue-200";
    let iconStyle = "text-blue-600";
    let pulseColor = "bg-blue-500";
    
    if (isWarning) {
      Icon = AlertTriangle;
      style = "bg-orange-50 text-orange-900 border-orange-200";
      iconStyle = "text-orange-600";
      pulseColor = "bg-orange-500 animate-pulse";
    }

    alertContent = {
      icon: Icon,
      style,
      iconStyle,
      pulseColor,
      message: primaryAlert.text,
      time: primaryAlert.time || "Just now"
    };
  }

  if (!alertContent) return null;

  const { icon: Icon, style, iconStyle, pulseColor, message, time } = alertContent;

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-xl border shadow-sm", style, className)}>
      <div className="relative">
        <Icon className={cn("h-5 w-5 shrink-0", iconStyle)} />
        <span className={cn("absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full", pulseColor)} />
      </div>
      <p className="text-sm font-medium flex-1">{message}</p>
      <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted font-medium whitespace-nowrap">
        <Clock className="h-2.5 w-2.5" />
        {time}
      </span>
      <button 
        onClick={() => setDismissed(true)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-black/5 transition"
        aria-label="Dismiss alert"
      >
        <X className="h-3 w-3 opacity-50" />
      </button>
    </div>
  );
}
