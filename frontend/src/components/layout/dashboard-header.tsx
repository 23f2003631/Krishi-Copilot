import { Bell, Search, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 overflow-hidden rounded-full border border-white bg-gradient-to-br from-[#d8f4e4] to-[#dce7ff] shadow-[0_10px_24px_rgba(31,56,88,0.08)]">
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-ai">SK</div>
        </div>
        <div>
          <h1 className="text-[22px] font-semibold leading-7 text-foreground">Hey, Priya</h1>
          <p className="text-xs leading-5 text-muted">Sunday, May 17, 2026</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex h-11 min-w-0 items-center gap-3 rounded-full border border-border bg-white px-4 shadow-[0_8px_24px_rgba(31,56,88,0.05)] sm:w-[340px]">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-[#b6c0c7]"
            placeholder="Start searching here..."
          />
        </label>
        <div className="flex gap-2">
          <Button variant="secondary" size="icon" aria-label="Settings">
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

