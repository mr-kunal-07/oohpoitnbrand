'use client';

import React from "react";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { LineChart, Line, XAxis } from "recharts";

export function ViewStatistic() {
  const data = [
    { time: "12:00 am", views: 1000 },
    { time: "3:00 am", views: 500 },
    { time: "6:00 am", views: 2000 },
    { time: "9:00 am", views: 8000 },
    { time: "12:00 pm", views: 50000 },
    { time: "3:00 pm", views: 30000 },
    { time: "6:00 pm", views: 10000 },
    { time: "9:00 pm", views: 5000 },
    { time: "11:59 pm", views: 1000 },
  ];

  return (
    <div
      className="bg-white p-6 rounded-lg"
    >
      <div
        className="flex justify-between items-center mb-4"
      >
        <h2 className="text-xl font-semibold">
          View Statistic
        </h2>
        <button
          className="px-3 py-1 bg-gray-200 rounded-md text-sm"
        >
          Yesterday
        </button>
      </div>
      <ChartContainer
        config={{}}
        className="aspect-[none] h-[250px]"
      >
        <LineChart data={data}>
          <ChartTooltip
            content={({ payload }) => {
              if (payload && payload.length) {
                return (
                  <div
                    className="bg-white p-2 border rounded shadow"
                  >
                    <p>{`${payload[0].value} Views`}</p>
                  </div>
                );
              }
              return null;
            }}
          />

          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
