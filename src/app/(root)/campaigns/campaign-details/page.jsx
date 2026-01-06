"use client";
import { useEffect, useState, useContext, useMemo } from "react";
import { MyContext } from "@/context/MyContext";
import {
  MdOutlineFormatTextdirectionRToL,
} from "react-icons/md";
import {
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Calendar,
  Activity,
  Award,
  Clock,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import SprukoPieChart from "@/components/Spruko/CampaignPieChart";
import VendorTable from "../_components/VendorTable";
import HeatMap from "../_components/HeatMap";
import AreaDistributionTable from "../_components/AreaDistributionTable";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import SurveyTable from "@/components/SurveyTable";

// UTILITY FUNCTIONS
const getAddress = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCX0Ok8zf-FVwHOKQKvJ0__82QSLcaW1bA`
    );
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Error: ${data.status}`);
    }

    const addressComponents = data.results[0]?.address_components || [];
    const locationDetails = {
      state: null,
      city: null,
      neighbourhood: null,
      pincode: null,
    };

    addressComponents.forEach((component) => {
      if (component.types.includes("administrative_area_level_1")) {
        locationDetails.state = component.long_name;
      }
      if (component.types.includes("locality")) {
        locationDetails.city = component.long_name;
      }
      if (component.types.includes("sublocality_level_1")) {
        locationDetails.neighbourhood = component.long_name;
      }
      if (component.types.includes("postal_code")) {
        locationDetails.pincode = component.long_name;
      }
    });

    return locationDetails;
  } catch (error) {
    console.error("Error fetching location details:", error);
    return null;
  }
};

const getStatus = (campaign) => {
  if (!campaign?.startDate || !campaign?.endDate) return "draft";

  const now = new Date();
  const start = new Date(campaign.startDate.seconds * 1000);
  const end = new Date(campaign.endDate.seconds * 1000);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "active";
  if (now > end) return "completed";

  return "draft";
};

const generateSparklineData = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    value: Math.floor(Math.random() * 100) + 20,
  }));
};

// SUB COMPONENTS
const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "purple",
  sparkline,
}) => {
  const colors = {
    purple: {
      gradient: "from-purple-600 to-purple-700",
      bg: "bg-purple-600/10",
      text: "text-purple-400",
      border: "border-purple-500/30",
      stroke: "#a855f7",
    },
    blue: {
      gradient: "from-blue-600 to-blue-700",
      bg: "bg-blue-600/10",
      text: "text-blue-400",
      border: "border-blue-500/30",
      stroke: "#3b82f6",
    },
    green: {
      gradient: "from-green-600 to-green-700",
      bg: "bg-green-600/10",
      text: "text-green-400",
      border: "border-green-500/30",
      stroke: "#10b981",
    },
    orange: {
      gradient: "from-orange-600 to-orange-700",
      bg: "bg-orange-600/10",
      text: "text-orange-400",
      border: "border-orange-500/30",
      stroke: "#f97316",
    },
    pink: {
      gradient: "from-pink-600 to-pink-700",
      bg: "bg-pink-600/10",
      text: "text-pink-400",
      border: "border-pink-500/30",
      stroke: "#ec4899",
    },
    indigo: {
      gradient: "from-indigo-600 to-indigo-700",
      bg: "bg-indigo-600/10",
      text: "text-indigo-400",
      border: "border-indigo-500/30",
      stroke: "#6366f1",
    },
  }[color];

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-700 group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-xl ${colors.bg} border ${colors.border} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        {trend && trend !== "neutral" && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${trend === "up"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-2 font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {sparkline && (
        <div className="mt-4 h-16 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={colors.stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.stroke}
                fill={`url(#gradient-${color})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// MAIN COMPONENT
const CampaignDetail = () => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const [campaign, setCampaign] = useState(null);
  const { campaigns, users = [] } = useContext(MyContext);
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");

  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [areaWiseDistribution, setAreaWiseDistribution] = useState(null);
  const [vendorShopWiseScans, setVendorShopWiseScans] = useState([]);
  const [surveyData, setSurveyData] = useState([]);
  const [timeRange, setTimeRange] = useState("30d");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ✅ Memoized calculations for engagement metrics
  const engagementMetrics = useMemo(() => {
    if (!campaign?.ipAddress) {
      return { uniqueEngagements: 0, repeatEngagements: 0, totalEngagements: 0 };
    }

    const userIdCounts = {};
    campaign.ipAddress.forEach((scan) => {
      const userId = scan.userId;
      if (userId) {
        userIdCounts[userId] = (userIdCounts[userId] || 0) + 1;
      }
    });

    const uniqueUsers = Object.keys(userIdCounts).length;
    const totalScans = campaign.ipAddress.length;

    return {
      uniqueEngagements: uniqueUsers,
      repeatEngagements: totalScans - uniqueUsers,
      totalEngagements: totalScans,
    };
  }, [campaign?.ipAddress]);

  // ✅ Memoized demographics calculation
  const demographics = useMemo(() => {
    if (!campaign?.ipAddress || !users?.length) {
      return { male: 0, female: 0, other: 0, total: 0 };
    }

    let male = 0;
    let female = 0;
    let other = 0;
    const uniqueUserIds = new Set();

    campaign.ipAddress.forEach((scan) => {
      if (scan.userId && !uniqueUserIds.has(scan.userId)) {
        uniqueUserIds.add(scan.userId);
        const currentUser = users.find((u) => u.uid === scan.userId);

        if (currentUser?.gender === "Male") {
          male++;
        } else if (currentUser?.gender === "Female") {
          female++;
        } else {
          other++;
        }
      }
    });

    return { male, female, other, total: male + female + other };
  }, [campaign?.ipAddress, users]);




  // ✅ Memoized redemption calculations
  const redemptionMetrics = useMemo(() => {
    if (!campaignId || !users?.length) {
      return {
        totalRedeemed: 0,
        totalCoupons: 0,
        redemptionRate: "0.00",
      };
    }

    let totalCoupons = 0;
    let redeemedCoupons = 0;

    users.forEach((user) => {
      user?.coupons?.forEach((coupon) => {
        if (coupon.campaignId === campaignId) {
          totalCoupons++;
          if (coupon.isRedeemed) redeemedCoupons++;
        }
      });
    });

    const rate =
      totalCoupons > 0 ? (redeemedCoupons / totalCoupons) * 100 : 0;

    return {
      totalRedeemed: redeemedCoupons,
      totalCoupons,
      redemptionRate: rate.toFixed(2),
    };
  }, [campaignId, users]);



  const engagementRate = useMemo(() => {
    if (!engagementMetrics.totalEngagements) return "0.00";

    return (
      (engagementMetrics.uniqueEngagements /
        engagementMetrics.totalEngagements) *
      100
    ).toFixed(2);
  }, [engagementMetrics]);



  // ✅ Memoized hourly and monthly distribution
  const { monthlyScans, hourlyScansData, timelineData } = useMemo(() => {
    if (!campaign?.ipAddress) {
      return { monthlyScans: [], hourlyScansData: [], timelineData: [] };
    }

    const scans = campaign.ipAddress;

    // Monthly scans
    const monthlyScansMap = scans.reduce((acc, scan) => {
      const month = new Date(scan.createdAt).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const monthlyData = Object.keys(monthlyScansMap).map((monthIndex) => ({
      name: monthNames[monthIndex],
      value: monthlyScansMap[monthIndex] || 0,
    }));

    // Hourly scans
    const hourlyScansMap = scans.reduce((acc, scan) => {
      const hour = new Date(scan.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const hourlyData = Object.keys(hourlyScansMap).map((hour) => {
      const hourInt = parseInt(hour, 10);
      const period = hourInt >= 12 ? "PM" : "AM";
      const formattedHour = hourInt % 12 === 0 ? 12 : hourInt % 12;
      return {
        name: `${formattedHour}:00 ${period}`,
        value: hourlyScansMap[hour] || 0,
      };
    });

    // Timeline data for last 30 days
    const scansByDate = {};
    scans.forEach((scan) => {
      const date = new Date(scan.createdAt).toISOString().split("T")[0];
      scansByDate[date] = (scansByDate[date] || 0) + 1;
    });

    const sortedDates = Object.keys(scansByDate).sort();
    const last30Days = sortedDates.slice(-30);
    const timelineChartData = last30Days.map((date) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      scans: scansByDate[date] || 0,
    }));

    return {
      monthlyScans: monthlyData,
      hourlyScansData: hourlyData,
      timelineData: timelineChartData,
    };
  }, [campaign?.ipAddress]);

  // ✅ Calculate campaign dates
  const campaignDates = useMemo(() => {
    if (!campaign?.startDate || !campaign?.endDate) {
      return { daysRemaining: 0, totalDays: 0, completedDays: 0, timelineProgress: 0 };
    }

    const startDate = new Date(campaign.startDate.seconds * 1000);
    const endDate = new Date(campaign.endDate.seconds * 1000);
    const now = new Date();

    const daysRemaining = Math.max(0, Math.ceil((endDate - now) / 86400000));
    const totalDays = Math.ceil((endDate - startDate) / 86400000);
    const completedDays = Math.max(0, Math.ceil((now - startDate) / 86400000));
    const timelineProgress = totalDays > 0 ? Math.min(100, (completedDays / totalDays) * 100) : 0;

    return { daysRemaining, totalDays, completedDays, timelineProgress: timelineProgress.toFixed(1) };
  }, [campaign?.startDate, campaign?.endDate]);

  // ✅ Calculate vendor shop-wise scans
  useEffect(() => {
  console.log("🔍 useEffect triggered");
  console.log("- campaignId:", campaignId);
  console.log("- users:", users);
  console.log("- users?.length:", users?.length);
  
  const calculateVendorShopWiseScans = async () => {
    if (!campaignId) {
      console.log("❌ No campaignId available");
      return;
    }
    
    if (!users?.length) {
      console.log("❌ No users available");
      return;
    }
    
    console.log("✅ Both campaignId and users are available, proceeding...");
    
    try {
      const res = await fetch("/api/getvendors");
      
      if (!res.ok) {
        console.error("Failed to fetch vendors:", res.status);
        return;
      }
      
      const vendorsData = await res.json();
      console.log("✅ Fetched vendors:", vendorsData?.length);
      console.log("📋 Sample vendor IDs:", vendorsData.slice(0, 3).map(v => ({
        id: v.id,
        vid: v.vid,
        vendorId: v.vendorId
      })));
      
      setVendors(vendorsData);
      const vendorMap = {};
      let totalCouponsChecked = 0;
      let matchedCoupons = 0;
      const unmatchedVendorIds = new Set();
      
      users.forEach((user) => {
        if (user?.coupons?.length) {
          user.coupons.forEach((coupon) => {
            if (coupon.campaignId === campaignId && coupon.vendorId) {
              totalCouponsChecked++;
              const vendorId = coupon.vendorId;
              
              console.log("🔍 Looking for vendorId:", vendorId);
              
              const vendor = vendorsData.find((v) => 
                v.vendorId === vendorId || v.vid === vendorId || v.id === vendorId
              );
              
              if (vendor) {
                matchedCoupons++;
                if (vendorMap[vendorId]) {
                  vendorMap[vendorId].totalScans++;
                } else {
                  vendorMap[vendorId] = {
                    vendorId,
                    businessName: vendor.businessName,
                    vendorLogo: vendor.vendorLogo,
                    totalScans: 1,
                  };
                }
              } else {
                unmatchedVendorIds.add(vendorId);
                console.warn("❌ Vendor not found for vendorId:", vendorId);
              }
            }
          });
        }
      });
      
      console.log("📊 Summary:");
      console.log("- Total coupons checked:", totalCouponsChecked);
      console.log("- Matched coupons:", matchedCoupons);
      console.log("- Unmatched vendor IDs:", Array.from(unmatchedVendorIds));
      
      const vendorScans = Object.values(vendorMap);
      console.log("✅ Vendor scans calculated:", vendorScans);
      setVendorShopWiseScans(vendorScans);
    } catch (error) {
      console.error("💥 Error fetching vendors:", error);
    }
  };
  
  calculateVendorShopWiseScans();
}, [campaignId, users]);


  // ✅ Find campaign when campaignId changes
  useEffect(() => {
    if (campaignId && campaigns?.length > 0) {
      const foundCampaign = campaigns.find((v) => v.id === campaignId);
      if (foundCampaign) {
        setCampaign(foundCampaign);
      }
    }
  }, [campaignId, campaigns]);

  // ✅ Process location data
  useEffect(() => {
    const processLocations = async () => {
      if (!campaign?.location) {
        setLocations([]);
        setAreaWiseDistribution([]);
        return;
      }

      setLocations(campaign.targetLocations);

      try {
        const locationData = campaign.location.map((location) =>
          getAddress(location.latitude, location.longitude)
        );
        const response = await Promise.all(locationData);

        setAreaWiseDistribution(
          Object.values(
            response.reduce((acc, address) => {
              const state = address?.state || "Unknown State";
              const city = address?.city || "Unknown City";
              const neighbourhood = address?.neighbourhood || "Unknown Area";
              const pincode = address?.pincode || "Unknown Pincode";

              const key = `${state}|${city}|${neighbourhood}|${pincode}`;
              if (!acc[key]) {
                acc[key] = { state, city, neighbourhood, pincode, scans: 0 };
              }
              acc[key].scans += 1;
              return acc;
            }, {})
          )
        );
      } catch (error) {
        console.error("Error processing locations:", error);
        setAreaWiseDistribution([]);
      }
    };

    processLocations();
  }, [campaign?.location]);

  // ✅ Process survey data
  useEffect(() => {
    if (!campaignId || !users?.length) return;

    const processedSurveys = {};

    users.forEach((userData) => {
      if (userData?.survey?.length) {
        userData.survey.forEach((survey) => {
          if (survey.campaignId === campaignId) {
            const { brandId, question, options, vendorId, selectedOption } = survey;

            if (!brandId || !question || !options?.length) return;

            const questionKey = `${brandId}_${campaignId}_${question}`;

            if (!processedSurveys[questionKey]) {
              processedSurveys[questionKey] = {
                brandId,
                question,
                question_options: options,
                options: options.map(() => 0),
                vendorId,
                campaignId,
                userIds: [],
              };
            }

            selectedOption.forEach((index) => {
              if (processedSurveys[questionKey]?.options[index] !== undefined) {
                processedSurveys[questionKey].options[index] += 1;
              }
            });

            processedSurveys[questionKey].userIds.push(userData.id);
          }
        });
      }
    });

    setSurveyData(Object.values(processedSurveys));
  }, [campaignId, users]);

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const refreshData = () => {
    setLastUpdated(new Date());
  };



  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="animate-spin">
          <RefreshCw className="w-12 h-12 text-indigo-500 mb-4" />
        </div>
        <p className="text-gray-400 font-medium">Loading campaign details...</p>
      </div>
    );
  }

  const status = getStatus(campaign);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center  gap-3 mb-2">
              <h2 className="text-3xl font-bold text-white">{campaign.campaignName}</h2>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-md mt-2 ${campaign.isPaused
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/30"
                  }`}
              >
                {campaign.isPaused ? "PAUSED" : status.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {campaign.description || "No description available"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 border border-gray-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-800 text-gray-300"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-gray-700 rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm text-gray-300">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-gray-700 rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm text-gray-300">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium text-sm shadow-lg shadow-indigo-500/30"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards - Primary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <KPICard
            title="Total Engagements"
            value={engagementMetrics.totalEngagements}
            subtitle={`${engagementMetrics.uniqueEngagements} unique visitors`}
            icon={Activity}
            color="purple"
            sparkline={generateSparklineData()}
          />
          <KPICard
            title="Unique Engagements"
            value={engagementMetrics.uniqueEngagements}
            subtitle="Distinct users"
            icon={Users}
            color="blue"
            sparkline={generateSparklineData()}
          />
          <KPICard
            title="Repeat Engagements"
            value={engagementMetrics.repeatEngagements}
            subtitle="Return visitors"
            icon={TrendingUp}
            color="green"
            sparkline={generateSparklineData()}
          />
          <KPICard
            title="Days Remaining"
            value={campaignDates.daysRemaining}
            subtitle={`Out of ${campaignDates.totalDays} days`}
            icon={Calendar}
            color="orange"
            sparkline={generateSparklineData()}
          />
        </div>

        {/* Secondary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <KPICard
            title="Engagement Rate"
            value={`${engagementRate}%`}
            subtitle={`${engagementMetrics.uniqueEngagements} unique / ${engagementMetrics.totalEngagements} total`}
            icon={Award}
            color="pink"
            sparkline={generateSparklineData()}
          />

          <KPICard
            title="Organic Traffic"
            value={redemptionMetrics.totalRedeemed}
            subtitle="Non-redeemed unique users"
            icon={MdOutlineFormatTextdirectionRToL}
            color="indigo"
          />

          <KPICard
            title="Active Locations"
            value={locations.length}
            subtitle="Campaign reach areas"
            icon={MapPin}
            color="orange"
            sparkline={generateSparklineData()}
          />
          <KPICard
            title="Timeline Progress"
            value={`${campaignDates.timelineProgress}%`}
            subtitle={`Day ${campaignDates.completedDays} of ${campaignDates.totalDays}`}
            icon={Clock}
            color="blue"
            sparkline={generateSparklineData()}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1">
          {/* Distribution Timeline */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Distribution Timeline
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="#8b5cf6"
                    fill="url(#colorScans)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Vendor Table */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-700 bg-slate-800/50">
            <h2 className="text-lg font-semibold text-white">
              Vendor Shop Wise Scans
            </h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <VendorTable vendorShopWiseScans={vendorShopWiseScans} />
          </div>
        </div>

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Heat Map */}
          <div className="md:col-span-2">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 overflow-hidden h-full">
              <div className="px-6 py-5 border-b border-gray-700 bg-slate-800/50">
                <h2 className="text-lg font-semibold text-white">
                  Geographic Heat Map
                </h2>
              </div>
              <div className="h-[400px] p-4">
                {locations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MdOutlineFormatTextdirectionRToL className="text-5xl mb-3 opacity-30" />
                    <p className="text-sm">No location data available</p>
                  </div>
                ) : (
                  <HeatMap locations={locations} />
                )}
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="md:col-span-2">
            <SprukoPieChart
              male={demographics.male}
              chartTitle="Demographic Breakdown"
              title="Engagements"
              female={demographics.female}
              other={demographics.other}
              total={demographics.total}
            />
          </div>

          {/* Area Distribution Table */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 overflow-hidden col-span-1 md:col-span-4">
            <div className="m-3 overflow-y-auto max-h-96">
              <AreaDistributionTable
                areaWiseDistribution={areaWiseDistribution}
              />
            </div>
          </div>
        </div>

        {/* Target Locations */}
        {campaign.targetLocations?.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-400" />
              Target Locations ({campaign.targetLocations.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {campaign.targetLocations.map((location, idx) => (
                <span
                  key={idx}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all"
                >
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Survey Section */}
        <SurveyTable
          surveyData={surveyData}
          users={users}
          campaignId={campaignId}
        />
      </div>
    </div>
  );
};

export default CampaignDetail;