"use client";

import Link from "next/link";
import { Settings, UserRound } from "lucide-react";
import { navigationItems } from "@/lib/navigation";
import { useRole } from "@/lib/contexts/RoleContext";
import { cn } from "@/lib/utils";

export function SidebarNav({ activePath, className }: { activePath: string; className?: string }) {
  const { role } = useRole();
  const items = navigationItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "flex h-full w-16 shrink-0 flex-col items-center border-r border-[#0B5B34]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,250,248,0.86))] py-5 shadow-[8px_0_34px_rgba(9,18,13,0.055),inset_-1px_0_0_rgba(255,255,255,0.78)] backdrop-blur-xl",
        className
      )}
    >
      <nav className="mt-3 flex flex-col items-center gap-4" aria-label="Dashboard navigation">
        {items.slice(0, 7).map((item) => {
          const Icon = item.icon;
          const itemPath = item.href.split("#")[0];
          const active = itemPath !== "" && activePath.startsWith(itemPath);
          const isAnchor = item.href.startsWith("#");

          const content = (
            <span
              className={cn(
                "group relative flex h-10 w-10 items-center justify-center rounded-full border text-[#5D6B62] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                active
                  ? "border-[#0D7A43]/20 bg-[#0D7A43] text-white shadow-[0_12px_26px_rgba(13,122,67,0.24),inset_0_1px_0_rgba(255,255,255,0.2)]"
                  : "border-transparent hover:border-[#0B5B34]/10 hover:bg-[#DDEADF]/55 hover:text-[#0B5B34]"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="pointer-events-none absolute left-12 top-1/2 z-30 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-[#0B5B34]/10 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#243028] shadow-[0_12px_28px_rgba(9,18,13,0.12)] group-hover:block">
                {item.label}
              </span>
            </span>
          );

          if (isAnchor) {
            return (
              <a key={item.label} href={item.href} aria-label={item.label} title={item.label}>
                {content}
              </a>
            );
          }

          return (
            <Link key={item.label} href={item.href} aria-label={item.label} title={item.label}>
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-5 pb-3">
        <Link
          href="/planner#settings"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#5D6B62] transition-colors hover:bg-[#DDEADF]/55 hover:text-[#0B5B34]"
          aria-label="Settings"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Link>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-[linear-gradient(145deg,#DDEADF,#FFFFFF)] text-[#0B5B34] shadow-[0_8px_20px_rgba(9,18,13,0.12)]"
          aria-label="Campaign Manager profile"
          title="Campaign Manager"
        >
          <UserRound className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

export function Sidebar({ activePath }: { activePath: string }) {
  return <SidebarNav activePath={activePath} />;
}

export function MobileSidebarNav({ activePath }: { activePath: string }) {
  const { role } = useRole();
  const items = navigationItems
    .filter((item) => item.roles.includes(role) && !item.href.startsWith("#"))
    .slice(0, 4);

  return (
    <nav
      className="hidden"
      aria-label="Mobile dashboard navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = activePath.startsWith(item.href.split("#")[0]);

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-label={item.label}
            className={cn(
              "flex min-h-11 items-center justify-center rounded-[14px] text-[#5D6B62] transition-colors",
              active && "bg-[#0D7A43] text-white shadow-[0_10px_24px_rgba(13,122,67,0.2)]"
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      })}
    </nav>
  );
}
