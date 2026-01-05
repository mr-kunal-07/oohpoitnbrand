"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const PieChartNew = ({ data }) => {
  const getRandomColor = (index) => {
    const colors = [
        "#FFAD01",
        "#B77DC4",
        "#6F4BA6",
      "#A7C7E7",
      "#000080",
      "#1F51FF",
      "#CCCCFF",
      "#FF33FF",
      "#FFFF99",
      "#00B3E6",
      "#E6B333",
      "#3366E6",
      "#999966",
      "#99FF99",
      "#B34D4D",
      "#80B300",
      "#809900",
      "#E6B3B3",
      "#6680B3",
      "#66991A",
      "#FF99E6",
      "#CCFF1A",
      "#FF1A66",
      "#E6331A",
      "#33FFCC",
      "#66994D",
      "#B366CC",
      "#4D8000",
      "#B33300",
      "#CC80CC",
      "#66664D",
      "#991AFF",
      "#E666FF",
      "#4DB3FF",
      "#1AB399",
      "#E666B3",
      "#33991A",
      "#CC9999",
      "#B3B31A",
      "#00E680",
      "#4D8066",
      "#809980",
      "#E6FF80",
      "#1AFF33",
      "#999933",
      "#FF3380",
      "#CCCC00",
      "#66E64D",
      "#4D80CC",
      "#9900B3",
      "#E64D66",
      "#4DB380",
      "#FF4D4D",
      "#99E6E6",
      "#6666FF",
    ];
    return colors[index % colors.length];
  };
  // Convert object data into array of objects with name, value, and random color
  const chartData = data
    ? Object.keys(data).map((key, index) => ({
        name: key,
        value: data[key],
        color: getRandomColor(index), // Generate random color based on index
      }))
    : null;

  // Function to generate random color

  return (
    <PieChart width={600} height={400}>
      <Pie
        data={chartData}
        dataKey="value"
        cx={200}
        cy={200}
        outerRadius={120}
        fill="#8884d8"
        label
      >
        {chartData &&
          chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
      </Pie>
      <Tooltip />
      <Legend
        layout='horizontal'
        align="right"
        verticalAlign='bottom'
      />
    </PieChart>
  );
};

export default PieChartNew;