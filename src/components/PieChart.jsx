"use client"
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Users", value: 400 },
  { name: "Vendors", value: 300 },
  { name: "Campaigns", value: 300 },
];

const SimplePieChart = () => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={60}
        fill="#8884d8"
      />
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

export default SimplePieChart;
