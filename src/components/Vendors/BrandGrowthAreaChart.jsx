import React, { useState, useMemo, useContext } from "react";
import { TrendingUp, Calendar, ChevronDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MyContext } from "@/context/MyContext";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.[0]) {
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-xl border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
        <p className="text-2xl font-bold text-blue-600">
          {payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">Total Scans</p>
      </div>
    );
  }
  return null;
};

const FilterButton = ({ type, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${isActive
      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
  >
    {type}
  </button>
);

const FILTER_TYPES = ["Yearly", "Monthly", "Weekly", "Daily"];

const BrandGrowthAreaChart = ({ brandId }) => {
  const { campaigns } = useContext(MyContext);
  const [filterType, setFilterType] = useState("Monthly");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ✅ Get brand-specific campaigns and their scans
  const brandScans = useMemo(() => {
    const scans = [];

    campaigns.forEach((campaign) => {
      // Filter campaigns by brand
      if (campaign.client === brandId && campaign.ipAddress?.length) {
        campaign.ipAddress.forEach((scan) => {
          scans.push({
            createdAt: scan.createdAt,
            userId: scan.userId,
          });
        });
      }
    });

    return scans;
  }, [campaigns, brandId]);

  // ✅ Generate chart data based on filter type
  const chartData = useMemo(() => {
    const today = new Date();
    let data = [];

    switch (filterType) {
      case "Monthly":
        // Create 12 months
        data = Array.from({ length: 12 }, (_, i) => ({
          name: new Date(0, i).toLocaleString("default", { month: "short" }),
          Scans: 0,
        }));

        brandScans.forEach((scan) => {
          const date = new Date(scan.createdAt);
          if (!isNaN(date)) {
            data[date.getMonth()].Scans += 1;
          }
        });
        break;

      case "Daily":
        // Days in current month
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        data = Array.from({ length: daysInMonth }, (_, i) => ({
          name: `${i + 1} ${today.toLocaleString("default", { month: "short" })}`,
          Scans: 0,
        }));

        brandScans.forEach((scan) => {
          const date = new Date(scan.createdAt);
          if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
            data[date.getDate() - 1].Scans += 1;
          }
        });
        break;

      case "Weekly":
        // 5 weeks in current month
        data = Array.from({ length: 5 }, (_, i) => ({
          name: `Week ${i + 1}`,
          Scans: 0,
        }));

        brandScans.forEach((scan) => {
          const date = new Date(scan.createdAt);
          if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
            const weekIndex = Math.min(Math.floor((date.getDate() - 1) / 7), 4);
            data[weekIndex].Scans += 1;
          }
        });
        break;

      case "Yearly":
        // Last 5 years
        const currentYear = today.getFullYear();
        const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
        data = years.map((year) => ({ name: year.toString(), Scans: 0 }));

        brandScans.forEach((scan) => {
          const year = new Date(scan.createdAt).getFullYear();
          const yearIndex = years.indexOf(year);
          if (yearIndex !== -1) {
            data[yearIndex].Scans += 1;
          }
        });
        break;
    }

    return data;
  }, [brandScans, filterType]);

  // ✅ Calculate total scans
  const totalScans = useMemo(
    () => chartData.reduce((sum, item) => sum + item.Scans, 0),
    [chartData]
  );

  return (
    <div className="w-full min-w-[15rem] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-6 py-3 border-b border-gray-200">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Brand Growth Overview
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Track scan performance over time
              </p>
            </div>
          </div>

          {/* Desktop Filter Buttons */}
          <div className="hidden md:flex gap-2">
            {FILTER_TYPES.map((type) => (
              <FilterButton
                key={type}
                type={type}
                isActive={filterType === type}
                onClick={() => setFilterType(type)}
              />
            ))}
          </div>

          {/* Mobile Filter Dropdown */}
          <div className="md:hidden relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-white rounded-lg px-4 py-2.5 border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-700">{filterType}</span>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
                  <div className="p-2">
                    {FILTER_TYPES.map((type) => (
                      <button
                        key={type}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-150 ${filterType === type
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                          }`}
                        onClick={() => {
                          setFilterType(type);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="mt-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 inline-block">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
              Total Scans
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {totalScans.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-4 md:p-6">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickLine={{ stroke: "#E5E7EB" }}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickLine={{ stroke: "#E5E7EB" }}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3B82F6", strokeWidth: 2 }} />
            <Area
              type="monotone"
              dataKey="Scans"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#colorScans)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BrandGrowthAreaChart;