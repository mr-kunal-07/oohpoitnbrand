import React from "react";
import SprukoLineChart from "./SprukoLineChart";
import Link from "next/link";

const SprukoCard = ({
  title,
  value,
  increase,
  Icon,
  lineData,
  lineColor,
  link,
}) => {
  const isPositive = increase?.startsWith("+");

  const CardContent = () => (
    <>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg text-slate-400 mb-1">{title}</p>

          <div className="flex items-center gap-2">
            <h3 className="text-5xl font-semibold text-white tracking-tight">
              {value}
            </h3>

            {increase && (
              <span
                className={`text-lg font-medium flex items-center gap-1 ${
                  isPositive ? "text-green-400" : "text-red-400"
                }`}
              >
                {isPositive ? "▲" : "▼"} {increase.replace("+", "")}
              </span>
            )}
          </div>
        </div>

        {/* Icon */}
        <div className="p-2 rounded-lg bg-slate-800/60 text-slate-300">
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4 h-14">
        <SprukoLineChart data={lineData} color={lineColor} />
      </div>
    </>
  );

  const WrapperClass =
    "relative flex flex-col rounded-xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-sm hover:shadow-lg transition-all";

  if (link) {
    return (
      <Link href={link} className={WrapperClass}>
        <CardContent />
      </Link>
    );
  }

  return (
    <div className={WrapperClass}>
      <CardContent />
    </div>
  );
};

export default SprukoCard;
