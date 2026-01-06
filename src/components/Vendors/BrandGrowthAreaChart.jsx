import React, { useState, useMemo, useContext } from "react";
import { TrendingUp, Calendar, ChevronDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MyContext } from "@/context/MyContext";

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.[0]) {
    return (
      <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg border border-gray-700">
        <p className="text-sm font-semibold mb-1">{label}</p>
        <p className="text-2xl font-bold text-blue-400">
          {payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-400 mt-1">Total Scans</p>
      </div>
    );
  }
  return null;
};

// Filter Button
const FilterButton = ({ type, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
    }`}
  >
    {type}
  </button>
);

const FILTER_TYPES = ["Yearly", "Monthly", "Weekly", "Daily"];

const BrandGrowthBarChart = ({ brandId }) => {
  const { campaigns } = useContext(MyContext);
  const [filterType, setFilterType] = useState("Daily");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Extract brand-specific scans
  const brandScans = useMemo(() => {
    const scans = [];
    campaigns.forEach((campaign) => {
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

  // Generate chart data
  const chartData = useMemo(() => {
    const today = new Date();
    let data = [];

    switch (filterType) {
      case "Monthly":
        data = Array.from({ length: 12 }, (_, i) => ({
          name: new Date(0, i).toLocaleString("default", { month: "short" }),
          Scans: 0,
        }));
        brandScans.forEach((scan) => {
          const date = new Date(scan.createdAt);
          if (!isNaN(date)) data[date.getMonth()].Scans += 1;
        });
        break;

      case "Daily":
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        data = Array.from({ length: daysInMonth }, (_, i) => ({
          name: `${i + 1}`,
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
        const currentYear = today.getFullYear();
        const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
        data = years.map((year) => ({ name: year.toString(), Scans: 0 }));
        brandScans.forEach((scan) => {
          const year = new Date(scan.createdAt).getFullYear();
          const idx = years.indexOf(year);
          if (idx !== -1) data[idx].Scans += 1;
        });
        break;
    }

    return data;
  }, [brandScans, filterType]);

  const totalScans = useMemo(() => chartData.reduce((sum, item) => sum + item.Scans, 0), [chartData]);

  return (
    <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-700 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Time Line Overview</h2>
            <p className="text-gray-400 text-sm mt-0.5">Track scan performance over time</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {/* Desktop */}
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

          {/* Mobile */}
          <div className="md:hidden relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-gray-800 text-gray-300 rounded-lg px-4 py-2.5 border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{filterType}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-44 bg-gray-900 rounded-xl shadow-2xl z-20 overflow-hidden border border-gray-700">
                  {FILTER_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFilterType(type);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 transition-all duration-150 ${
                        filterType === type
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Total Scans */}
      <div className="px-6 py-4">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 inline-block">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Total Scans</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {totalScans.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 py-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 12 }} tickLine={{ stroke: "#4B5563" }} axisLine={{ stroke: "#4B5563" }} />
            <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} tickLine={{ stroke: "#4B5563" }} axisLine={{ stroke: "#4B5563" }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.2)" }} />
            <Bar dataKey="Scans" fill="url(#barGradient)">
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BrandGrowthBarChart;
