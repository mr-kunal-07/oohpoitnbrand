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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-lg shadow-xl border border-gray-200">
        <p className="text-xs font-semibold text-gray-600 mb-0.5">{label}</p>
        <p className="text-xl font-bold" style={{ color: payload[0].stroke }}>
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const SprukoLineChart = ({ data, color }) => {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={data}>
        <defs>
          <linearGradient id={`lineGradient-${color}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
          <filter id={`shadow-${color}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" floodColor={color} />
          </filter>
        </defs>
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: "5 5" }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={`url(#lineGradient-${color})`}
          strokeWidth={3}
          dot={false}
          filter={`url(#shadow-${color})`}
          animationDuration={1000}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SprukoLineChart;