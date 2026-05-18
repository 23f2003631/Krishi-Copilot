"use client";

import Link from "next/link";
import { Tractor, LayoutGrid, Megaphone, FileText, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ activePath }: { activePath: string }) {
  const navItems = [
    { icon: Tractor, href: "/planner", active: true },
    { icon: LayoutGrid, href: "#", active: false },
    { icon: Megaphone, href: "#", active: false },
    { icon: FileText, href: "#", active: false },
  ];

  return (
    <aside className="w-[82px] h-full border-r border-[#0B5B34]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,250,248,0.86))] flex flex-col items-center py-6 shadow-[8px_0_34px_rgba(9,18,13,0.055),inset_-1px_0_0_rgba(255,255,255,0.75)] backdrop-blur-xl">
      
      {/* Top Nav Items */}
      <nav className="flex flex-col items-center gap-6 mt-4">
        {navItems.map((item, i) => (
          <Link key={i} href={item.href} className="group relative flex items-center justify-center">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300",
              item.active ? "border-[#0D7A43]/20 bg-[#0D7A43] text-white shadow-[0_12px_26px_rgba(13,122,67,0.24),inset_0_1px_0_rgba(255,255,255,0.2)]" : "border-transparent text-[#6B7280] hover:border-[#0B5B34]/10 hover:bg-[#DDEADF]/45 hover:text-[#0B5B34]"
            )}>
              <item.icon className="h-5 w-5" />
            </div>
          </Link>
        ))}
      </nav>

      {/* Bottom Nav Items */}
      <div className="mt-auto flex flex-col items-center gap-6 pb-4">
        <button className="text-[#6B7280] hover:text-[#0B5B34] transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-[linear-gradient(145deg,#DDEADF,#FFFFFF)] text-[11px] font-semibold text-[#0B5B34] shadow-[0_8px_20px_rgba(9,18,13,0.12)]">
          CM
        </button>
      </div>

    </aside>
  );
}
