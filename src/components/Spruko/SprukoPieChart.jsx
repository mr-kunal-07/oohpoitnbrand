"use client";
import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const targetValueOffline = 100; // Set your desired target value here
const targetValueOnline = 1000;

// Calculate each segment's angle proportionate to the target value
const calculateAngleOnline = (value) => (value / targetValueOnline) * 360;
const calculateAngleOffline = (value) => (value / targetValueOffline) * 360;

const CustomLegend = ({ data }) => (
  <div style={{ textAlign: "center", marginTop: "20px" }}>
    {/* <h3>Total Visitors</h3>
    <h2>{totalVisitors.toLocaleString()}</h2> */}
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginTop: "-1rem",
      }}
    >
      {data.map((entry) => (
        <div key={entry.name} style={{ color: entry.color }} className="pb-2">
          <span style={{ display: "block", fontSize: "12px" }}>
            {entry.name}
          </span>
          <span style={{ fontSize: "22px" }}>
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const SprukoPieChart = ({ totalScans, uniqueScans }) => {
  const data = [
    { name: "Total Engagements", value: totalScans, color: "#8A4FFF" },
    { name: "Unique Engagements", value: uniqueScans, color: "#FF7F50" },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "40px",
      }}
      className="bg-white col-span-2 row-span-2 rounded-lg shadow relative min-w-[15rem]"
    >
      <div className=" absolute top-[calc(50%-1.5rem)] text-center">
        <p className=" text-xs">Total Engagements</p>
        <h2 className="text-lg">{totalScans}</h2>
      </div>
      {/* Online Visitors Pie Chart */}
      <div className="flex justify-start text-lg items-center p-4 border-b border-gray-200 w-full">
        <h3>Scans</h3>
      </div>
      <PieChart width={200} height={180}>
        <Tooltip />

        {/* Background Gray Circle for Online Visitors */}
        <Pie
          data={[data[0]]}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={80}
          startAngle={90}
          endAngle={-270} // Full circle
          dataKey="value"
          stroke="none"
          fill="#D3D3D3" // Gray background color
        />

        {/* Online Visitors Pie */}
        <Pie
          data={[data[0]]}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={80}
          dataKey="value"
          startAngle={90}
          endAngle={90 - calculateAngleOnline(data[0].value)}
          paddingAngle={5}
          strokeLinecap="round" // Rounded edges
        >
          <Cell fill={data[0].color} />
        </Pie>

        {/* Background Gray Circle for Offline Visitors */}
        <Pie
          data={[data[1]]}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={60}
          startAngle={90}
          endAngle={-270} // Full circle
          dataKey="value"
          stroke="none"
          fill="#D3D3D3" // Gray background color
        />

        {/* Offline Visitors Pie */}
        <Pie
          data={[data[1]]}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={60}
          dataKey="value"
          startAngle={90}
          endAngle={90 - calculateAngleOffline(data[1].value)}
          paddingAngle={5}
          strokeLinecap="round" // Rounded edges
        >
          <Cell fill={data[1].color} />
        </Pie>
      </PieChart>

      <CustomLegend data={data} />
    </div>
  );
};

export default SprukoPieChart;
