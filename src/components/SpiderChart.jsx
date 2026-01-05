"use client";
import { Tooltip } from "react-leaflet";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const SpiderChart = ({ head, data }) => (
  <div className="min-w-[18rem] w-[30%] bg-white rounded-lg flex flex-col justify-center items-center px-2">
    <div className="px-5 pt-8 pb-6 flex justify-between items-start w-full">
      <div className="flex flex-col justify-start items-start gap-2">
        <h4 className="text-oohpoint-primary-2 font-medium">{head}</h4>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={182}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis />
        <Tooltip/>
        <Radar
          name="2022"
          dataKey="A"
          stroke="#441886"
          fill="#44188680"
          fillOpacity={1}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);

export default SpiderChart;
