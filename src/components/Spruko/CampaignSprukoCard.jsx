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
  className,
  lineData,
  lineColor,
  link,
}) => {
  if (link) {
    return (
      <Link
        style={className}
        href={link}
        className={`p-6 h-full flex flex-1 items-start justify-between hover:scale-105 transition-all w-full bg-white shadow hover:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)] rounded-md`}
      >
        <div className="flex items-start gap-4 flex-col">
          <div className={`p-2 rounded-full text-2xl ${iconColor} ${bgColor}`}>
            <Icon />
          </div>
          <p className="text-2xl">{value}</p>
          <p className={`text-sm ${color}`}>
            {increase && (
              <span className={color}>
                {increase} <span className=" text-gray-400">Increased</span>
              </span>
            )}
          </p>
        </div>
        <div className="text-right flex flex-col items-center justify-between h-full">
          <p className=" text-gray-400 text-sm">{title}</p>
          <SprukoLineChart data={lineData} color={lineColor} />
        </div>
      </Link>
    );
  }

  return (
    <div
      className={`p-6 flex items-start justify-between hover:scale-105 transition-all w-full bg-white shadow hover:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)] rounded-md`}
    >
      <div className="flex items-start gap-4 flex-col">
        <div className={`p-2 rounded-full text-2xl ${iconColor} ${bgColor}`}>
          <Icon />
        </div>
        <p className="text-2xl">{value}</p>
        <p className={`text-sm ${color}`}>
          {increase && (
            <span className={color}>
              {increase} <span className=" text-gray-400">Increased</span>
            </span>
          )}
        </p>
      </div>
      <div className="text-right flex flex-col items-center justify-between h-full">
        <p className=" text-gray-400 text-sm">{title}</p>
        <SprukoLineChart data={lineData} color={lineColor} />
      </div>
    </div>
  );
};

export default SprukoCard;
