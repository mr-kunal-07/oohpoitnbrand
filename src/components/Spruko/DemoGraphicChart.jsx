"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const calculateAngle = (value, total) => (value / total) * 360;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm font-semibold text-gray-800">{data.name}</p>
        <p className="text-lg font-bold" style={{ color: data.payload.color }}>
          {data.value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">
          {((data.value / data.payload.total) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ data }) => (
  <div className="flex justify-center gap-8 px-6 pb-6">
    {data.map((entry) => (
      <div key={entry.name} className="flex flex-col items-center group cursor-default transition-transform hover:scale-105">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {entry.name}
          </span>
        </div>
        <span className="text-2xl font-bold" style={{ color: entry.color }}>
          {entry.value.toLocaleString()}
        </span>
        <span className="text-xs text-gray-400 mt-0.5">
          {((entry.value / entry.total) * 100).toFixed(1)}%
        </span>
      </div>
    ))}
  </div>
);

const SprukoPieChart = ({ male, female, other, total, chartTitle }) => {
  const data = [
    { name: "Male", value: male, color: "#8B5CF6", total },
    { name: "Female", value: female, color: "#F97316", total },
    { name: "Other", value: other, color: "#14B8A6", total },
  ];
  console.log(data)

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {chartTitle || "Users"}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">Gender Distribution</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            {total.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
        </div>
      </div>

      {/* Chart */}
      <div className="py-6">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Tooltip content={<CustomTooltip />} />

            {/* Male - Outer Ring */}
            <Pie
              data={[{ value: total }]}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={85}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              fill="#E5E7EB"
            />
            <Pie
              data={[data[0]]}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={85}
              dataKey="value"
              startAngle={90}
              endAngle={90 - calculateAngle(data[0].value, total)}
              strokeLinecap="round"
              stroke="white"
              strokeWidth={2}
            >
              <Cell fill={data[0].color} className="drop-shadow-md" />
            </Pie>

            {/* Female - Middle Ring */}
            <Pie
              data={[{ value: total }]}
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={64}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              fill="#E5E7EB"
            />
            <Pie
              data={[data[1]]}
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={64}
              dataKey="value"
              startAngle={90}
              endAngle={90 - calculateAngle(data[1].value, total)}
              strokeLinecap="round"
              stroke="white"
              strokeWidth={2}
            >
              <Cell fill={data[1].color} className="drop-shadow-md" />
            </Pie>

            {/* Other - Inner Ring */}
            <Pie
              data={[{ value: total }]}
              cx="50%"
              cy="50%"
              innerRadius={33}
              outerRadius={43}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              fill="#E5E7EB"
            />
            <Pie
              data={[data[2]]}
              cx="50%"
              cy="50%"
              innerRadius={33}
              outerRadius={43}
              dataKey="value"
              startAngle={90}
              endAngle={90 - calculateAngle(data[2].value, total)}
              strokeLinecap="round"
              stroke="white"
              strokeWidth={2}
            >
              <Cell fill={data[2].color} className="drop-shadow-md" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <CustomLegend data={data} />
    </div>
  );
};

export default SprukoPieChart