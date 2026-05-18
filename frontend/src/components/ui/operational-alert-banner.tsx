"use client";

import { AlertTriangle, Info, CloudLightning, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/contexts/RoleContext";

interface OperationalAlertBannerProps {
  className?: string;
}

export function OperationalAlertBanner({ className }: OperationalAlertBannerProps) {
  const { role } = useRole();

  let alertContent = null;

  switch (role) {
    case "Campaign Manager":
      alertContent = {
        icon: Info,
        style: "bg-blue-50 text-blue-900 border-blue-200",
        iconStyle: "text-blue-600",
        message: "3 campaigns are awaiting your approval for deployment tomorrow."
      };
      break;
    case "Territory Manager":
      alertContent = {
        icon: CloudLightning,
        style: "bg-amber-50 text-amber-900 border-amber-200",
        iconStyle: "text-amber-600",
        message: "High pest risk detected in Maharashtra. 2 campaigns blocked."
      };
      break;
    case "Field Representative":
      alertContent = {
        icon: AlertTriangle,
        style: "bg-orange-50 text-orange-900 border-orange-200",
        iconStyle: "text-orange-600",
        message: "You have 5 high-priority grower visits overdue."
      };
      break;
    case "Retailer Support":
      alertContent = {
        icon: ShieldAlert,
        style: "bg-rose-50 text-rose-900 border-rose-200",
        iconStyle: "text-rose-600",
        message: "Critical stockout: Tilt 250 EC in Kanpur Nagar. Escalation required."
      };
      break;
  }

  if (!alertContent) return null;

  const { icon: Icon, style, iconStyle, message } = alertContent;

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-xl border shadow-sm", style, className)}>
      <Icon className={cn("h-5 w-5 shrink-0", iconStyle)} />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
