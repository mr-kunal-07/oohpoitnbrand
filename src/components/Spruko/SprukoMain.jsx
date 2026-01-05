import React from "react";
import SprukoCard from "./SprukoCard";
import { FaPeopleCarry, FaRupeeSign } from "react-icons/fa";
import { RiIncreaseDecreaseLine } from "react-icons/ri";
import { PiClockAfternoonFill } from "react-icons/pi";
import SprukoPieChart from "./SprukoPieChart";
import SprukoMixChart from "./SprukoMixChart";
import SprukoActivityCard from "./SprukoActivityCard";
import SprukoMixAreaChart from "./SprukoMixAreaChart";
import SprukoTable from "./SprukoTable";

const SprukoMain = () => {
  const stats = [
    {
      title: "Total Followers",
      value: "12,432",
      increase: "+0.892",
      color: "text-green-500",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-500",
      icon: FaPeopleCarry,
      lineColor: "purple",
    },
    {
      title: "Bounce Rate",
      value: "12,432",
      increase: "+0.892",
      color: "text-green-500",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-500",
      icon: RiIncreaseDecreaseLine,
      lineColor: "orange",
    },
    {
      title: "Conversion Rate",
      value: "12,432",
      increase: "+0.892",
      color: "text-green-500",
      bgColor: "bg-green-100",
      iconColor: "text-green-500",
      icon: FaRupeeSign,
      lineColor: "green",
    },
    {
      title: "Session Duration",
      value: "3hrs",
      increase: "+0.892",
      color: "text-green-500",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-500",
      icon: PiClockAfternoonFill,
      lineColor: "blue",
    },
  ];

  const lineData = [
    { name: "Jan", value: 10 },
    { name: "Feb", value: 12 },
    { name: "Mar", value: 8 },
    { name: "Apr", value: 15 },
    { name: "May", value: 10 },
    { name: "Jun", value: 17 },
  ];

  return (
    <div className="h-full w-full px-3 my-8">
      <div className="grid grid-cols-11 w-full gap-6">
        {stats.map((stat, index) => (
          <SprukoCard
            key={index}
            title={stat.title}
            value={stat.value}
            increase={stat.increase}
            color={stat.color}
            iconColor={stat.iconColor}
            Icon={stat.icon}
            bgColor={stat.bgColor}
            lineData={lineData}
            lineColor={stat.lineColor}
          />
        ))}
        <SprukoPieChart />
        <SprukoMixChart />
        <SprukoActivityCard />
        <SprukoMixAreaChart />
      </div>
      <div className="grid grid-cols-4 w-full gap-6 mt-6 pb-8">
        {/* <SprukoHeatmap/> */}
        <SprukoTable/>
      </div>
    </div>
  );
};

export default SprukoMain;
