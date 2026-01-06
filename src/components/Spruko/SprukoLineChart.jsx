"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur px-3 py-2 rounded-lg shadow-xl border border-slate-700">
        <p className="text-lg font-semibold text-white">
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const normalizeData = (data = []) => {
  if (!Array.isArray(data)) return [];

  // Case 1: already object-based
  if (typeof data[0] === "object") return data;

  // Case 2: number array → convert
  const mapped = data.map((value, index) => ({
    name: index,
    value,
  }));

  // Ensure at least 2 points
  if (mapped.length === 1) {
    mapped.push({ name: 1, value: mapped[0].value });
  }

  return mapped;
};

const SprukoLineChart = ({ data = [], color = "#3b82f6" }) => {
  const chartData = normalizeData(data);

  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={chartData}>
        <defs>
          <linearGradient
            id={`lineGradient-${color}`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>

          <filter id={`shadow-${color}`}>
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="3"
              floodColor={color}
              floodOpacity="0.35"
            />
          </filter>
        </defs>

        <XAxis hide />
        <YAxis hide />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
        />

        <Line
          type="monotone"
          dataKey="value"
          stroke={`url(#lineGradient-${color})`}
          strokeWidth={2.5}
          dot={false}
          activeDot={false}
          filter={`url(#shadow-${color})`}
          animationDuration={800}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SprukoLineChart;
