"use client";

import React, { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface MetricChartProps {
  data: { day: string; bookings: number }[];
}

export function MetricChart({ data }: MetricChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-[250px] w-full bg-gray-50 animate-pulse rounded-md"></div>;

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }} 
            dy={10}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontWeight: 500
            }}
          />
          <Line 
            type="monotone" 
            dataKey="bookings" 
            stroke="var(--admin-primary-mid)" 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6, fill: "var(--admin-primary-mid)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
