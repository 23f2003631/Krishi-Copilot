import Link from "next/link";
import { Leaf, Radar } from "lucide-react";
import { navigationItems, quickActions } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function Sidebar({ activePath }: { activePath: string }) {
  return (
    <aside className="hidden border-r border-border/70 bg-[#f3f7f4] p-6 lg:block">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive text-white shadow-[0_10px_30px_rgba(49,72,58,0.18)]">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Krishi Copilot</p>
          <p className="text-[11px] text-muted">AI Operations</p>
        </div>
      </div>

      <p className="mt-8 text-sm font-medium text-muted">Command Center</p>
      <nav className="mt-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href;
          const isHash = item.href.startsWith("#");
          const className = cn(
            "group flex h-12 items-center gap-3 rounded-[16px] px-3 text-[13px] font-medium transition",
            isActive ? "bg-olive text-white shadow-[0_12px_32px_rgba(49,72,58,0.22)]" : "text-foreground hover:bg-white hover:shadow-[0_10px_28px_rgba(31,56,88,0.06)]"
          );

          const content = (
            <>
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-[12px]", isActive ? "bg-white/18" : "bg-white text-field")}>
                <Icon className="h-[17px] w-[17px]" />
              </span>
              <span className="min-w-0 leading-4">{item.label}</span>
            </>
          );

          return isHash ? (
            <div key={item.label} className={cn(className, "opacity-75")} aria-disabled>
              {content}
            </div>
          ) : (
            <Link key={item.label} href={item.href} className={className}>
              {content}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-6" />

      <div className="rounded-[24px] border border-border bg-white p-4 card-shadow">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime/10 text-lime">
          <Radar className="h-5 w-5" />
        </div>
        <p className="mt-4 text-sm font-semibold text-foreground">Signal cache ready</p>
        <p className="mt-1 text-xs leading-5 text-muted">Cached crop-stage, stock, and weather signals keep the demo stable if live services pause.</p>
      </div>

      <div className="mt-5 space-y-2">
        {quickActions.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex h-10 items-center gap-3 rounded-[14px] px-2 text-xs font-medium text-muted">
              <Icon className="h-4 w-4 text-field" />
              {item.label}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
