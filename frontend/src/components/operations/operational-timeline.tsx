import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { WorkflowTimeline } from "@/components/ui/workflow-timeline";
import { WorkflowStateBadge } from "@/components/ui/workflow-state-badge";
import { Clock3 } from "lucide-react";
import type { WorkflowEvent } from "@/types/workflow";

export function OperationalTimeline({ events }: { events?: WorkflowEvent[] }) {
  let steps: { label: string; status: "completed" | "current" | "upcoming"; timestamp?: string }[] = [];

  if (events && events.length > 0) {
    steps = events.map(e => ({
      label: e.event_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      status: "completed",
      timestamp: e.timestamp ? new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
    }));
  } else {
    // Fallback static steps
    steps = [
      { label: "Recommendation Generated", status: "completed", timestamp: "10:00 AM" },
      { label: "Content Approved", status: "completed", timestamp: "10:15 AM" },
      { label: "Territory Assigned", status: "current", timestamp: "Pending execution" },
      { label: "Rep Dispatched", status: "upcoming" },
      { label: "Retailer Confirmed", status: "upcoming" },
      { label: "Campaign Deployed", status: "upcoming" }
    ];
  }

  return (
    <DashboardCard>
      <div className="flex justify-between items-start mb-4">
        <SectionHeader icon={Clock3} title="Deployment Readiness Timeline" description="From crop signal to execution." />
        <WorkflowStateBadge state="pending_review" />
      </div>
      <div className="mt-6 px-2">
        <WorkflowTimeline steps={steps} />
      </div>
    </DashboardCard>
  );
}
