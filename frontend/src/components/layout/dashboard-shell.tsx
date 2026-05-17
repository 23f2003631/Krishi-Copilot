import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sidebar } from "@/components/layout/sidebar";

export function DashboardShell({ children, activePath }: { children: React.ReactNode; activePath: string }) {
  return (
    <main className="min-h-screen bg-background p-3 sm:p-5 lg:p-6">
      <div className="field-grid mx-auto grid min-h-[calc(100vh-40px)] max-w-[1440px] grid-cols-1 overflow-hidden rounded-[32px] bg-shell shell-shadow lg:min-h-[calc(100vh-48px)] lg:grid-cols-[248px_1fr]">
        <Sidebar activePath={activePath} />
        <section className="min-w-0 p-4 sm:p-5 lg:p-6">
          <DashboardHeader />
          <div className="mt-4">{children}</div>
        </section>
      </div>
    </main>
  );
}
