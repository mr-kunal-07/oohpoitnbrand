"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const calculateAngle = (value, total) => (value / total) * 360;

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0];
  return (
    <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-200">
      <p className="text-sm font-semibold text-slate-700 mb-1">{data.name}</p>
      <p className="text-lg font-bold" style={{ color: data.payload.color }}>
        {data.value.toLocaleString()}
      </p>
      <p className="text-xs text-slate-500">
        {((data.value / data.payload.total) * 100).toFixed(1)}%
      </p>
    </div>
  );
};

const CustomLegend = ({ data }) => (
  <div className="grid grid-cols-3 gap-4 px-4 sm:px-6 pb-6">
    {data.map((entry) => (
      <div key={entry.name} className="flex flex-col items-center">
        <div className="flex items-center gap-1.5 mb-1">
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {entry.name}
          </span>
        </div>
        <span className="text-xl sm:text-2xl font-bold" style={{ color: entry.color }}>
          {entry.value.toLocaleString()}
        </span>
        <span className="text-xs text-slate-400 mt-0.5">
          {((entry.value / entry.total) * 100).toFixed(1)}%
        </span>
      </div>
    ))}
  </div>
);

const SprukoPieChart = ({ male = 0, female = 0, other = 0, total: propTotal }) => {
  // Calculate total from individual values if not provided
  const total = propTotal !== undefined ? propTotal : male + female + other;

  const data = [
    { name: "Male", value: male, color: "#8B5CF6", total },
    { name: "Female", value: female, color: "#F97316", total },
    { name: "Other", value: other, color: "#14B8A6", total },
  ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-4 sm:px-6 py-4 border-b border-slate-200">
        <p className="text-base sm:text-lg text-slate-900 font-semibold">Gender Distribution</p>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            {total.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">Total</div>
        </div>
      </div>

      {/* Chart */}
      <div className="py-4 sm:py-6">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Tooltip content={<CustomTooltip />} />

            {/* Male - Outer Ring */}
            <Pie
              data={[{ value: total }]}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              fill="#E2E8F0"
            />
            <Pie
              data={[data[0]]}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={80}
              dataKey="value"
              startAngle={90}
              endAngle={90 - calculateAngle(data[0].value, total)}
              strokeLinecap="round"
              stroke="white"
              strokeWidth={2}
            >
              <Cell fill={data[0].color} />
            </Pie>

            {/* Female - Middle Ring */}
            <Pie
              data={[{ value: total }]}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={60}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              fill="#E2E8F0"
            />
            <Pie
              data={[data[1]]}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={60}
              dataKey="value"
              startAngle={90}
              endAngle={90 - calculateAngle(data[1].value, total)}
              strokeLinecap="round"
              stroke="white"
              strokeWidth={2}
            >
              <Cell fill={data[1].color} />
            </Pie>

            {/* Other - Inner Ring */}
            <Pie
              data={[{ value: total }]}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={40}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              fill="#E2E8F0"
            />
            <Pie
              data={[data[2]]}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={40}
              dataKey="value"
              startAngle={90}
              endAngle={90 - calculateAngle(data[2].value, total)}
              strokeLinecap="round"
              stroke="white"
              strokeWidth={2}
            >
              <Cell fill={data[2].color} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <CustomLegend data={data} />
    </div>
  );
};

export default SprukoPieChart;