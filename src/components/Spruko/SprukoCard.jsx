import React from "react";
import SprukoLineChart from "./SprukoLineChart";
import Link from "next/link";

const SprukoCard = ({ title, value, increase, Icon, lineData, lineColor, link }) => {
  const isPositive = increase?.startsWith("+");

  const CardContent = () => (
    <>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg text-slate-600 mb-1">{title}</p>

          <div className="flex items-center gap-2">
            <h3 className="text-5xl font-semibold text-slate-900 tracking-tight">
              {value}
            </h3>

            {increase && (
              <span
                className={`text-lg font-medium flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"
                  }`}
              >
                {isPositive ? "▲" : "▼"} {increase.replace("+", "")}
              </span>
            )}
          </div>
        </div>

        {/* Icon */}
        <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4 h-14">
        <SprukoLineChart data={lineData} color={lineColor} />
      </div>
    </>
  );

  const wrapperClass =
    "relative flex flex-col rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm hover:shadow-md transition-all hover:border-purple-200";

  if (link) {
    return (
      <Link href={link} className={wrapperClass}>
        <CardContent />
      </Link>
    );
  }

  return (
    <div className={wrapperClass}>
      <CardContent />
    </div>
  );
};

export default SprukoCard;