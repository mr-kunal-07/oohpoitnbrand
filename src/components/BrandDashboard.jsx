"use client";
import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "@/context/MyContext";
import { useRouter } from "next/navigation";
import SprukoCard from "@/components/Spruko/SprukoCard";
import { MdCampaign } from "react-icons/md";
import { Scan } from "lucide-react";
import SprukoMixChart from "@/components/Spruko/SprukoMixChart";
import BrandCampaigns from "@/components/BrandCampaigns";
import SprukoPieChart from "./Spruko/DemoGraphicChart";
import SprukoMixAreaChart from "./Spruko/AreaChartBrand";
import BrandGrowthAreaChart from "./Vendors/BrandGrowthAreaChart";

const BrandDashboard = () => {
  const { campaigns, user, vendors } = useContext(MyContext);
  const [usersD, setUsersD] = useState([]);
  const [brandCampaigns, setBrandCampaigns] = useState([]);
  const [brand, setBrand] = useState({});
  const [brandsD, setBrandsD] = useState([]);
  const [locations, setLocations] = useState([]);
  const [brandLen, setBrandLen] = useState(0);
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
    weekly: 0,
    total: 0,
    daily: 0,
    lineData: [],
    other: 0,
    male: 0,
    female: 0,
    city: {},
    state: {},
  });

  const [mixData, setMixData] = useState([]);

  useEffect(() => {
    if (user) {
      setBrand(user);
    }
  }, [user]);

  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      const data = [];
      campaigns.forEach((campaign) => {
        if (campaign.client === user.brandId) {
          data.push(campaign);
        }
      });
      setBrandCampaigns(data);
    }
  }, [campaigns]);

  useEffect(() => {
    const fetchUsersAndFilterSurveys = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/getUsers");
        const users = await res.json();
        setUsersD(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsersAndFilterSurveys();
  }, [user]);

  useEffect(() => {
    let maleCount = 0;
    let femaleCount = 0;
    let totalCount = 0;
    let otherCount = 0;

    campaigns.forEach((campaign) => {
      if (campaign.client === user.brandId && campaign.ipAddress) {
        campaign.ipAddress.forEach(({ userId }) => {
          const currentUser = usersD.find((u) => u.id === userId);
          if (currentUser) {
            totalCount++;
            if (currentUser.gender === "Male") {
              maleCount++;
            } else if (currentUser.gender === "Female") {
              femaleCount++;
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
      total: totalCount,
      other: otherCount,
    });
  }, [usersD]);

  const calculateMixData = (data1, data2, data3) => {
    const combinedData = {};
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const processDataset = (data, valueKey) => {
      data.forEach((user) => {
        const createdAt = convertTimestampToDate(user.createdAt);
        if (createdAt >= oneWeekAgo) {
          const weekday = getWeekdayName(createdAt);
          if (!combinedData[weekday]) {
            combinedData[weekday] = {
              name: weekday,
              Users: 0,
              Brands: 0,
              Vendors: 0,
            };
          }
          combinedData[weekday][valueKey] += 1;
        }
      });
    };

    processDataset(data1, "Users");
    processDataset(data2, "Brands");
    processDataset(data3, "Vendors");

    return Object.values(combinedData);
  };

  function convertTimestampToDate(tmstmp) {
    return new Date(
      (tmstmp?.seconds || 1) * 1000 + (tmstmp?.nanoseconds || 1) / 1000000
    );
  }

  function getWeekdayName(date) {
    const options = { weekday: "short" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  const calculateWeekly = (data) => {
    const today = new Date();
    const oneWeekAgo = today.getTime() - 7 * 24 * 60 * 60 * 1000;

    const newUsers = data.filter((user) => {
      const userCreatedAt = user.createdAt?.seconds * 1000;
      return userCreatedAt >= oneWeekAgo;
    });

    return newUsers.length;
  };

  const calculateDaily = (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUsers = data.filter((user) => {
      const userCreatedAt = user.createdAt?.seconds * 1000;
      return userCreatedAt >= today.getTime();
    });

    return todayUsers.length;
  };

  const calculateLineData = (data) => {
    const lineData = {};
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    data.forEach((user) => {
      const createdAt = convertTimestampToDate(user.createdAt);
      if (createdAt >= oneWeekAgo) {
        const weekday = getWeekdayName(createdAt);
        lineData[weekday] = (lineData[weekday] || 0) + 1;
      }
    });

    return Object.entries(lineData).map(([name, value]) => ({ name, value }));
  };

  const getStatus = (startDate, endDate, isPaused) => {
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const start = new Date(startDate.seconds * 1000).setHours(0, 0, 0, 0);
    const end = new Date(endDate.seconds * 1000).setHours(0, 0, 0, 0);

    if (isPaused) {
      return "Paused";
    } else if (currentDate < start) {
      return "Upcoming";
    } else if (currentDate > end) {
      return "Closed";
    } else {
      return "Active";
    }
  };

  useEffect(() => {
    if (brandCampaigns.length > 0) {
      let total = 0;
      let unique = 0;
      let weekly = 0;
      let dateCount = {};

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      brandCampaigns.forEach((campaign) => {
        if (campaign.ipAddress && campaign.locationIp) {
          // Add to total by length of ipAddress array
          total += campaign.ipAddress?.length;

          // Add to unique by length of locationIp array
          unique += campaign.locationIp?.length;

          // Count scans for the last 7 days
          weekly += campaign.ipAddress?.filter(
            (ipObj) => new Date(ipObj.createdAt) >= oneWeekAgo
          ).length;
        }
      });

      setCampaignsData({
        weekly: calculateWeekly(brandCampaigns),
        total: brandCampaigns.length,
        daily: calculateDaily(brandCampaigns),
        lineData: calculateLineData(brandCampaigns),
        activeTotal: brandCampaigns.filter(
          (c) => getStatus(c.startDate, c.endDate, c.isPaused) === "Active"
        ).length,
        activeWeekly: calculateWeekly(
          brandCampaigns.filter(
            (c) => getStatus(c.startDate, c.endDate, c.isPaused) === "Active"
          )
        ),
        activeLineData: calculateLineData(
          brandCampaigns.filter(
            (c) => getStatus(c.startDate, c.endDate, c.isPaused) === "Active"
          )
        ),
      });

      setScansData({
        total: total,
        unique: unique,
        weekly: weekly,
      });
      const loc = brandCampaigns.map((campaign) => campaign.location);
      const locationData = loc.flat();
      setLocations(locationData);
    }
  }, [brandCampaigns]);

  useEffect(() => {
    const getBrands = async () => {
      const res = await fetch("/api/getBrands");
      const brands = await res.json();
      setBrandsD(brands);
      setMixData(calculateMixData(usersD, brands, vendors));
      setBrandLen(brands.length);
    };

    getBrands();
  }, [brandCampaigns]);

  return (
    <div className="overflow-y-auto py-4 px-2">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
        {/* Left main content */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4">

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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

          {/* Campaign + Growth charts */}
          <div className=" gap-4 h-auto lg:h-[24rem]">
            <BrandGrowthAreaChart brandId={user?.brandId} />
          </div>

          {/* Future: Map or State distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* <MapLocation locations={locations} /> */}
          </div>
        </div>

        {/* Sidebar Right */}
        <div className="flex flex-col gap-4">
          <SprukoPieChart
            male={usersData.male}
            title={usersData.other ? "T.U" : "Total Users"}
            chartTitle={"Users"}
            female={usersData.female}
            total={usersData.total}
            other={usersData.other}
          />
          <SprukoMixAreaChart
            data={[
              { name: "Male", value: usersData.male },
              { name: "Female", value: usersData.female },
              { name: "Other", value: usersData.other },
            ]}
            count={usersData.length}
            total={usersData.total}
          />
        </div>
      </div>

      {/* Campaigns Table/List */}
      <div className="mt-6">
        <BrandCampaigns campaigns={brandCampaigns} />
      </div>
    </div>

  );
};

export default BrandDashboard;
