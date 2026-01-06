"use client";
import React from "react";
import { TrendingUp, Smartphone } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg border border-gray-700">
        <p className="text-sm font-semibold mb-1">{label}</p>
        <p className="text-2xl font-bold" style={{ color: payload[0].payload.color }}>
          {payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-400 mt-1">Users</p>
      </div>
    );
  }
  return null;
};

const DeviceBarChart = ({ data = [], total = 0 }) => {
  // Default data for Android and iOS
  const chartData = data?.length
    ? data
    : [
        { name: "Android", value: 0 },
        { name: "iOS", value: 0 },
      ];

  // Colors for each device
  const COLORS = {
    Android: "#10B981",
    iOS: "#6366F1",
  };

  return (
    <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden hover:shadow-3xl transition-shadow duration-300">
      {/* Header */}
      
      <div className="flex justify-between items-center px-6 py-2 border-b border-gray-700">
        <div>
          <p className="text-lg text-white font-semibold tracking-tight">Device Report</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            {total.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Total Devices
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barGap={20}>
            <defs>
              <linearGradient id="androidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="iosGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.8} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: "#4B5563" }}
            />
            <YAxis
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              axisLine={{ stroke: "#4B5563" }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
            />

            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.name === "Android" ? "url(#androidGradient)" : "url(#iosGradient)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DeviceBarChart;
