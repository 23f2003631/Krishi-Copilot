import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { MobileSidebarNav, SidebarNav } from "@/components/layout/sidebar";

export function DashboardShell({ children, activePath }: { children: ReactNode; activePath: string }) {
  return (
    <main className="dashboard-operating-bg field-grid flex h-screen w-full overflow-hidden font-sans text-[#08110C]">
      <SidebarNav activePath={activePath} />
      <section className="soft-scrollbar relative flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 pb-24 pt-4 sm:px-5 md:p-6 lg:px-8 lg:py-7">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-28 rounded-b-[60px] bg-white/42 blur-3xl" />
        <DashboardHeader />
        <div className="relative z-10 mt-6 flex-1">{children}</div>
      </section>
      <MobileSidebarNav activePath={activePath} />
    </main>
  );
}
