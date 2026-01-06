"use client";
import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { MyContext } from "@/context/MyContext";
import SprukoCard from "@/components/Spruko/SprukoCard";
import { MdCampaign } from "react-icons/md";
import { Scan } from "lucide-react";
import BrandCampaigns from "@/components/BrandCampaigns";
import SprukoPieChart from "../../../../components/Spruko/DemoGraphicChart";
import DeviceBarChart from "../../../../components/Spruko/DeviceBarChart";
import BrandGrowthAreaChart from "../../../../components/Vendors/BrandGrowthAreaChart";
import { detectDevice } from "@/utils/deviceDetection";

const BrandDashboard = () => {
  const { campaigns, user } = useContext(MyContext);
  const [usersD, setUsersD] = useState([]);
  const [brandCampaigns, setBrandCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [campaignsData, setCampaignsData] = useState({
    weekly: 0,
    total: 0,
    daily: 0,
    lineData: [],
    activeTotal: 0,
    activeWeekly: 0,
    activeLineData: [],
  });

  const [scansData, setScansData] = useState({
    total: 0,
    weekly: 0,
    lineData: [],
    unique: 0,
  });

  const [usersData, setUsersData] = useState({
    male: 0,
    female: 0,
    total: 0,
    other: 0,
  });

  const [deviceData, setDeviceData] = useState({
    Android: 0,
    iOS: 0,
    total: 0,
  });

  // ✅ Utility functions - Memoized
  const convertTimestampToDate = useCallback((tmstmp) => {
    if (!tmstmp) return new Date();
    if (tmstmp.seconds) {
      return new Date(tmstmp.seconds * 1000 + (tmstmp.nanoseconds || 0) / 1000000);
    }
    return new Date(tmstmp);
  }, []);

  const getWeekdayName = useCallback((date) => {
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
  }, []);

  const isIOS = useCallback((deviceString) => {
    if (!deviceString) return false;
    const lower = deviceString.toLowerCase();
    return lower.includes("iphone") || lower.includes("ipad") || lower.includes("ios");
  }, []);

  const calculateWeekly = useCallback((data) => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return data.filter((item) => {
      const createdAt = convertTimestampToDate(item.createdAt).getTime();
      return createdAt >= oneWeekAgo;
    }).length;
  }, [convertTimestampToDate]);

  const calculateDaily = useCallback((data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    return data.filter((item) => {
      const createdAt = convertTimestampToDate(item.createdAt).getTime();
      return createdAt >= todayTime;
    }).length;
  }, [convertTimestampToDate]);

const calculateLineData = useCallback((data) => {
  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Prepare last 7 days with 0
  const dayMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label = getWeekdayName(d);
    dayMap[label] = 0;
  }

  // Fill actual data
  data.forEach((item) => {
    const createdAt = convertTimestampToDate(item.createdAt);
    const label = getWeekdayName(createdAt);

    if (label in dayMap) {
      dayMap[label] += 1;
    }
  });

  // Convert to array in correct order
  Object.keys(dayMap).forEach((day) => {
    result.push({ name: day, value: dayMap[day] });
  });

  return result;
}, [convertTimestampToDate, getWeekdayName]);


  const getStatus = useCallback((startDate, endDate, isPaused) => {
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const start = convertTimestampToDate(startDate).setHours(0, 0, 0, 0);
    const end = convertTimestampToDate(endDate).setHours(0, 0, 0, 0);

    if (isPaused) return "Paused";
    if (currentDate < start) return "Upcoming";
    if (currentDate > end) return "Closed";
    return "Active";
  }, [convertTimestampToDate]);

  // ✅ Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/getusers");
        const users = await res.json();
        setUsersD(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  // ✅ Filter Prize Mode campaigns (NOT product mode)
  useEffect(() => {
    if (campaigns?.length > 0 && user?.brandId) {
      const filtered = campaigns.filter((c) => {
        const isBrandCampaign = c.client === user.brandId;
        if (!isBrandCampaign) return false;

        const isProductMode =
          c.isProductMode === true ||
          c.mode === "ProductMode" ||
          (Array.isArray(c.vendors) &&
            c.vendors.length > 0 &&
            c.vendors.some(
              (v) => v?.isProductMode === true || v?.mode === "ProductMode"
            ));

        return !isProductMode;
      });
      setBrandCampaigns(filtered);
    }
  }, [campaigns, user?.brandId]);

  // ✅ Calculate campaigns data
  useEffect(() => {
    if (brandCampaigns.length === 0) return;

    const activeCampaigns = brandCampaigns.filter(
      (c) => getStatus(c.startDate, c.endDate, c.isPaused) === "Active"
    );

    setCampaignsData({
      weekly: calculateWeekly(brandCampaigns),
      total: brandCampaigns.length,
      daily: calculateDaily(brandCampaigns),
      lineData: calculateLineData(brandCampaigns),
      activeTotal: activeCampaigns.length,
      activeWeekly: calculateWeekly(activeCampaigns),
      activeLineData: calculateLineData(activeCampaigns),
    });
  }, [brandCampaigns, calculateWeekly, calculateDaily, calculateLineData, getStatus]);

  // ✅ Calculate scans data
  useEffect(() => {
    if (brandCampaigns.length === 0) return;

    let totalScans = 0;
    const uniqueUserIds = new Set();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const scanTimestamps = [];

    brandCampaigns.forEach((campaign) => {
      if (campaign.ipAddress && Array.isArray(campaign.ipAddress)) {
        totalScans += campaign.ipAddress.length;

        campaign.ipAddress.forEach((ipObj) => {
          if (ipObj.userId) {
            uniqueUserIds.add(ipObj.userId);
          }

          if (ipObj.createdAt) {
            scanTimestamps.push({ createdAt: ipObj.createdAt });
          }
        });
      }
    });

    const weeklyScans = scanTimestamps.filter((scan) => {
      const scanDate = new Date(scan.createdAt);
      return scanDate >= oneWeekAgo;
    }).length;

    const lineData = calculateLineData(scanTimestamps);

    setScansData({
      total: totalScans,
      unique: uniqueUserIds.size,
      weekly: weeklyScans,
      lineData,
    });
  }, [brandCampaigns, calculateLineData]);

  // ✅ Calculate gender demographics
  useEffect(() => {
    if (!user?.brandId || usersD.length === 0 || brandCampaigns.length === 0) return;

    let maleCount = 0;
    let femaleCount = 0;
    let otherCount = 0;
    const uniqueUserIds = new Set();

    brandCampaigns.forEach((campaign) => {
      if (campaign.ipAddress && Array.isArray(campaign.ipAddress)) {
        campaign.ipAddress.forEach((ipObj) => {
          const userId = ipObj.userId;

          if (userId && !uniqueUserIds.has(userId)) {
            uniqueUserIds.add(userId);

            const currentUser = usersD.find((u) => u.uid === userId);

            if (currentUser?.gender) {
              if (currentUser.gender === "Male") {
                maleCount++;
              } else if (currentUser.gender === "Female") {
                femaleCount++;
              } else {
                otherCount++;
              }
            } else {
              otherCount++;
            }
          }
        });
      }
    });

    setUsersData({
      male: maleCount,
      female: femaleCount,
      total: uniqueUserIds.size,
      other: otherCount,
    });
  }, [usersD, brandCampaigns, user?.brandId]);

  // ✅ Calculate device distribution
  useEffect(() => {
    if (brandCampaigns.length === 0 || usersD.length === 0) return;

    let iosCount = 0;
    let androidCount = 0;
    let unknownCount = 0;
    const uniqueUserIds = new Set();

    brandCampaigns.forEach((campaign) => {
      if (campaign.ipAddress && Array.isArray(campaign.ipAddress)) {
        campaign.ipAddress.forEach((ipObj) => {
          const userId = ipObj.userId;

          if (userId && !uniqueUserIds.has(userId)) {
            uniqueUserIds.add(userId);

            const campaignUser = campaign.users?.find(u => u.userId === userId);

            if (campaignUser?.metadata?.userAgent) {
              const detected = detectDevice(campaignUser.metadata.userAgent);

              if (detected.os && isIOS(detected.os)) {
                iosCount++;
              } else {
                androidCount++;
              }
            } else {
              const userFromDb = usersD.find((u) => u.uid === userId);
              if (userFromDb?.device) {
                if (isIOS(userFromDb.device)) {
                  iosCount++;
                } else {
                  androidCount++;
                }
              } else {
                unknownCount++;
              }
            }
          }
        });
      }
    });

    const unknownAndroid = Math.round(unknownCount * 0.8);
    const unknownIOS = unknownCount - unknownAndroid;

    setDeviceData({
      Android: androidCount + unknownAndroid,
      iOS: iosCount + unknownIOS,
      total: uniqueUserIds.size,
    });
  }, [brandCampaigns, usersD, isIOS]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          
          {/* Left Main Content - 3 columns */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 lg:gap-6">
            
            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
              <SprukoCard
                title="Total Campaigns"
                value={campaignsData.total}
                increase={`+${campaignsData.weekly}`}
                color="text-green-500"
                iconColor="text-blue-500"
                Icon={MdCampaign}
                bgColor="bg-blue-100"
                lineData={campaignsData.lineData}
                lineColor="blue"
              />
              <SprukoCard
                title="Active Campaigns"
                value={campaignsData.activeTotal}
                increase={`+${campaignsData.activeWeekly}`}
                color="text-green-500"
                iconColor="text-pink-500"
                Icon={MdCampaign}
                bgColor="bg-pink-100"
                lineData={campaignsData.activeLineData}
                lineColor="pink"
              />
              <SprukoCard
                title="Total Engagements"
                value={scansData.total}
                increase={`+${scansData.weekly}`}
                color="text-green-500"
                iconColor="text-green-500"
                Icon={Scan}
                bgColor="bg-green-100"
                lineData={scansData.lineData}
                lineColor="green"
              />
              <SprukoCard
                title="Unique Engagements"
                value={scansData.unique}
                increase={`+${scansData.weekly}`}
                color="text-green-500"
                iconColor="text-red-500"
                Icon={Scan}
                bgColor="bg-red-100"
                lineData={scansData.lineData}
                lineColor="red"
              />
            </div>

            {/* Growth Chart */}
            <div className="w-full h-auto lg:h-[24rem]">
              <BrandGrowthAreaChart brandId={user?.brandId} />
            </div>
          </div>

          {/* Right Sidebar - 1 column */}
          <div className="col-span-1 flex flex-col gap-4 lg:gap-6">
            <SprukoPieChart
              male={usersData.male}
              title={usersData.other ? "T.U" : "Total Users"}
              chartTitle={"Users"}
              female={usersData.female}
              total={usersData.total}
              other={usersData.other}
            />
            <DeviceBarChart
              data={[
                { name: "Android", value: deviceData.Android },
                { name: "iOS", value: deviceData.iOS },
              ]}
              total={deviceData.total}
            />
          </div>
        </div>

        {/* Campaigns Table/List */}
        <div className="mt-6 lg:mt-8">
          <BrandCampaigns campaigns={brandCampaigns} />
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;