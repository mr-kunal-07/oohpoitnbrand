"use client";
import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "@/context/MyContext";
import { MdCampaign } from "react-icons/md";
import { Scan } from "lucide-react";
import SprukoCard from "@/components/Spruko/SprukoCard";
import SprukoPieChart from "@/components/Spruko/DemoGraphicChart";
import DeviceBarChart from "@/components/Spruko/DeviceBarChart";
import BrandGrowthAreaChart from "@/components/Vendors/BrandGrowthAreaChart";
import BrandCampaigns from "@/components/BrandCampaigns";
import { detectDevice } from "@/utils/deviceDetection";

const SamplingDashboard = () => {
    const { campaigns = [], user, users = [] } = useContext(MyContext);
    
    const [brandCampaigns, setBrandCampaigns] = useState([]);
    const [campaignsData, setCampaignsData] = useState({
        total: 0,
        weekly: 0,
        activeTotal: 0,
        activeWeekly: 0,
        lineData: [],
        activeLineData: [],
    });
    const [scansData, setScansData] = useState({
        total: 0,
        weekly: 0,
        unique: 0,
        lineData: [],
    });
    const [usersData, setUsersData] = useState({
        male: 0,
        female: 0,
        other: 0,
        total: 0,
    });
    const [deviceData, setDeviceData] = useState({
        Android: 0,
        iOS: 0,
        total: 0,
    });

    // Helper functions
    const getWeekdayName = (date) =>
        new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);

    const calculateWeekly = (data) => {
        const oneWeekAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
        return data.filter((item) => item.createdAt?.seconds * 1000 >= oneWeekAgo).length;
    };

    const calculateLineData = (data) => {
        const lineData = {};
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        data.forEach((item) => {
            const createdAt = item.createdAt?.seconds 
                ? new Date(item.createdAt.seconds * 1000) 
                : new Date();
            
            if (createdAt >= oneWeekAgo) {
                const weekday = getWeekdayName(createdAt);
                lineData[weekday] = (lineData[weekday] || 0) + 1;
            }
        });
        
        return Object.entries(lineData).map(([name, value]) => ({ name, value }));
    };

    const getStatus = (startDate, endDate, isPaused) => {
        if (!startDate || !endDate) return "Draft";
        
        const current = new Date().setHours(0, 0, 0, 0);
        const start = new Date(startDate.seconds * 1000).setHours(0, 0, 0, 0);
        const end = new Date(endDate.seconds * 1000).setHours(0, 0, 0, 0);
        
        if (isPaused) return "Paused";
        if (current < start) return "Upcoming";
        if (current > end) return "Closed";
        return "Active";
    };

    const isProductModeCampaign = (campaign) => {
        if (campaign.isProductMode === true || campaign.mode === "ProductMode") {
            return true;
        }
        
        if (Array.isArray(campaign.vendors) && campaign.vendors.length > 0) {
            return campaign.vendors.some(
                (v) => v?.isProductMode === true || v?.mode === "ProductMode"
            );
        }
        
        return false;
    };

    // Filter ProductMode campaigns belonging to this brand
    useEffect(() => {
        if (campaigns.length > 0 && user?.brandId) {
            const filtered = campaigns.filter((c) => {
                const isBrandCampaign = c.client === user.brandId;
                return isBrandCampaign && isProductModeCampaign(c);
            });
            
            console.log("📊 Filtered ProductMode Campaigns:", filtered.length);
            setBrandCampaigns(filtered);
        }
    }, [campaigns, user]);

    // Calculate campaign metrics
    useEffect(() => {
        if (brandCampaigns.length === 0) {
            setCampaignsData({
                total: 0,
                weekly: 0,
                activeTotal: 0,
                activeWeekly: 0,
                lineData: [],
                activeLineData: [],
            });
            setScansData({ total: 0, weekly: 0, unique: 0, lineData: [] });
            return;
        }

        let totalScans = 0;
        let uniqueScans = 0;
        let weeklyScans = 0;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const allScans = [];

        brandCampaigns.forEach((campaign) => {
            if (Array.isArray(campaign.ipAddress)) {
                totalScans += campaign.ipAddress.length;
                
                campaign.ipAddress.forEach((scan) => {
                    allScans.push(scan);
                    const scanDate = scan.createdAt 
                        ? new Date(scan.createdAt) 
                        : new Date();
                    
                    if (scanDate >= oneWeekAgo) {
                        weeklyScans++;
                    }
                });
            }
            
            if (Array.isArray(campaign.locationIp)) {
                uniqueScans += campaign.locationIp.length;
            }
        });

        const activeCampaigns = brandCampaigns.filter(
            (c) => getStatus(c.startDate, c.endDate, c.isPaused) === "Active"
        );

        setCampaignsData({
            total: brandCampaigns.length,
            weekly: calculateWeekly(brandCampaigns),
            activeTotal: activeCampaigns.length,
            activeWeekly: calculateWeekly(activeCampaigns),
            lineData: calculateLineData(brandCampaigns),
            activeLineData: calculateLineData(activeCampaigns),
        });

        setScansData({
            total: totalScans,
            weekly: weeklyScans,
            unique: uniqueScans,
            lineData: calculateLineData(allScans),
        });
    }, [brandCampaigns]);

    // Calculate gender distribution
    useEffect(() => {
        if (brandCampaigns.length === 0 || users.length === 0) {
            setUsersData({ male: 0, female: 0, other: 0, total: 0 });
            return;
        }

        let male = 0, female = 0, other = 0;
        const processedUsers = new Set();

        brandCampaigns.forEach((campaign) => {
            if (Array.isArray(campaign.ipAddress)) {
                campaign.ipAddress.forEach(({ userId }) => {
                    if (!userId || processedUsers.has(userId)) return;
                    
                    const user = users.find(
                        (u) => u.id === userId || u.uid === userId || u._id === userId
                    );
                    
                    if (user) {
                        processedUsers.add(userId);
                        const gender = user.gender?.toLowerCase();
                        
                        if (gender === "male") male++;
                        else if (gender === "female") female++;
                        else other++;
                    }
                });
            }
        });

        setUsersData({ 
            male, 
            female, 
            other, 
            total: male + female + other 
        });
    }, [users, brandCampaigns]);

    // Calculate device distribution
    useEffect(() => {
        if (brandCampaigns.length === 0) {
            setDeviceData({ Android: 0, iOS: 0, total: 0 });
            return;
        }

        const deviceCounts = { Android: 0, iOS: 0 };
        let totalDevices = 0;

        brandCampaigns.forEach((campaign) => {
            if (Array.isArray(campaign.ipAddress)) {
                campaign.ipAddress.forEach(({ userId, device }) => {
                    totalDevices++;

                    // Check device from scan data
                    if (device) {
                        const deviceLower = device.toLowerCase();
                        if (deviceLower.includes("ios") || 
                            deviceLower.includes("iphone") || 
                            deviceLower.includes("ipad")) {
                            deviceCounts.iOS++;
                        } else {
                            deviceCounts.Android++;
                        }
                        return;
                    }

                    // Fallback: check user object
                    const user = users.find(
                        (u) => u.id === userId || u.uid === userId || u._id === userId
                    );

                    if (user?.device) {
                        const userDevice = user.device.toLowerCase();
                        if (userDevice.includes("ios") || 
                            userDevice.includes("iphone") || 
                            userDevice.includes("ipad")) {
                            deviceCounts.iOS++;
                        } else {
                            deviceCounts.Android++;
                        }
                    } else if (user?.userAgent) {
                        const detected = detectDevice(user.userAgent);
                        if (detected.os?.toLowerCase().includes("ios")) {
                            deviceCounts.iOS++;
                        } else {
                            deviceCounts.Android++;
                        }
                    } else {
                        // Default to Android if no device info
                        deviceCounts.Android++;
                    }
                });
            }
        });

        setDeviceData({ 
            Android: deviceCounts.Android, 
            iOS: deviceCounts.iOS, 
            total: totalDevices 
        });
    }, [users, brandCampaigns]);

    return (
        <div className="overflow-y-auto py-4 px-2">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
                {/* Left main content */}
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-4">
                    {/* KPI Cards */}
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
                            title="Total Distributed"
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
                            title="Organic Traffic"
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
                    <div className="mt-4 h-auto lg:h-[24rem]">
                        <BrandGrowthAreaChart brandId={user?.brandId} />
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="flex flex-col gap-4">
                    <SprukoPieChart
                        male={usersData.male}
                        title="User Gender Distribution"
                        chartTitle="Users"
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

            {/* Campaigns Table */}
            <div className="mt-6">
                <BrandCampaigns campaigns={brandCampaigns} />
            </div>
        </div>
    );
};

export default SamplingDashboard;