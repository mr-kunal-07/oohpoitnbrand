"use client";
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
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-200">
      <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color: payload[0].payload.color }}>
        {payload[0].value.toLocaleString()}
      </p>
      <p className="text-xs text-slate-500 mt-1">Users</p>
    </div>
  );
};

const DeviceBarChart = ({ data = [], total = 0 }) => {
  const chartData = data.length
    ? data
    : [
      { name: "Android", value: 0, color: "#10B981" },
      { name: "iOS", value: 0, color: "#6366F1" },
    ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-4 sm:px-6 py-4 border-b border-slate-200">
        <p className="text-base sm:text-lg text-slate-900 font-semibold">Device Report</p>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {total.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">Total Devices</div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 sm:p-6">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="androidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="iosGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.6} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#64748B", fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: "#CBD5E1" }}
              tickLine={{ stroke: "#CBD5E1" }}
            />
            <YAxis
              tick={{ fill: "#64748B", fontSize: 12 }}
              axisLine={{ stroke: "#CBD5E1" }}
              tickLine={{ stroke: "#CBD5E1" }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.1)" }} />

            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
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