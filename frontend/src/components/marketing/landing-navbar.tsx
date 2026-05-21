"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingNavbar({ scrolled }: { scrolled: boolean }) {
  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-8 lg:px-12",
        scrolled
          ? "border-b border-white/[0.08] bg-[#05100A]/78 shadow-[0_18px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl"
          : "border-b border-white/[0.035] bg-[#050806]/12 backdrop-blur-sm"
      )}
    >
      <Link href="/" className="group flex items-center gap-3" aria-label="Syngenta Krishi Copilot home">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[#B7D8C3] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <Sprout className="h-4 w-4" />
        </span>
        <span className="text-[15px] font-semibold text-white">Krishi Copilot</span>
      </Link>

      <div className="hidden items-center gap-8 text-[12px] font-semibold text-white/66 md:flex">
        <a className="relative text-white" href="#platform">
          Platform
          <span className="absolute -bottom-2 left-0 h-px w-full bg-[#1F9D62]" />
        </a>
        <a className="transition-colors hover:text-white" href="#solutions">
          Solutions
        </a>
        <a className="transition-colors hover:text-white" href="#enterprise">
          Enterprise
        </a>
      </div>

      <Link
        href="/planner"
        className="inline-flex h-9 items-center justify-center rounded-full bg-[#1F9D62] px-4 text-[12px] font-semibold text-[#041008] shadow-[0_12px_30px_rgba(31,157,98,0.22),inset_0_1px_0_rgba(255,255,255,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#B7D8C3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B7D8C3]"
      >
        Explore the Platform
      </Link>
    </nav>
  );
}
