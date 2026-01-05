import React, { useContext, useEffect, useState } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Bar,
  Line,
  ResponsiveContainer,
} from "recharts";
import { FilterIcon, ChevronDownIcon } from "lucide-react";

const SprukoMixChart = ({ campaigns }) => {
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState("Monthly");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Custom legend data
  const legendItems = [
    { name: "Closed", color: "#c1c1c1" },
    { name: "Active", color: "#8884d8" },
    { name: "Upcoming", color: "#ff7300" },
  ];

  // Helper function to calculate the status
  const getStatus = (startDate, endDate) => {
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const start = new Date(startDate.seconds * 1000).setHours(0, 0, 0, 0);
    const end = new Date(endDate?.seconds * 1000).setHours(0, 0, 0, 0);

    if (currentDate < start) return "Upcoming";
    if (currentDate > end) return "Closed";
    return "Active";
  };

  // Filter the data based on the selected filter type (Monthly, Weekly, Yearly)
  const filterData = (filter) => {
    let filteredData = [];
    
    if (filter === "Monthly") {
      filteredData = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString("default", { month: "short" }),
        closed: 0,
        active: 0,
        upcoming: 0,
      }));
      
      campaigns.forEach((campaign) => {
        const status = getStatus(campaign.startDate, campaign.endDate);
        const createdAtMonth = new Date(
          campaign.createdAt.seconds * 1000
        ).getMonth();

        if (status === "Closed") filteredData[createdAtMonth].closed += 1;
        if (status === "Active") filteredData[createdAtMonth].active += 1;
        if (status === "Upcoming") filteredData[createdAtMonth].upcoming += 1;
      });
    }

    if (filter === "Weekly") {
      // Calculate weekly data (you can adjust logic here)
      filteredData = Array.from({ length: 5 }, (_, i) => ({
        week: `Week ${i + 1}`,
        closed: 0,
        active: 0,
        upcoming: 0,
      }));

      campaigns.forEach((campaign) => {
        const status = getStatus(campaign.startDate, campaign.endDate);
        const weekNumber = Math.floor(new Date(campaign.createdAt.seconds * 1000).getDate() / 7);
        
        if (status === "Closed") filteredData[weekNumber].closed += 1;
        if (status === "Active") filteredData[weekNumber].active += 1;
        if (status === "Upcoming") filteredData[weekNumber].upcoming += 1;
      });
    }

    if (filter === "Yearly") {
      // Calculate yearly data (you can adjust logic here)
      const currentYear = new Date().getFullYear();
      filteredData = Array.from({ length: 5 }, (_, i) => ({
        year: currentYear - i,
        closed: 0,
        active: 0,
        upcoming: 0,
      }));

      campaigns.forEach((campaign) => {
        const status = getStatus(campaign.startDate, campaign.endDate);
        const createdYear = new Date(campaign.createdAt.seconds * 1000).getFullYear();
        
        if (status === "Closed") filteredData.find(d => d.year === createdYear).closed += 1;
        if (status === "Active") filteredData.find(d => d.year === createdYear).active += 1;
        if (status === "Upcoming") filteredData.find(d => d.year === createdYear).upcoming += 1;
      });
    }

    return filteredData;
  };

  useEffect(() => {
    if (!campaigns || campaigns.length === 0) {
      console.log("No campaigns data available");
      return;
    }

    const filtered = filterData(filterType);
    setData(filtered);
  }, [campaigns, filterType]);

  const renderLegend = () => (
    <div
      style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}
      className="gap-4"
    >
      {legendItems.map((item) => (
        <div key={item.name} style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              backgroundColor: item.color,
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              marginRight: "5px",
            }}
          />
          <span className="text-sm">{item.name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-md:lg:w-[66%]  w-full bg-white shadow rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <p className="text-oohpoint-primary-2 text-xl">Campaign Status Overview</p>
        <div className="relative inline-block text-left">
          {/* Filter Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center bg-white rounded-md px-4 py-2 border hover:bg-neutral-100 shadow-sm"
          >
            <FilterIcon className="h-5 w-5 mr-2" />
            <span>Filters</span>
            <ChevronDownIcon className="h-5 w-5 ml-2" />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
              <div className="p-4 space-y-4">
                <div className={'cursor-pointer'} onClick={() => setFilterType("Yearly")}>Yearly</div>
                <div className={'cursor-pointer'} onClick={() => setFilterType("Monthly")}>Monthly</div>
                <div className={'cursor-pointer'} onClick={() => setFilterType("Weekly")}>Weekly</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer aspect={3}>
        <div className="pt-2 pb-4">{renderLegend()}</div>
        <ComposedChart data={data} margin={{ right: 40 }}>
          <defs>
            <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c1c1c1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#c1c1c1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorUpcoming" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ff7300" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey={filterType === "Monthly" ? "month" : filterType === "Weekly" ? "week" : "year"} />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="closed"
            stroke="#c1c1c1"
            fillOpacity={0.5}
            fill="url(#colorClosed)"
          />
          <Bar
            dataKey="active"
            fill="#8884d8"
            barSize={12}
            radius={[5, 5, 5, 5]}
          />
          <Line
            type="monotone"
            dataKey="upcoming"
            stroke="#ff7300"
            dot={false}
            strokeDasharray="6 5"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SprukoMixChart;
