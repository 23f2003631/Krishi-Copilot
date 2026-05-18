"use client";

import { AlertTriangle, Info, CloudLightning, ShieldAlert, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/contexts/RoleContext";
import { useState, useEffect } from "react";
import type { OperationalEvent } from "@/types/workflow";

interface OperationalAlertBannerProps {
  className?: string;
  alerts?: OperationalEvent[];
}

export function OperationalAlertBanner({ className, alerts }: OperationalAlertBannerProps) {
  const { role } = useRole();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when role or alerts change
  useEffect(() => {
    setDismissed(false);
  }, [role, alerts]);

  if (dismissed) return null;

  let alertContent = null;

  if (alerts && alerts.length > 0) {
    const primaryAlert = alerts[0];
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
  } else {
    // Fallback to static alerts
    switch (role) {
      case "Campaign Manager":
        alertContent = {
          icon: Info,
          style: "bg-blue-50 text-blue-900 border-blue-200",
          iconStyle: "text-blue-600",
          pulseColor: "bg-blue-500",
          message: "3 campaigns are awaiting your approval for deployment tomorrow.",
          time: "Updated 2m ago"
        };
        break;
      case "Territory Manager":
        alertContent = {
          icon: CloudLightning,
          style: "bg-amber-50 text-amber-900 border-amber-200",
          iconStyle: "text-amber-600",
          pulseColor: "bg-amber-500 animate-pulse",
          message: "High pest risk detected in Maharashtra. 2 campaigns blocked.",
          time: "Detected 8m ago"
        };
        break;
      case "Field Representative":
        alertContent = {
          icon: AlertTriangle,
          style: "bg-orange-50 text-orange-900 border-orange-200",
          iconStyle: "text-orange-600",
          pulseColor: "bg-orange-500 animate-pulse",
          message: "You have 5 high-priority grower visits overdue.",
          time: "Queue updated 5m ago"
        };
        break;
      case "Retailer Support":
        alertContent = {
          icon: ShieldAlert,
          style: "bg-rose-50 text-rose-900 border-rose-200",
          iconStyle: "text-rose-600",
          pulseColor: "bg-rose-500 animate-pulse",
          message: "Critical stockout: Tilt 250 EC in Kanpur Nagar. Escalation required.",
          time: "Escalated 1m ago"
        };
        break;
    }
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
