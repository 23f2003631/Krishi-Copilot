import { BrainCircuit } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

export function AIInsightCard({ title, description }: { title: string; description: string }) {
  return (
    <DashboardCard>
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ai/10 text-ai">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
    </DashboardCard>
  );
}

