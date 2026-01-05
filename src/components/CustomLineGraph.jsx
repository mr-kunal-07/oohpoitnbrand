"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AiOutlineStock } from "react-icons/ai";

const data = [
  { name: "Point 1", value: 400 },
  { name: "Point 2", value: 300 },
  { name: "Point 3", value: 500 },
  { name: "Point 4", value: 700 }, // Highlight this point
  { name: "Point 5", value: 600 },
  { name: "Point 6", value: 800 },
];

const CustomLineGraph = ({head, count , Icon}) => {
  return (
    <div className="min-w-[18rem] w-[30%] bg-white rounded-lg flex flex-col justify-center items-center px-2">
      {/* Header Text aligned to the left */}
      <div className="px-5 pt-5 pb-6 flex justify-between items-start w-full">
        <div className="flex flex-col justify-start items-start gap-2">
          <h4 className="text-oohpoint-primary-2 font-medium">{head}</h4>
          <p className="text-oohpoint-primary-3 text-3xl font-bold">{count}</p>
        </div>
        {Icon ? (
          <AiOutlineStock className="text-3xl text-green-500" />
        ) : (
          <AiOutlineStock className="text-3xl text-red-500" />
        )}
      </div>

      {/* Responsive Container for the Line Chart */}
      <div className="flex justify-center items-center w-full">
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={data}>
            {/* Grid for Reference */}
            <CartesianGrid strokeDasharray="3 3" />

            {/* Axes */}
            <XAxis dataKey="name" hide />
            <YAxis hide />

            {/* Line with Custom Active Dot */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#85716B"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#8b5cf6" }} // Customize active dot size
            />

            {/* Tooltip */}
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Highlight for Specific Point */}
      <div className="relative mt-2">
        {/* Highlight Dot */}
        <div
          className="absolute left-[60%] top-0 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center"
          style={{ transform: "translateY(-50%)" }}
        >
          <div className="w-2 h-2 bg-gray-800 rounded-full" />
        </div>
        {/* Line Indicator for the Highlight */}
        <div className="h-8 bg-gray-200 w-0.5 mx-auto"></div>
      </div>
    </div>
  );
};

export default CustomLineGraph;
