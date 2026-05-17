"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartTheme } from "@/lib/chart-theme";

export function CampaignFunnelChart({ data }: { data: { week: string; baseline: number; recommended: number }[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full w-full rounded-[18px] bg-card-soft" />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={8}>
        <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 11 }} width={28} />
        <Tooltip cursor={{ fill: "rgba(49,72,58,0.06)" }} contentStyle={{ borderRadius: 14, border: "1px solid #e8eef0" }} />
        <Bar dataKey="baseline" fill={chartTheme.aiSoft} radius={[12, 12, 12, 12]} />
        <Bar dataKey="recommended" fill={chartTheme.ai} radius={[12, 12, 12, 12]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
