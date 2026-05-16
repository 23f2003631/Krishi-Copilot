"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartTheme } from "@/lib/chart-theme";

const data = [
  { label: "Delivered", baseline: 98, recommended: 98 },
  { label: "Opened", baseline: 23, recommended: 31 },
  { label: "Clicked", baseline: 5, recommended: 8 },
  { label: "Leads", baseline: 43, recommended: 69 }
];

export function SegmentEngagementChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full w-full rounded-[18px] bg-card-soft" />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="recommendedGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor={chartTheme.ai} stopOpacity={0.28} />
            <stop offset="95%" stopColor={chartTheme.ai} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 11 }} width={28} />
        <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e8eef0" }} />
        <Area dataKey="baseline" stroke={chartTheme.aiSoft} fill="transparent" strokeWidth={2} />
        <Area dataKey="recommended" stroke={chartTheme.ai} fill="url(#recommendedGradient)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
