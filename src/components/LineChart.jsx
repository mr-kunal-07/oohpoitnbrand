"use client";
import { AiOutlineStock } from "react-icons/ai";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Defs,
  LinearGradient,
  Stop,
} from "recharts";

const SimpleLineChart = ({ head, Icon, data }) => (
  <div className="min-w-[18rem] col-span-2 bg-white rounded-lg flex flex-col justify-center items-center px-2">
    <div className="px-5 pt-10 pb-8 flex justify-between items-start w-full">
      <div className="flex flex-col justify-start items-start gap-2">
        <h4 className="text-oohpoint-primary-2 font-medium">{head}</h4>
        {/* <p className="text-oohpoint-primary-3 text-3xl font-bold">{count}</p> */}
      </div>
      {Icon ? (
        <AiOutlineStock className="text-3xl text-green-500" />
      ) : (
        <AiOutlineStock className="text-3xl text-red-500" />
      )}
    </div>
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data}>
        {/* Define a gradient for the line */}
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#CABAE4" />
            <stop offset="100%" stopColor="#9B43AF" />
          </linearGradient>
        </defs>

        {/* Only horizontal grid lines */}
        <CartesianGrid strokeDasharray="1 1" vertical={false} />

        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />

        {/* Use gradient for the line stroke */}
        <Line
          type="basis"
          dataKey="value"
          stroke="url(#gradient)"
          strokeWidth={4}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default SimpleLineChart;
