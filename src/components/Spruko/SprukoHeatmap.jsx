"use client";
import React from "react";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import { Chart } from "react-chartjs-2";

// Register necessary components with Chart.js
ChartJS.register(
  MatrixController,
  MatrixElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

const data = [
  { day: "Sun", hour: 0, value: 15 },
  { day: "Sun", hour: 1, value: 20 },
  { day: "Sun", hour: 2, value: 35 },
  { day: "Sun", hour: 3, value: 5 },
  { day: "Sun", hour: 4, value: 15 },
  { day: "Sun", hour: 5, value: 30 },
  { day: "Sun", hour: 6, value: 50 },
  { day: "Sun", hour: 7, value: 25 },
  { day: "Sun", hour: 8, value: 60 },
  { day: "Sun", hour: 9, value: 45 },
  { day: "Sun", hour: 10, value: 35 },
  { day: "Sun", hour: 11, value: 20 },
  { day: "Mon", hour: 0, value: 30 },
  { day: "Mon", hour: 1, value: 40 },
  { day: "Mon", hour: 2, value: 25 },
  { day: "Mon", hour: 3, value: 10 },
  { day: "Mon", hour: 4, value: 5 },
  { day: "Mon", hour: 5, value: 15 },
  { day: "Mon", hour: 6, value: 40 },
  { day: "Mon", hour: 7, value: 50 },
  { day: "Mon", hour: 8, value: 20 },
  { day: "Mon", hour: 9, value: 30 },
  { day: "Mon", hour: 10, value: 25 },
  { day: "Mon", hour: 11, value: 15 },
  { day: "Tue", hour: 0, value: 20 },
  { day: "Tue", hour: 1, value: 35 },
  { day: "Tue", hour: 2, value: 45 },
  { day: "Tue", hour: 3, value: 10 },
  { day: "Tue", hour: 4, value: 5 },
  { day: "Tue", hour: 5, value: 25 },
  { day: "Tue", hour: 6, value: 40 },
  { day: "Tue", hour: 7, value: 50 },
  { day: "Tue", hour: 8, value: 30 },
  { day: "Tue", hour: 9, value: 35 },
  { day: "Tue", hour: 10, value: 20 },
  { day: "Tue", hour: 11, value: 15 },
  { day: "Wed", hour: 0, value: 15 },
  { day: "Wed", hour: 1, value: 10 },
  { day: "Wed", hour: 2, value: 20 },
  { day: "Wed", hour: 3, value: 5 },
  { day: "Wed", hour: 4, value: 10 },
  { day: "Wed", hour: 5, value: 30 },
  { day: "Wed", hour: 6, value: 55 },
  { day: "Wed", hour: 7, value: 35 },
  { day: "Wed", hour: 8, value: 40 },
  { day: "Wed", hour: 9, value: 50 },
  { day: "Wed", hour: 10, value: 30 },
  { day: "Wed", hour: 11, value: 20 },
  { day: "Thu", hour: 0, value: 25 },
  { day: "Thu", hour: 1, value: 15 },
  { day: "Thu", hour: 2, value: 35 },
  { day: "Thu", hour: 3, value: 5 },
  { day: "Thu", hour: 4, value: 10 },
  { day: "Thu", hour: 5, value: 25 },
  { day: "Thu", hour: 6, value: 40 },
  { day: "Thu", hour: 7, value: 50 },
  { day: "Thu", hour: 8, value: 30 },
  { day: "Thu", hour: 9, value: 35 },
  { day: "Thu", hour: 10, value: 20 },
  { day: "Thu", hour: 11, value: 15 },
  { day: "Fri", hour: 0, value: 20 },
  { day: "Fri", hour: 1, value: 35 },
  { day: "Fri", hour: 2, value: 45 },
  { day: "Fri", hour: 3, value: 10 },
  { day: "Fri", hour: 4, value: 5 },
  { day: "Fri", hour: 5, value: 25 },
  { day: "Fri", hour: 6, value: 40 },
  { day: "Fri", hour: 7, value: 50 },
  { day: "Fri", hour: 8, value: 30 },
  { day: "Fri", hour: 9, value: 35 },
  { day: "Fri", hour: 10, value: 20 },
  { day: "Fri", hour: 11, value: 15 },
  { day: "Sat", hour: 0, value: 15 },
  { day: "Sat", hour: 1, value: 10 },
  { day: "Sat", hour: 2, value: 20 },
  { day: "Sat", hour: 3, value: 5 },
  { day: "Sat", hour: 4, value: 10 },
  { day: "Sat", hour: 5, value: 30 },
  { day: "Sat", hour: 6, value: 55 },
  { day: "Sat", hour: 7, value: 35 },
  { day: "Sat", hour: 8, value: 40 },
  { day: "Sat", hour: 9, value: 50 },
  { day: "Sat", hour: 10, value: 30 },
  { day: "Sat", hour: 11, value: 20 },
];

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 12 }, (_, i) => i); // 0 to 11 for each hour

// Correctly map the data into the format expected by the heatmap
const matrixData = data.map(({ day, hour, value }) => ({
  x: days.indexOf(day),
  y: hour,
  v: value,
}));

const options = {
  scales: {
    x: {
      type: "category",
      labels: days,
      offset: true,
      grid: { display: false },
    },
    y: {
      type: "category",
      labels: hours.map((hour) =>
        hour === 0 ? "12 AM" : `${hour} ${hour >= 12 ? "PM" : "AM"}`
      ),
      offset: true,
      grid: { display: false },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => `Value: ${context.raw.v}`,
      },
    },
  },
};

const MyHeatmap = () => {
  return (
    <div className="h-[30rem] bg-white shadow rounded-lg col-span-4 lg:col-span-2 xl:col-span-1">
      <div className="p-4 border-b border-gray-200 text-lg">
        <h3>Sessions Duration By Time</h3>
      </div>
      <Chart
        type="matrix"
        data={{
          datasets: [
            {
              label: "My Heatmap",
              data: matrixData,
              backgroundColor: (ctx) => {
                const value = ctx.raw.v;
                const alpha = value / 100; // Control intensity with value
                return `rgba(102, 51, 153, ${alpha})`; // Light purple gradient
              },
              width: 20, // Fixed width for each cell
              height: 12, // Fixed height for each cell
            },
          ],
        }}
        options={{
          ...options,
          maintainAspectRatio: false, // Allow for flexible height
          responsive: true, // Make it responsive
        }}
        style={{ height: "20rem" }} // Set the desired height for the chart
      />
    </div>
  );
};

export default MyHeatmap;
