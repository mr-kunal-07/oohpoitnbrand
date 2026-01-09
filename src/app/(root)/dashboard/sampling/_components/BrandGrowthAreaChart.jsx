import { useState, useMemo, useContext } from "react";
import { TrendingUp, Calendar, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MyContext } from "@/context/MyContext";

const FILTER_TYPES = ["Daily", "Weekly", "Monthly", "Yearly"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.[0]) return null;

  return (
    <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-200">
      {/* <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p> */}
      <p className="text-2xl font-bold text-green-600">
        {payload[0].value.toLocaleString()}
      </p>
      <p className="text-xs text-slate-500 mt-1">Total Scans</p>
    </div>
  );
};

const FilterButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${isActive
      ? "bg-green-600 text-white shadow-sm"
      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
  >
    {label}
  </button>
);

const BrandGrowthBarChart = ({ brandId }) => {
  const { campaigns } = useContext(MyContext);
  const [filterType, setFilterType] = useState("Daily");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredScans = useMemo(() => {
    const scans = [];

    campaigns.forEach((campaign) => {
      if (campaign.client !== brandId) return;

      // Only include product mode campaigns
      const isProductMode =
        campaign.isProductMode === true ||
        campaign.mode === "ProductMode" ||
        (Array.isArray(campaign.vendors) &&
          campaign.vendors.some((v) => v?.isProductMode || v?.mode === "ProductMode"));

      if (!isProductMode || !campaign.ipAddress?.length) return;

      campaign.ipAddress.forEach((scan) => {
        scans.push({
          createdAt: scan.createdAt,
          userId: scan.userId,
        });
      });
    });

    return scans;
  }, [campaigns, brandId]);

  const chartData = useMemo(() => {
    const today = new Date();
    let data = [];

    switch (filterType) {
      case "Daily": {
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        data = Array.from({ length: daysInMonth }, (_, i) => ({ name: `${i + 1}`, Scans: 0 }));
        filteredScans.forEach((scan) => {
          const date = new Date(scan.createdAt);
          if (
            !isNaN(date) &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          ) {
            const dayIndex = date.getDate() - 1;
            if (dayIndex >= 0 && dayIndex < daysInMonth) {
              data[dayIndex].Scans += 1;
            }
          }
        });
        break;
      }

      case "Weekly": {
        data = Array.from({ length: 5 }, (_, i) => ({ name: `Week ${i + 1}`, Scans: 0 }));
        filteredScans.forEach((scan) => {
          const date = new Date(scan.createdAt);
          if (
            !isNaN(date) &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          ) {
            const weekIndex = Math.min(Math.floor((date.getDate() - 1) / 7), 4);
            data[weekIndex].Scans += 1;
          }
        });
        break;
      }

      case "Monthly": {
        data = Array.from({ length: 12 }, (_, i) => ({
          name: new Date(0, i).toLocaleString("default", { month: "short" }),
          Scans: 0,
        }));
        filteredScans.forEach((scan) => {
          const date = new Date(scan.createdAt);
          if (!isNaN(date) && date.getFullYear() === today.getFullYear()) {
            data[date.getMonth()].Scans += 1;
          }
        });
        break;
      }

      case "Yearly": {
        const currentYear = today.getFullYear();
        const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
        data = years.map((year) => ({ name: year.toString(), Scans: 0 }));
        filteredScans.forEach((scan) => {
          const date = new Date(scan.createdAt);
          if (!isNaN(date)) {
            const idx = years.indexOf(date.getFullYear());
            if (idx !== -1) data[idx].Scans += 1;
          }
        });
        break;
      }
    }

    return data;
  }, [filteredScans, filterType]);

  const totalScans = useMemo(
    () => chartData.reduce((sum, item) => sum + item.Scans, 0),
    [chartData]
  );

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="px-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 py-5 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                Timeline Overview
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Track scan performance over time
              </p>
            </div>
          </div>

          {/* Time Filters - Desktop */}
          <div className="hidden md:flex gap-2">
            {FILTER_TYPES.map((type) => (
              <FilterButton
                key={type}
                label={type}
                isActive={filterType === type}
                onClick={() => setFilterType(type)}
              />
            ))}
          </div>

          {/* Time Filters - Mobile */}
          <div className="md:hidden relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-slate-100 text-slate-700 rounded-lg px-4 py-2.5 border border-slate-200 hover:bg-slate-200 transition-colors w-full"
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium flex-1 text-left">{filterType}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg z-20 border border-slate-200 overflow-hidden">
                  {FILTER_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFilterType(type);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 transition-all ${filterType === type
                        ? "bg-green-50 text-green-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
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
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 inline-block">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Total Scans
          </p>
          <p className="text-3xl font-bold text-green-600">
            {totalScans.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 py-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#34D399" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#64748B", fontSize: 12 }}
              tickLine={{ stroke: "#CBD5E1" }}
              axisLine={{ stroke: "#CBD5E1" }}
            />
            <YAxis
              tick={{ fill: "#64748B", fontSize: 12 }}
              tickLine={{ stroke: "#CBD5E1" }}
              axisLine={{ stroke: "#CBD5E1" }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(16, 185, 129, 0.1)" }} />
            <Bar dataKey="Scans" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BrandGrowthBarChart;