import { cn } from "@/lib/utils";

export type WorkflowState = "draft" | "pending_review" | "approved" | "blocked" | "ready";

interface WorkflowStateBadgeProps {
  state: WorkflowState;
  className?: string;
}

export function WorkflowStateBadge({ state, className }: WorkflowStateBadgeProps) {
  const config = {
    draft: { label: "Draft", style: "bg-gray-100 text-gray-700 border-gray-200" },
    pending_review: { label: "Pending Review", style: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Approved", style: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    blocked: { label: "Blocked", style: "bg-rose-100 text-rose-800 border-rose-200" },
    ready: { label: "Ready to Deploy", style: "bg-blue-100 text-blue-800 border-blue-200" },
  };

  const { label, style } = config[state] || config.draft;

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider", style, className)}>
      {label}
    </span>
  );
}
