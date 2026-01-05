"use client";
import React from "react";
import { TrendingUp, Smartphone, Monitor, Tablet } from "lucide-react";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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

const DeviceDistributionChart = ({ data = [], total = 0 }) => {
  // Default data structure for device types
  const chartData = data?.length
    ? data
    : [
        { name: "Android", value: 0, icon: "📱" },
        { name: "iOS", value: 0, icon: "🍎" },
        { name: "Windows", value: 0, icon: "🪟" },
        { name: "MacOS", value: 0, icon: "💻" },
        { name: "Other", value: 0, icon: "🌐" },
      ];

  // Calculate percentages
  const dataWithPercentages = chartData.map((item) => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0,
  }));

  // Get icon based on device type
  const getDeviceIcon = (deviceName) => {
    switch (deviceName.toLowerCase()) {
      case "android":
        return <Smartphone className="w-4 h-4 text-green-600" />;
      case "ios":
        return <Smartphone className="w-4 h-4 text-gray-700" />;
      case "windows":
      case "macos":
      case "linux":
        return <Monitor className="w-4 h-4 text-blue-600" />;
      case "tablet":
        return <Tablet className="w-4 h-4 text-purple-600" />;
      default:
        return <Monitor className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="w-full min-w-[15rem] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-3 py-2">
        <div className="flex items-start justify-between">
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Device Distribution
              </h2>
            </div>

            <div className="">
              <div className="flex items-baseline">
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {total || 0}
                </p>
                <div className="flex items-center gap-1 px-2">
                  <TrendingUp className="size-4 text-green-600" />
                  <span className="text-md font-bold text-green-600">
                    +{chartData.reduce((sum, item) => sum + item.value, 0)}
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
      <div className="p-6 pt-2">
        <ResponsiveContainer
          width="100%"
          height={150}
          key={JSON.stringify(chartData)}
        >
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="colorDevices" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#3B82F6", strokeWidth: 2 }}
            />
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#colorDevices)"
              isAnimationActive={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Device Breakdown */}
      <div className="px-6 pb-6 space-y-2">
        {dataWithPercentages.map((device, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {getDeviceIcon(device.name)}
              <span className="text-sm font-medium text-gray-700">
                {device.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${device.percentage}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900 w-12 text-right">
                {device.value}
              </span>
              <span className="text-xs text-gray-500 w-12 text-right">
                {device.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceDistributionChart;
