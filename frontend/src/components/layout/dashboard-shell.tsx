import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sidebar } from "@/components/layout/sidebar";

export function DashboardShell({ children, activePath }: { children: React.ReactNode; activePath: string }) {
  return (
    <main className="dashboard-operating-bg h-screen w-full flex overflow-hidden font-sans text-gray-900">
      <Sidebar activePath={activePath} />
      <section className="relative flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden p-5 lg:px-8 lg:py-7">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-28 rounded-b-[60px] bg-white/42 blur-3xl" />
        <DashboardHeader />
        <div className="relative z-10 mt-7 flex-1">{children}</div>
      </section>
    </main>
  );
}
