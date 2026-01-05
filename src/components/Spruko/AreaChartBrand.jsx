"use client";
import React from "react";
import { TrendingUp, Users, Smartphone } from "lucide-react";
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
        <p className="text-xs text-gray-500 mt-1">Active Users</p>
      </div>
    );
  }
  return null;
};

const SprukoMixAreaChart = ({ data = [], count = 0, total = 0, type = "gender" }) => {
  // Support both gender and device data
  const defaultData = type === "device" 
    ? [
        { name: "Android", value: 0 },
        { name: "iOS", value: 0 },
      ]
    : [
        { name: "Male", value: 0 },
        { name: "Female", value: 0 },
        { name: "Other", value: 0 },
      ];
  
  const chartData = data?.length ? data : defaultData;

  return (
    <div className="w-full min-w-[15rem] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-3 py-2">
        <div className="flex items-start justify-between">
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                {type === "device" ? (
                  <Smartphone className="w-4 h-4 text-white" />
                ) : (
                  <Users className="w-4 h-4 text-white" />
                )}
              </div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {type === "device" ? "Device Report" : "Audience Report"}
              </h2>
            </div>

            <div className="" >
              <div className="flex items-baseline">
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {total || 0}
                </p>
                <div className="flex items-center gap-1 px-2">
                  <TrendingUp className="size-4 text-green-600" />
                  <span className="text-md font-bold text-green-600">
                    +{count || 0}
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-xs  font-medium">
                {type === "device" ? "Total Devices" : "Currently active now"}
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
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#4F46E5", strokeWidth: 2 }} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#4F46E5"
              strokeWidth={3}
              fill="url(#colorUsers)"
              isAnimationActive={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SprukoMixAreaChart;