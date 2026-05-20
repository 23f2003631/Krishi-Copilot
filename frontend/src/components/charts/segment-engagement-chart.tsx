"use client";

import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { chartTheme } from "@/lib/chart-theme";

const data = [
  { label: "Delivered", baseline: 98, recommended: 98 },
  { label: "Opened", baseline: 23, recommended: 31 },
  { label: "Clicked", baseline: 5, recommended: 8 },
  { label: "Leads", baseline: 43, recommended: 69 },
];

export function SegmentEngagementChart() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

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
        <AreaChart width={size.width} height={size.height} data={data}>
          <defs>
            <linearGradient id="recommendedGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={chartTheme.ai} stopOpacity={0.28} />
              <stop offset="95%" stopColor={chartTheme.ai} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTheme.text, fontSize: 11 }} width={28} />
          <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #dde7e0" }} />
          <Area dataKey="baseline" stroke={chartTheme.aiSoft} fill="transparent" strokeWidth={2} />
          <Area dataKey="recommended" stroke={chartTheme.ai} fill="url(#recommendedGradient)" strokeWidth={2} />
        </AreaChart>
      ) : (
        <div className="h-full w-full rounded-[14px] bg-[#DDEADF]/45" />
      )}
    </div>
  );
}
