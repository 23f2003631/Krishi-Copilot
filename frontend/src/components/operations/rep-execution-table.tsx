"use client";

import { Download, ClipboardList } from "lucide-react";
import type { FieldAction } from "@/types/contracts";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { TableWrapper } from "@/components/dashboard/table-wrapper";
import { Badge } from "@/components/ui/badge";

export function RepExecutionTable({ actions }: { actions: FieldAction[] }) {
  function exportReport() {
    const header = ["action_id", "rep_id", "territory_id", "action_type", "summary", "due_date", "priority"];
    const rows = actions.map((action) => [
      action.action_id,
      action.rep_id,
      action.territory_id,
      action.action_type,
      action.summary,
      action.due_date,
      action.priority,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rep-execution-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardCard className="p-0">
      <div className="flex flex-col gap-4 border-b border-[#0B5B34]/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          icon={ClipboardList}
          title="Rep Execution Table"
          description="Accountable field activities tied to territory, due date, and priority."
        />
        <button
          type="button"
          onClick={exportReport}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#0B5B34]/12 bg-white/72 px-4 text-[13px] font-semibold text-[#0B5B34] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:bg-white"
        >
          Export Report
          <Download className="h-4 w-4" />
        </button>
      </div>

      <TableWrapper className="rounded-none border-0 bg-transparent shadow-none">
        <table className="min-w-[960px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#0B5B34]/[0.08] bg-[#EEF7F0]/70 text-[11px] font-bold uppercase tracking-[0.08em] text-[#35433A]">
              <th className="px-5 py-4">Action ID</th>
              <th className="px-5 py-4">Rep</th>
              <th className="px-5 py-4">Territory</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Summary</th>
              <th className="px-5 py-4">Due Date</th>
              <th className="px-5 py-4 text-right">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0B5B34]/[0.07] bg-white/54">
            {actions.slice(0, 4).map((action) => (
              <tr key={action.action_id} className="text-[14px] text-[#08110C] transition-colors hover:bg-[#F7FAF8]/80">
                <td className="px-5 py-5 text-[12px] font-semibold text-[#35433A]">{action.action_id}</td>
                <td className="px-5 py-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DDEADF] text-[11px] font-bold text-[#0B5B34]">
                      {action.rep_id.replace("REP_", "R").slice(0, 3)}
                    </span>
                    <span className="font-medium">{action.rep_id}</span>
                  </div>
                </td>
                <td className="px-5 py-5">{action.territory_id}</td>
                <td className="px-5 py-5">
                  <span className="rounded-[8px] bg-[#DDEADF]/70 px-2.5 py-1 text-[11px] font-semibold capitalize text-[#35433A]">
                    {action.action_type.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="max-w-[320px] px-5 py-5 leading-6 text-[#35433A]">{action.summary}</td>
                <td className="px-5 py-5">{action.due_date}</td>
                <td className="px-5 py-5 text-right">
                  <Badge variant={action.priority === "high" ? "success" : action.priority === "medium" ? "soft" : "default"}>
                    {action.priority}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
      <div className="border-t border-[#0B5B34]/[0.08] bg-[#F7FAF8]/70 px-5 py-4 text-center text-[13px] font-semibold text-[#0D7A43]">
        View All Activities ({actions.length})
      </div>
    </DashboardCard>
  );
}
