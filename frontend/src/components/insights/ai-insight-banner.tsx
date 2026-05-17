import { CloudSun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AiInsightBanner({ title, description, actionLabel }: { title: string; description: string; actionLabel: string }) {
  return (
    <section className="flex flex-col gap-4 rounded-[24px] border border-olive/10 bg-white p-5 card-shadow md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-olive text-white">
          <CloudSun className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
      <Button size="sm">{actionLabel}</Button>
    </section>
  );
}
