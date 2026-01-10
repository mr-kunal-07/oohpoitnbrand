"use client";

import { useEffect, useState, useContext, useMemo } from "react";
import { TrendingUp, Package, Target, MapPin, Users, Calendar, Activity, Clock, Filter, Download, Share2, Menu } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { MyContext } from "@/context/MyContext";
import SprukoPieChart from "@/components/Spruko/CampaignPieChart";
import SurveyTable from "@/components/SurveyTable";
import DistributionTimelineChart from "./_components/DistributionTimelineChart";
import VendorPerformanceTable from "./_components/VendorPerformanceTable";
import AuditPhotos from "./_components/AuditPhotos";

const COLORS = {
    purple: { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', icon: '#9333EA' },
    blue: { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', icon: '#3B82F6' },
    green: { bg: 'from-green-50 to-green-100', border: 'border-green-200', icon: '#10B981' },
    orange: { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', icon: '#F97316' },
    pink: { bg: 'from-pink-50 to-pink-100', border: 'border-pink-200', icon: '#EC4899' },
    indigo: { bg: 'from-indigo-50 to-indigo-100', border: 'border-indigo-200', icon: '#6366F1' },
    teal: { bg: 'from-teal-50 to-teal-100', border: 'border-teal-200', icon: '#14B8A6' },
};

// Optimized KPI Card Component - Fully Responsive
const KPICard = ({ title, value, subtitle, icon: Icon, color }) => {
    const colorConfig = COLORS[color] || COLORS.purple;

    return (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 md:p-5 lg:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3 md:mb-4">
                <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1 line-clamp-2">{title}</p>
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 break-words leading-tight">{value}</h3>
                    {subtitle && <p className="text-xs text-slate-500 mt-0.5 sm:mt-1 line-clamp-1">{subtitle}</p>}
                </div>
                <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${colorConfig.bg} border ${colorConfig.border} flex-shrink-0`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ color: colorConfig.icon }} />
                </div>
            </div>
        </div>
    );
};

// Optimized Detail Row - Responsive Stacking
const DetailRow = ({ label, value }) => (
    <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1 py-2.5 sm:py-3 border-b border-slate-100 last:border-0">
        <span className="text-xs sm:text-sm text-slate-600 font-medium">{label}</span>
        <span className="text-sm sm:text-base text-slate-900 font-semibold break-words xs:text-right">{value}</span>
    </div>
);

const SamplingCampaignDetail = () => {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMobileActions, setShowMobileActions] = useState(false);
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

    // Calculate demographics - Memoized for performance
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

    // Fetch campaign data
    useEffect(() => {
        const fetchCampaign = async () => {
            if (!campaignId) return;

            setLoading(true);
            try {
                const response = await fetch(`/api/campaigns/${campaignId}`);
                const result = await response.json();
                setCampaign(result?.success && result?.data ? result.data : {});
            } catch (error) {
                console.error("Error fetching campaign:", error);
                setCampaign({});
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [campaignId]);

    // Calculate metrics and timeline - Optimized
    useEffect(() => {
        if (!campaign) return;

        // Calculate metrics
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
            activeLocations: campaign?.targetLocations?.length || 0,
            todayDistribution,
            uniqueRecipients: uniqueUsers,
        });

        // Calculate timeline data
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
    }, [campaign]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-sm sm:text-base text-slate-600 font-medium">Loading campaign details...</p>
                </div>
            </div>
        );
    }

    if (!campaign?.id) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-sm sm:text-base text-slate-600 font-medium">Campaign not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 max-w-[1600px] mx-auto">
                {/* Header - Fully Responsive */}
                <div className="mb-4 sm:mb-5 md:mb-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {/* Title and Status */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 break-words">Sampling Campaign</h2>
                                    <span className={`px-2 sm:px-3 py-1 ${campaign?.isPaused ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'} text-xs font-bold rounded-md border whitespace-nowrap`}>
                                        {campaign?.isPaused ? "PAUSED" : "ACTIVE"}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm md:text-base text-slate-600 break-words">
                                    Campaign: <span className="font-mono font-semibold text-slate-900">{campaign?.campaignName || "N/A"}</span>
                                </p>
                                {(campaign?.description || campaign?.heading) && (
                                    <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2">{campaign.description || campaign.heading}</p>
                                )}
                            </div>

                            {/* Desktop Actions */}
                            <div className="hidden md:flex gap-2 lg:gap-3 flex-shrink-0">
                                <button className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm text-slate-700 whitespace-nowrap">
                                    <Filter className="w-4 h-4" />
                                    <span className="hidden lg:inline">Filters</span>
                                </button>
                                <button className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm text-slate-700 whitespace-nowrap">
                                    <Download className="w-4 h-4" />
                                    <span className="hidden lg:inline">Export</span>
                                </button>
                                <button className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm shadow-sm whitespace-nowrap">
                                    <Share2 className="w-4 h-4" />
                                    <span className="hidden lg:inline">Share</span>
                                </button>
                            </div>
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex md:hidden gap-2">
                            <button
                                onClick={() => setShowMobileActions(!showMobileActions)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm text-slate-700"
                            >
                                <Menu className="w-4 h-4" />
                                Actions
                            </button>
                        </div>

                        {/* Mobile Actions Dropdown */}
                        {showMobileActions && (
                            <div className="md:hidden flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <button className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors font-medium text-sm text-slate-700">
                                    <Filter className="w-4 h-4" />
                                    Filters
                                </button>
                                <button className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors font-medium text-sm text-slate-700">
                                    <Download className="w-4 h-4" />
                                    Export Data
                                </button>
                                <button className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors font-medium text-sm text-purple-700">
                                    <Share2 className="w-4 h-4" />
                                    Share Report
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* KPI Cards Row 1 - Responsive Grid */}
                <div className="grid grid-cols-2 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                    <KPICard title="Total Target Samples" value={metrics.totalTargetSamples.toLocaleString()} icon={Target} color="purple" />
                    <KPICard title="Total Distributed" value={metrics.totalDistributed.toLocaleString()} subtitle={`${metrics.completionPercentage}% of target`} icon={Package} color="blue" />
                    <KPICard title="Campaign Completion" value={`${metrics.completionPercentage}%`} subtitle={`${metrics.remainingSamples} remaining`} icon={Activity} color="green" />
                    <KPICard title="Remaining Samples" value={metrics.remainingSamples.toLocaleString()} subtitle={`${metrics.completionPercentage}% completed`} icon={Clock} color="orange" />
                </div>

                {/* KPI Cards Row 2 - Responsive Grid */}
                <div className="grid grid-cols-2 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                    <KPICard title="Campaign Timeline" value={`${metrics.completedDays}/${metrics.plannedDays}`} subtitle={metrics.plannedDays > 0 ? `${((metrics.completedDays / metrics.plannedDays) * 100).toFixed(0)}% complete` : "N/A"} icon={Calendar} color="pink" />
                    <KPICard title="Active Locations" value={metrics.activeLocations.toString()} subtitle={`${metrics.activeLocations} ${metrics.activeLocations === 1 ? 'location' : 'locations'}`} icon={MapPin} color="orange" />
                    <KPICard title="Today's Distribution" value={metrics.todayDistribution.toString()} subtitle="Samples today" icon={TrendingUp} color="indigo" />
                    <KPICard title="Unique Recipients" value={metrics.uniqueRecipients.toString()} subtitle="Distinct users" icon={Users} color="teal" />
                </div>

                {/* Distribution Timeline Chart */}
                <DistributionTimelineChart timelineData={timelineData} />

                {/* Demographics & Campaign Info - Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-4 sm:mb-5 md:mb-6">
                    {/* Campaign Details - Responsive */}
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <h3 className="text-lg sm:text-xl md:text-2xl px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 font-semibold text-slate-900 border-b border-slate-200 flex gap-2 items-center">
                            <Package className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-yellow-600 flex-shrink-0" />
                            <span className="truncate">Campaign Details</span>
                        </h3>
                        <div className="space-y-0 px-4 sm:px-5 md:px-6 py-3 sm:py-4">
                            <DetailRow label="Target Audience" value={campaign?.gender || "All"} />
                            <DetailRow label="Age Group" value={campaign?.ageGroup || "All"} />
                            <DetailRow label="Reward Type" value={campaign?.reward || "N/A"} />
                            <DetailRow label="Campaign Objective" value={campaign?.campaignObjective || "N/A"} />
                            <DetailRow label="Physical Locations" value={campaign?.physicalLocations?.join(", ") || "N/A"} />

                            {/* Keywords - Responsive Wrapping */}
                            {campaign?.keywords?.length > 0 && (
                                <div className="flex flex-col xs:flex-row xs:justify-between gap-2 py-2.5 sm:py-3 border-b border-slate-100 last:border-0">
                                    <span className="text-xs sm:text-sm text-slate-600 font-medium flex-shrink-0">Keywords</span>
                                    <div className="flex gap-1.5 sm:gap-2 flex-wrap xs:justify-end">
                                        {campaign.keywords.map((kw, i) => (
                                            <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200 whitespace-nowrap">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Demographics Pie Chart */}
                    <SprukoPieChart male={demographics.male} female={demographics.female} other={demographics.other} />
                </div>

                {/* Vendor Performance Table */}
                <VendorPerformanceTable campaign={campaign} vendors={vendors} />

                {/* Audit Photos Section */}
                <AuditPhotos campaign={campaign} />

                {/* Quiz Questions */}
                <SurveyTable surveyData={surveyData} users={users} campaignId={campaignId} />
            </div>
        </div>
    );
};

export default SamplingCampaignDetail;