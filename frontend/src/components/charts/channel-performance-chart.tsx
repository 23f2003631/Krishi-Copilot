"use client";

import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { chartTheme } from "@/lib/chart-theme";

export function ChannelPerformanceChart({ data }: { data: { channel: string; share: number }[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const chartData = data.map((item) => ({ ...item, share: Math.round(item.share * 100), channel: item.channel.replace("_", " ") }));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const update = () => {
      const rect = root.getBoundingClientRect();
      setSize({ width: Math.max(0, Math.floor(rect.width)), height: Math.max(0, Math.floor(rect.height)) });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="h-full min-h-[180px] w-full min-w-0">
      {size.width > 20 && size.height > 20 ? (
        <BarChart width={size.width} height={size.height} data={chartData}>
          <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="channel" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 11 }} width={28} />
          <Tooltip cursor={{ fill: "rgba(29,155,98,0.08)" }} contentStyle={{ borderRadius: 14, border: "1px solid #dde7e0" }} />
          <Bar dataKey="share" fill={chartTheme.field} radius={[12, 12, 12, 12]} />
        </BarChart>
      ) : (
        <div className="h-full w-full rounded-[14px] bg-[#DDEADF]/45" />
      )}
    </div>
  );
}
