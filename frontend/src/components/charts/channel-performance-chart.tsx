"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartTheme } from "@/lib/chart-theme";

export function ChannelPerformanceChart({ data }: { data: { channel: string; share: number }[] }) {
  const [mounted, setMounted] = useState(false);
  const chartData = data.map((item) => ({ ...item, share: Math.round(item.share * 100), channel: item.channel.replace("_", " ") }));

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full w-full rounded-[18px] bg-card-soft" />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="channel" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 11 }} width={28} />
        <Tooltip cursor={{ fill: "rgba(0,166,81,0.06)" }} contentStyle={{ borderRadius: 14, border: "1px solid #e8eef0" }} />
        <Bar dataKey="share" fill={chartTheme.field} radius={[12, 12, 12, 12]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
