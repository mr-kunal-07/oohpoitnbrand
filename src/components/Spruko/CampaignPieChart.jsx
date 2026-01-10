"use client";
import { Users } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const calculateAngle = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 360;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0];
  return (
    <div className="bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg border border-slate-200">
      <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-1">{data.name}</p>
      <p className="text-base sm:text-lg font-bold" style={{ color: data.payload.color }}>
        {data.value.toLocaleString()}
      </p>
      <p className="text-xs text-slate-500">
        {data.payload.total > 0 ? ((data.value / data.payload.total) * 100).toFixed(1) : 0}%
      </p>
    </div>
  );
};

const CustomLegend = ({ data }) => (
  <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
    {data.map((entry) => (
      <div key={entry.name} className="flex flex-col items-center text-center">
        <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
          <div
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-sm flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide truncate">
            {entry.name}
          </span>
        </div>
        <span className="text-lg sm:text-xl md:text-2xl font-bold leading-tight" style={{ color: entry.color }}>
          {entry.value.toLocaleString()}
        </span>
        <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
          {entry.total > 0 ? ((entry.value / entry.total) * 100).toFixed(1) : 0}%
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

  // Ring sizes - responsive
  const getRingSizes = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return {
        outer: { inner: 60, outer: 70 },
        middle: { inner: 42, outer: 52 },
        inner: { inner: 24, outer: 34 }
      };
    }
    return {
      outer: { inner: 70, outer: 80 },
      middle: { inner: 50, outer: 60 },
      inner: { inner: 30, outer: 40 }
    };
  };

  const rings = getRingSizes();

  return (
    <div className="w-full bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header - Fully Responsive */}
      <div className="flex bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 flex-col xs:flex-row justify-between items-start xs:items-center gap-2 px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 border-b border-slate-200">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-600 flex-shrink-0" />
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-slate-900 font-semibold">
            Gender Distribution
          </p>
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            {total.toLocaleString()}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">Total</div>
        </div>
      </div>

      {/* Chart - Responsive Height */}
      <div className="py-3 sm:py-4 md:py-6">
        {total > 0 ? (
          <ResponsiveContainer width="100%" height={180} className="sm:!h-[200px] md:!h-[220px]">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />

              {/* Male - Outer Ring */}
              <Pie
                data={[{ value: total }]}
                cx="50%"
                cy="50%"
                innerRadius={rings.outer.inner}
                outerRadius={rings.outer.outer}
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
                innerRadius={rings.outer.inner}
                outerRadius={rings.outer.outer}
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
                innerRadius={rings.middle.inner}
                outerRadius={rings.middle.outer}
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
                innerRadius={rings.middle.inner}
                outerRadius={rings.middle.outer}
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
                innerRadius={rings.inner.inner}
                outerRadius={rings.inner.outer}
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
                innerRadius={rings.inner.inner}
                outerRadius={rings.inner.outer}
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
        ) : (
          // Empty State
          <div className="h-[180px] sm:h-[200px] md:h-[220px] flex flex-col items-center justify-center text-slate-400 gap-2">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 opacity-30" />
            <p className="text-xs sm:text-sm font-medium">No gender data available</p>
          </div>
        )}
      </div>

      {/* Legend - Responsive */}
      <CustomLegend data={data} />
    </div>
  );
};

export default SprukoPieChart;