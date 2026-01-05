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
      <div className="bg-white px-4 py-3 rounded-lg shadow-xl border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
        <p className="text-2xl font-bold text-indigo-600">
          {payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">Users</p>
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
    Android: "#10B981", // Green
    iOS: "#6366F1",     // Indigo
  };

  return (
    <div className="w-full min-w-[15rem] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-3 py-2">
        <div className="flex items-start justify-between">
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Device Report
              </h2>
            </div>

            <div className="">
              <div className="flex items-baseline">
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {total || 0}
                </p>
                <div className="flex items-center gap-1 px-2">
                  <TrendingUp className="size-4 text-green-600" />
                  <span className="text-md font-bold text-green-600">
                    +{total || 0}
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-xs font-medium">
                Total Devices
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-6 pt-4">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barGap={8}>
            <defs>
              <linearGradient id="androidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                <stop offset="100%" stopColor="#059669" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="iosGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 600 }}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.1)" }} />

            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.name === "Android" ? "url(#androidGradient)" : "url(#iosGradient)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Device Breakdown */}
        {/* <div className="mt-4 space-y-2">
          {chartData.map((device, index) => {
            const percentage = total > 0 ? ((device.value / total) * 100).toFixed(1) : 0;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[device.name] || "#9CA3AF" }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {device.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS[device.name] || "#9CA3AF",
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-12 text-right">
                    {device.value}
                  </span>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div> */}
      </div>
    </div>
  );
};

export default DeviceBarChart;
