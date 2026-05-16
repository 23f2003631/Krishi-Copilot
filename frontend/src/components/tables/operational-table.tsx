import type { FieldAction } from "@/types/contracts";
import { Badge } from "@/components/ui/badge";

export function OperationalTable({ actions }: { actions: FieldAction[] }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-border">
      <div className="hidden grid-cols-[0.8fr_1fr_1.6fr_1fr_0.8fr] bg-card-soft px-4 py-3 text-[11px] font-semibold uppercase text-muted md:grid">
        <span>Rep</span>
        <span>Territory</span>
        <span>Action</span>
        <span>Due date</span>
        <span>Priority</span>
      </div>
      <div className="divide-y divide-border bg-white">
        {actions.map((action) => (
          <div key={action.action_id} className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[0.8fr_1fr_1.6fr_1fr_0.8fr] md:items-center">
            <div>
              <p className="font-semibold text-foreground">{action.rep_id}</p>
              <p className="text-xs text-muted">{action.action_id}</p>
            </div>
            <p className="text-sm text-muted">{action.territory_id}</p>
            <div>
              <p className="font-medium text-foreground">{action.action_type.replaceAll("_", " ")}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{action.summary}</p>
            </div>
            <p className="text-sm font-medium text-foreground">{action.due_date}</p>
            <Badge variant={action.priority === "high" ? "danger" : action.priority === "medium" ? "warning" : "success"}>{action.priority}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

