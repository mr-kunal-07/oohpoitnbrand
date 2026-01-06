"use client";

import React, { useEffect, useState, useContext, useMemo } from "react";
import { TrendingUp, Package, Target, MapPin, Users, Calendar, Activity, Clock, Filter, Download, Share2, Camera } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, AreaChart, Area } from "recharts";
import { useSearchParams } from "next/navigation";
import { MyContext } from "@/context/MyContext";
import SprukoPieChart from "@/components/Spruko/CampaignPieChart";
import SurveyTable from "@/components/SurveyTable";

const SamplingCampaignDetail = () => {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const { users = [], vendors = [] } = useContext(MyContext);
    const searchParams = useSearchParams();
    const campaignId = searchParams.get("campaignId");
    const [surveyData, setSurveyData] = useState([]);
    const [metrics, setMetrics] = useState({
        totalTargetSamples: 0,
        totalDistributed: 0,
        completionPercentage: 0,
        remainingSamples: 0,
        plannedDays: 0,
        completedDays: 0,
        activeLocations: 0,
        todayDistribution: 0,
        uniqueRecipients: 0,
    });
    const [timelineData, setTimelineData] = useState({
        monthlyDistribution: [],
        hourlyDistribution: [],
        dailyDistribution: [],
    });
    const [vendorPerformance, setVendorPerformance] = useState([]);

    // Process survey data
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

                    survey.selectedOption.forEach((index) => {
                        if (processedSurveys[questionKey]?.options[index] !== undefined) {
                            processedSurveys[questionKey].options[index] += 1;
                        }
                    });

                    processedSurveys[questionKey].userIds.push(userData.id);
                }
            });
        });

        setSurveyData(Object.values(processedSurveys));
    }, [campaignId, users]);

    // Calculate demographics
    const demographics = useMemo(() => {
        if (!campaign?.ipAddress || !users?.length) {
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

    // Fetch campaign data
    const fetchCampaign = async () => {
        if (!campaignId) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/campaigns/${campaignId}`);
            const result = await response.json();

            if (result?.success && result?.data) {
                setCampaign(result.data);
            } else {
                setCampaign({});
            }
        } catch (error) {
            console.error("Error fetching campaign:", error);
            setCampaign({});
        } finally {
            setLoading(false);
        }
    };

    // Calculate metrics
    const calculateMetrics = () => {
        if (!campaign) return;

        const targetSamples = campaign?.targetScans || 0;
        const totalDistributed = campaign?.ipAddress?.length || 0;
        const uniqueUsers = new Set(
            (campaign?.ipAddress || []).map(scan => scan.userId).filter(Boolean)
        ).size;

        const completion = targetSamples > 0 ? ((totalDistributed / targetSamples) * 100).toFixed(1) : 0;
        const remaining = Math.max(0, targetSamples - totalDistributed);

        const startDate = campaign?.startDate?.seconds ? new Date(campaign.startDate.seconds * 1000) : null;
        const endDate = campaign?.endDate?.seconds ? new Date(campaign.endDate.seconds * 1000) : null;
        const today = new Date();

        let plannedDays = 0, completedDays = 0;

        if (startDate && endDate) {
            plannedDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            completedDays = Math.min(
                Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24))),
                plannedDays
            );
        }

        const activeLocations = campaign?.targetLocations?.length || 0;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayDistribution = (campaign?.ipAddress || []).filter(
            scan => new Date(scan.createdAt) >= todayStart
        ).length;

        setMetrics({
            totalTargetSamples: targetSamples,
            totalDistributed,
            completionPercentage: parseFloat(completion),
            remainingSamples: remaining,
            plannedDays,
            completedDays,
            activeLocations,
            todayDistribution,
            uniqueRecipients: uniqueUsers,
        });
    };

    // Calculate timeline data
    const calculateTimelineData = () => {
        const scans = campaign?.ipAddress || [];

        if (scans.length === 0) {
            setTimelineData({ monthlyDistribution: [], hourlyDistribution: [], dailyDistribution: [] });
            return;
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Monthly distribution
        const monthlyScans = scans.reduce((acc, scan) => {
            const month = new Date(scan.createdAt).getMonth();
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});

        const monthlyData = Object.keys(monthlyScans).map(monthIndex => ({
            name: monthNames[monthIndex],
            value: monthlyScans[monthIndex],
        }));

        // Hourly distribution
        const hourlyScans = scans.reduce((acc, scan) => {
            const hour = scan.hour !== undefined ? scan.hour : new Date(scan.createdAt).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});

        const hourlyData = Object.keys(hourlyScans)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(hour => {
                const hourInt = parseInt(hour, 10);
                const period = hourInt >= 12 ? "PM" : "AM";
                const formattedHour = hourInt % 12 === 0 ? 12 : hourInt % 12;
                return { name: `${formattedHour}${period}`, value: hourlyScans[hour] };
            });

        // Daily distribution (last 30 days)
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date.toISOString().split('T')[0];
        });

        const dailyScans = scans.reduce((acc, scan) => {
            const date = new Date(scan.createdAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        const dailyData = last30Days.map(date => ({
            date: new Date(date).getDate(),
            samples: dailyScans[date] || 0,
        }));

        setTimelineData({
            monthlyDistribution: monthlyData,
            hourlyDistribution: hourlyData,
            dailyDistribution: dailyData
        });
    };

    // Calculate vendor performance
    const calculateVendorPerformance = () => {
        const campaignVendors = campaign?.vendors || [];

        if (campaignVendors.length === 0) {
            setVendorPerformance([]);
            return;
        }

        const vendorData = campaignVendors.map(campaignVendor => {
            const vendor = vendors?.find(
                v => v?.vendorId === campaignVendor.vendorId || v?._id === campaignVendor.vendorId || v?.id === campaignVendor.vendorId
            );

            return {
                vendorId: campaignVendor.vendorId,
                businessName: vendor?.businessName || "Unknown Vendor",
                vendorLogo: vendor?.vendorLogo || null,
                totalSamples: campaignVendor.numberOfSamplings || 0,
                products: [campaignVendor.firstProductName, campaignVendor.secondProductName].filter(Boolean),
            };
        });

        setVendorPerformance(vendorData);
    };

    useEffect(() => {
        fetchCampaign();
    }, [campaignId]);

    useEffect(() => {
        if (campaign) {
            calculateMetrics();
            calculateTimelineData();
            calculateVendorPerformance();
        }
    }, [campaign, users, vendors]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 font-medium">Loading campaign details...</p>
                </div>
            </div>
        );
    }

    if (!campaign?.id) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 font-medium">Campaign not found</p>
                </div>
            </div>
        );
    }

    const getColorClass = (color) => {
        const colors = {
            purple: '#8b5cf6', blue: '#3b82f6', green: '#10b981',
            orange: '#f97316', pink: '#ec4899', indigo: '#6366f1', teal: '#14b8a6',
        };
        return colors[color] || '#8b5cf6';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="px-4 md:px-6 py-6 max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold text-white">Sampling Campaign</h2>
                            <span className={`px-3 py-1 ${campaign?.isPaused ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'} text-xs font-bold rounded-md`}>
                                {campaign?.isPaused ? "PAUSED" : "ACTIVE"}
                            </span>
                        </div>
                        <p className="text-gray-400">
                            Campaign: <span className="font-mono font-semibold text-gray-300">{campaign?.campaignName || "N/A"}</span>
                        </p>
                        {(campaign?.description || campaign?.heading) && (
                            <p className="text-gray-500 text-sm mt-1">{campaign.description || campaign.heading}</p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-gray-700 rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm text-gray-300">
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-gray-700 rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm text-gray-300">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-sm shadow-lg shadow-purple-500/30">
                            <Share2 className="w-4 h-4" />
                            Share Report
                        </button>
                    </div>
                </div>

                {/* KPI Cards Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                    <KPICard title="Total Target Samples" value={metrics.totalTargetSamples.toLocaleString()} icon={Target} color="purple" getColorClass={getColorClass} />
                    <KPICard title="Total Distributed" value={metrics.totalDistributed.toLocaleString()} subtitle={`${metrics.completionPercentage}% of target`} icon={Package} color="blue" getColorClass={getColorClass} />
                    <KPICard title="Campaign Completion" value={`${metrics.completionPercentage}%`} subtitle={`${metrics.remainingSamples} remaining`} icon={Activity} color="green" getColorClass={getColorClass} />
                    <KPICard title="Remaining Samples" value={metrics.remainingSamples.toLocaleString()} subtitle={`${metrics.completionPercentage}% completed`} icon={Clock} color="orange" getColorClass={getColorClass} />
                </div>

                {/* KPI Cards Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                    <KPICard title="Campaign Timeline" value={`${metrics.completedDays}/${metrics.plannedDays}`} subtitle={metrics.plannedDays > 0 ? `${((metrics.completedDays / metrics.plannedDays) * 100).toFixed(0)}% complete` : "N/A"} icon={Calendar} color="pink" getColorClass={getColorClass} />
                    <KPICard title="Active Locations" value={metrics.activeLocations.toString()} subtitle={`${metrics.activeLocations} locations`} icon={MapPin} color="orange" getColorClass={getColorClass} />
                    <KPICard title="Today's Distribution" value={metrics.todayDistribution.toString()} subtitle="Samples today" icon={TrendingUp} color="indigo" getColorClass={getColorClass} />
                    <KPICard title="Unique Recipients" value={metrics.uniqueRecipients.toString()} subtitle="Distinct users" icon={Users} color="teal" getColorClass={getColorClass} />
                </div>

                {/* Distribution Timeline Chart */}
                <div className="mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Distribution Timeline (Last 30 Days)</h3>
                    {timelineData.dailyDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={timelineData.dailyDistribution}>
                                <defs>
                                    <linearGradient id="colorSamples" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                                <Area type="monotone" dataKey="samples" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSamples)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">No timeline data available</div>
                    )}
                </div>

                {/* Demographics & Campaign Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <SprukoPieChart male={demographics.male} chartTitle="Demographic Breakdown" title="Engagements" female={demographics.female} other={demographics.other} total={demographics.total} />

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Campaign Details</h3>
                        <div className="space-y-4">
                            <DetailRow label="Target Audience" value={campaign?.gender || "All"} />
                            <DetailRow label="Age Group" value={campaign?.ageGroup || "All"} />
                            <DetailRow label="Reward Type" value={campaign?.reward || "N/A"} />
                            <DetailRow label="Campaign Objective" value={campaign?.campaignObjective || "N/A"} />
                            <DetailRow label="Physical Locations" value={campaign?.physicalLocations?.join(", ") || "N/A"} />
                            {campaign?.keywords?.length > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Keywords</span>
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        {campaign.keywords.map((kw, i) => (
                                            <span key={i} className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-md border border-purple-500/30">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vendor Performance Table */}
                {vendorPerformance.length > 0 && (
                    <div className="mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-white">Vendor Performance</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vendor ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Logo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Business Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Products</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Samples</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {vendorPerformance.map((vendor, idx) => (
                                        <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{vendor.vendorId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {vendor.vendorLogo ? (
                                                    <img src={vendor.vendorLogo} alt={vendor.businessName} className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{vendor.businessName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                <div className="flex flex-wrap gap-1">
                                                    {vendor.products.map((product, i) => (
                                                        <span key={i} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-md border border-blue-500/30">{product}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400 font-bold">{vendor.totalSamples}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Monthly & Hourly Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <ChartCard title="Monthly Distribution" data={timelineData.monthlyDistribution}>
                        <BarChart data={timelineData.monthlyDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ChartCard>

                    <ChartCard title="Hourly Distribution" data={timelineData.hourlyDistribution}>
                        <LineChart data={timelineData.hourlyDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                            <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ChartCard>
                </div>

                {/* Target Locations */}
                {campaign.targetLocations?.length > 0 && (
                    <div className="mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-400" />
                            Target Locations ({campaign.targetLocations.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {campaign.targetLocations.map((location, idx) => (
                                <span key={idx} className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all">
                                    {location}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Audit Photos Section */}
                <div className="mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30">
                            <Camera className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Audit Photos</h3>
                            <p className="text-sm text-gray-400">Quality verification images</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {(campaign?.auditPhotos?.length > 0 || campaign?.photos?.length > 0) ? (
                            (campaign?.auditPhotos || campaign?.photos || []).slice(0, 12).map((photo, i) => (
                                <div key={i} className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer border border-gray-700 hover:border-purple-500">
                                    <img src={photo?.url || photo} alt={`Audit ${i + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))
                        ) : (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="aspect-square bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-purple-500/30">
                                    <Camera className="w-8 h-8 text-purple-400/50" />
                                </div>
                            ))
                        )}
                    </div>
                    {(campaign?.auditPhotos?.length > 0 || campaign?.photos?.length > 0) && (
                        <button className="w-full mt-4 py-2.5 text-sm font-medium text-purple-400 hover:bg-purple-600/10 rounded-lg transition-colors border border-purple-500/30">
                            View All Photos ({campaign?.auditPhotos?.length || campaign?.photos?.length})
                        </button>
                    )}
                </div>

                {/* Quiz Questions */}
                <SurveyTable surveyData={surveyData} users={users} campaignId={campaignId} />
            </div>
        </div>
    );
};

// Reusable Components
const KPICard = ({ title, value, subtitle, icon: Icon, color, getColorClass }) => {
    const bgGradient = {
        purple: 'from-purple-600/20 to-purple-700/20', blue: 'from-blue-600/20 to-blue-700/20',
        green: 'from-green-600/20 to-green-700/20', orange: 'from-orange-600/20 to-orange-700/20',
        pink: 'from-pink-600/20 to-pink-700/20', indigo: 'from-indigo-600/20 to-indigo-700/20',
        teal: 'from-teal-600/20 to-teal-700/20',
    };

    const borderColor = {
        purple: 'border-purple-500/30', blue: 'border-blue-500/30', green: 'border-green-500/30',
        orange: 'border-orange-500/30', pink: 'border-pink-500/30', indigo: 'border-indigo-500/30',
        teal: 'border-teal-500/30',
    };

    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-white">{value}</h3>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${bgGradient[color]} border ${borderColor[color]}`}>
                    <Icon className="w-6 h-6" style={{ color: getColorClass(color) }} />
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{value}</span>
    </div>
);

const ChartCard = ({ title, data, children }) => (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
                {children}
            </ResponsiveContainer>
        ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
                No distribution data available
            </div>
        )}
    </div>
);

export default SamplingCampaignDetail;