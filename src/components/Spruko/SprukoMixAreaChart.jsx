"use client";
import React from "react";
import { MdLinearScale, MdReport } from "react-icons/md";
import { PiGraph } from "react-icons/pi";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "12:00", value1: 3000, value2: 2000, value3: 1000 },
  { name: "13:00", value1: 4000, value2: 3000, value3: 2000 },
  { name: "14:00", value1: 3200, value2: 2800, value3: 1500 },
  { name: "15:00", value1: 2780, value2: 4000, value3: 2500 },
  { name: "16:00", value1: 3900, value2: 3200, value3: 1800 },
  { name: "17:00", value1: 4800, value2: 4000, value3: 3200 },
  { name: "18:00", value1: 3800, value2: 3900, value3: 2800 },
  { name: "19:00", value1: 4300, value2: 3700, value3: 3000 },
];

const SprukoMixAreaChart = () => {
  return (
    <div className="w-full min-w-[15rem] p-4 bg-white shadow col-span-11 xl:col-span-3 lg:col-span-6 rounded-lg row-span-3">
      <div className="flex items-start justify-between">
        <div className=" flex flex-col gap-3">
          <h2 className="">Audience Report</h2>
          <p className="text-3xl">12,890<span className="text-xs font-semibold ml-2 text-green-400">+10.5%</span></p>
          <p className="text-gray-400 text-xs">Currently active now</p>
        </div>
        <div className="bg-oohpoint-tertiary-2 p-2 rounded-md">
          <span className="text-white font-bold text-2xl">
            <PiGraph />
          </span>
        </div>
      </div>

      <div>
        <ResponsiveContainer width="100%" height={150}>
          <ComposedChart data={data}>
            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip />
            <Area
              type="linear"
              dataKey="value1"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorValue1)"
            />
            <Area
              type="linear"
              dataKey="value2"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorValue2)"
            />
            <Area
              type="linear"
              dataKey="value3"
              stroke="#ffc658"
              fillOpacity={1}
              fill="url(#colorValue3)"
            />
            <defs>
              <linearGradient id="colorValue1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorValue3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SprukoMixAreaChart;
