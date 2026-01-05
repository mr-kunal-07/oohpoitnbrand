import React from "react";
import SprukoLineChart from "./SprukoLineChart";
import Link from "next/link";

const SprukoCard = ({
  title,
  value,
  increase,
  color,
  iconColor,
  Icon,
  bgColor,
  lineData,
  lineColor,
  link,
}) => {
  const CardContent = () => (
    <>
      {/* Card Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
            {increase && (
              <span className={`text-sm font-semibold ${color} flex items-center gap-1`}>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                {increase}
              </span>
            )}
          </div>
          {increase && (
            <p className="text-xs text-slate-500 mt-1">vs last week</p>
          )}
        </div>

        {/* Icon */}
        <div className={`p-3 rounded-xl ${bgColor} ${iconColor} shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Chart Section */}
      <div className="mt-auto">
        <div className="h-16 -mx-1">
          <SprukoLineChart data={lineData} color={lineColor} />
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${lineColor === 'blue' ? 'from-blue-400 to-blue-600' :
        lineColor === 'pink' ? 'from-pink-400 to-pink-600' :
          lineColor === 'green' ? 'from-green-400 to-green-600' :
            lineColor === 'red' ? 'from-red-400 to-red-600' :
              'from-gray-400 to-gray-600'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </>
  );

  if (link) {
    return (
      <Link
        href={link}
        className="group relative flex flex-col bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden p-6 min-h-[200px]"
      >
        <CardContent />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Link>
    );
  }

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden p-6 min-h-[200px]">
      <CardContent />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default SprukoCard;