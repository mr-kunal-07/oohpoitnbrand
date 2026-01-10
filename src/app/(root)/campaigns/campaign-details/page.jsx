"use client";
import { useEffect, useState, useContext, useMemo, useCallback } from "react";
import { MyContext } from "@/context/MyContext";
import {
  TrendingUp, Users, MapPin, Calendar, Activity, Award, Clock,
  BarChart3, RefreshCw, Download, Filter
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import SprukoPieChart from "@/components/Spruko/CampaignPieChart";
import VendorTable from "../_components/VendorTable";
import HeatMap from "../_components/HeatMap";
import AreaDistributionTable from "../_components/AreaDistributionTable";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import SurveyTable from "@/components/SurveyTable";

const GOOGLE_MAPS_KEY = "AIzaSyCX0Ok8zf-FVwHOKQKvJ0__82QSLcaW1bA";

const getAddress = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`
    );
    const data = await response.json();

    if (data.status !== "OK") return null;

    const components = data.results[0]?.address_components || [];
    const locationDetails = { state: null, city: null, neighbourhood: null, pincode: null };

    components.forEach((component) => {
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
    console.error("Error fetching location:", error);
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

const generateSparklineData = () =>
  Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 100) + 20 }));

const KPICard = ({ title, value, subtitle, icon: Icon, color = "purple", sparkline }) => {
  const colors = {
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", stroke: "#9333EA" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", stroke: "#3B82F6" },
    green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", stroke: "#10B981" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", stroke: "#F97316" },
    pink: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200", stroke: "#EC4899" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200", stroke: "#6366F1" },
  }[color];

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 border border-slate-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-600 text-sm sm:text-base font-medium">{title}</p>
        <div className={`p-2 sm:p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text}`} />
        </div>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-1">{value}</p>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>}
      </div>
      {sparkline && (
        <div className="mt-3 sm:mt-4 h-10 sm:h-12 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.2} />
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

const CampaignDetail = () => {
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

  // Engagement Metrics
  const engagementMetrics = useMemo(() => {
    if (!campaign?.ipAddress?.length) {
      return { uniqueEngagements: 0, repeatEngagements: 0, totalEngagements: 0 };
    }

    const userIdCounts = {};
    campaign.ipAddress.forEach((scan) => {
      if (scan.userId) {
        userIdCounts[scan.userId] = (userIdCounts[scan.userId] || 0) + 1;
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

  // Demographics
  const demographics = useMemo(() => {
    if (!campaign?.ipAddress?.length || !users?.length) {
      return { male: 0, female: 0, other: 0, total: 0 };
    }

    let male = 0, female = 0, other = 0;
    const uniqueUserIds = new Set();

    campaign.ipAddress.forEach((scan) => {
      if (scan.userId && !uniqueUserIds.has(scan.userId)) {
        uniqueUserIds.add(scan.userId);
        const currentUser = users.find((u) => u.uid === scan.userId);

        if (currentUser?.gender === "Male") male++;
        else if (currentUser?.gender === "Female") female++;
        else other++;
      }
    });

    return { male, female, other, total: male + female + other };
  }, [campaign?.ipAddress, users]);

  // Redemption Metrics
  const redemptionMetrics = useMemo(() => {
    if (!campaignId || !users?.length) {
      return { totalRedeemed: 0, totalCoupons: 0, redemptionRate: "0.00" };
    }

    let totalCoupons = 0, redeemedCoupons = 0;

    users.forEach((user) => {
      user?.coupons?.forEach((coupon) => {
        if (coupon.campaignId === campaignId) {
          totalCoupons++;
          if (coupon.isRedeemed) redeemedCoupons++;
        }
      });
    });

    const rate = totalCoupons > 0 ? (redeemedCoupons / totalCoupons) * 100 : 0;
    return { totalRedeemed: redeemedCoupons, totalCoupons, redemptionRate: rate.toFixed(2) };
  }, [campaignId, users]);

  // Engagement Rate
  const engagementRate = useMemo(() => {
    if (!engagementMetrics.totalEngagements) return "0.00";
    return ((engagementMetrics.uniqueEngagements / engagementMetrics.totalEngagements) * 100).toFixed(2);
  }, [engagementMetrics]);

  // Timeline Data
  const timelineData = useMemo(() => {
    if (!campaign?.ipAddress?.length) return [];

    const scansByDate = {};

    campaign.ipAddress.forEach((scan) => {
      const date = new Date(scan.createdAt).toISOString().split("T")[0];
      scansByDate[date] = (scansByDate[date] || 0) + 1;
    });

    const sortedDates = Object.keys(scansByDate).sort();
    const last30Days = sortedDates.slice(-30);

    return last30Days.map((date) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      scans: scansByDate[date] || 0,
    }));
  }, [campaign?.ipAddress]);

  // Campaign Dates
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

    return {
      daysRemaining,
      totalDays,
      completedDays,
      timelineProgress: timelineProgress.toFixed(1)
    };
  }, [campaign?.startDate, campaign?.endDate]);

  // Fetch Vendors
  const fetchVendors = useCallback(async () => {
    if (!campaignId || !users?.length) return;

    try {
      const res = await fetch("/api/getvendors");
      if (!res.ok) return;

      const vendorsData = await res.json();
      setVendors(vendorsData);

      const vendorMap = {};

      users.forEach((user) => {
        user?.coupons?.forEach((coupon) => {
          if (coupon.campaignId === campaignId && coupon.vendorId) {
            const vendor = vendorsData.find((v) =>
              v.vendorId === coupon.vendorId || v.vid === coupon.vendorId || v.id === coupon.vendorId
            );

            if (vendor) {
              if (vendorMap[coupon.vendorId]) {
                vendorMap[coupon.vendorId].totalScans++;
              } else {
                vendorMap[coupon.vendorId] = {
                  vendorId: coupon.vendorId,
                  businessName: vendor.businessName,
                  vendorLogo: vendor.vendorLogo,
                  totalScans: 1,
                };
              }
            }
          }
        });
      });

      setVendorShopWiseScans(Object.values(vendorMap));
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  }, [campaignId, users]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Load Campaign
  useEffect(() => {
    if (campaignId && campaigns?.length > 0) {
      const foundCampaign = campaigns.find((v) => v.id === campaignId);
      if (foundCampaign) setCampaign(foundCampaign);
    }
  }, [campaignId, campaigns]);

  // Process Locations
  useEffect(() => {
    const processLocations = async () => {
      if (!campaign?.location?.length) {
        setLocations([]);
        setAreaWiseDistribution([]);
        return;
      }

      setLocations(campaign.targetLocations || []);

      try {
        const locationPromises = campaign.location.map((location) =>
          getAddress(location.latitude, location.longitude)
        );
        const addressResults = await Promise.all(locationPromises);

        const areaMap = addressResults.reduce((acc, address) => {
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
        }, {});

        setAreaWiseDistribution(Object.values(areaMap));
      } catch (error) {
        console.error("Error processing locations:", error);
        setAreaWiseDistribution([]);
      }
    };

    processLocations();
  }, [campaign?.location, campaign?.targetLocations]);

  // Process Survey Data
  useEffect(() => {
    if (!campaignId || !users?.length) return;

    const processedSurveys = {};

    users.forEach((userData) => {
      userData?.survey?.forEach((survey) => {
        if (survey.campaignId === campaignId && survey.brandId && survey.question && survey.options?.length) {
          const questionKey = `${survey.brandId}_${campaignId}_${survey.question}`;

          if (!processedSurveys[questionKey]) {
            processedSurveys[questionKey] = {
              brandId: survey.brandId,
              question: survey.question,
              question_options: survey.options,
              options: survey.options.map(() => 0),
              vendorId: survey.vendorId,
              campaignId,
              userIds: [],
            };
          }

          survey.selectedOption?.forEach((index) => {
            if (processedSurveys[questionKey]?.options[index] !== undefined) {
              processedSurveys[questionKey].options[index] += 1;
            }
          });

          if (userData.id) {
            processedSurveys[questionKey].userIds.push(userData.id);
          }
        }
      });
    });

    setSurveyData(Object.values(processedSurveys));
  }, [campaignId, users]);

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="animate-spin mb-4">
          <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
        </div>
        <p className="text-slate-600 font-medium text-sm sm:text-base">Loading campaign details...</p>
      </div>
    );
  }

  const status = getStatus(campaign);

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                {campaign.campaignName}
              </h2>
              <span
                className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-md ${campaign.isPaused
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-green-50 text-green-700 border border-green-200"
                  }`}
              >
                {campaign.isPaused ? "PAUSED" : status.toUpperCase()}
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm">
              {campaign.description || "No description available"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-slate-700"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-xs sm:text-sm text-slate-700">
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-xs sm:text-sm text-slate-700">
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-xs sm:text-sm shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard
            title="Total Engagements"
            value={engagementMetrics.totalEngagements.toLocaleString()}
            subtitle={`${engagementMetrics.uniqueEngagements} unique visitors`}
            icon={Activity}
            color="purple"
            sparkline={generateSparklineData()}
          />
          <KPICard
            title="Unique Engagements"
            value={engagementMetrics.uniqueEngagements.toLocaleString()}
            subtitle="Distinct users"
            icon={Users}
            color="blue"
            sparkline={generateSparklineData()}
          />
          <KPICard
            title="Repeat Engagements"
            value={engagementMetrics.repeatEngagements.toLocaleString()}
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
            value={redemptionMetrics.totalRedeemed.toLocaleString()}
            subtitle="Non-redeemed users"
            icon={Users}
            color="indigo"
            sparkline={generateSparklineData()}
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

        {/* Timeline Chart */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-200">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            Distribution Timeline
          </h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333EA" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#9333EA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  style={{ fontSize: "11px" }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  stroke="#64748B"
                  style={{ fontSize: "11px" }}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1e293b",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="#9333EA"
                  fill="url(#colorScans)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Vendor Shop Wise Scans</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <VendorTable vendorShopWiseScans={vendorShopWiseScans} />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Geographic Heat Map</h2>
            </div>
            <div className="h-[300px] sm:h-[400px] p-3 sm:p-4">
              {locations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <MapPin className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-30" />
                  <p className="text-xs sm:text-sm">No location data available</p>
                </div>
              ) : (
                <HeatMap locations={locations} />
              )}
            </div>
          </div>

          <SprukoPieChart
            male={demographics.male}
            female={demographics.female}
            other={demographics.other}
          />
        </div>

        {/* Area Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-3 sm:p-4 overflow-y-auto max-h-96">
            <AreaDistributionTable areaWiseDistribution={areaWiseDistribution} />
          </div>
        </div>

        {/* Survey Section */}
        <SurveyTable surveyData={surveyData} users={users} campaignId={campaignId} />
      </div>
    </div>
  );
};

export default CampaignDetail;