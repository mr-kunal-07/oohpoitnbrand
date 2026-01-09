"use client";

import { useEffect, useState, useContext, useMemo } from "react";
import { TrendingUp, Package, Target, MapPin, Users, Calendar, Activity, Clock, Filter, Download, Share2 } from "lucide-react";
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

const KPICard = ({ title, value, subtitle, icon: Icon, color }) => {
    const colorConfig = COLORS[color] || COLORS.purple;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
                    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorConfig.bg} border ${colorConfig.border}`}>
                    <Icon className="w-6 h-6" style={{ color: colorConfig.icon }} />
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900 font-semibold">{value}</span>
    </div>
);

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

    // Calculate all data when campaign changes
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading campaign details...</p>
                </div>
            </div>
        );
    }

    if (!campaign?.id) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 font-medium">Campaign not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="px-4 md:px-6 py-6 max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Sampling Campaign</h2>
                            <span className={`px-3 py-1 ${campaign?.isPaused ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'} text-xs font-bold rounded-md border`}>
                                {campaign?.isPaused ? "PAUSED" : "ACTIVE"}
                            </span>
                        </div>
                        <p className="text-slate-600">
                            Campaign: <span className="font-mono font-semibold text-slate-900">{campaign?.campaignName || "N/A"}</span>
                        </p>
                        {(campaign?.description || campaign?.heading) && (
                            <p className="text-slate-500 text-sm mt-1">{campaign.description || campaign.heading}</p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm text-slate-700">
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm text-slate-700">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm shadow-sm">
                            <Share2 className="w-4 h-4" />
                            Share Report
                        </button>
                    </div>
                </div>

                {/* KPI Cards Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard title="Total Target Samples" value={metrics.totalTargetSamples.toLocaleString()} icon={Target} color="purple" />
                    <KPICard title="Total Distributed" value={metrics.totalDistributed.toLocaleString()} subtitle={`${metrics.completionPercentage}% of target`} icon={Package} color="blue" />
                    <KPICard title="Campaign Completion" value={`${metrics.completionPercentage}%`} subtitle={`${metrics.remainingSamples} remaining`} icon={Activity} color="green" />
                    <KPICard title="Remaining Samples" value={metrics.remainingSamples.toLocaleString()} subtitle={`${metrics.completionPercentage}% completed`} icon={Clock} color="orange" />
                </div>

                {/* KPI Cards Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <KPICard title="Campaign Timeline" value={`${metrics.completedDays}/${metrics.plannedDays}`} subtitle={metrics.plannedDays > 0 ? `${((metrics.completedDays / metrics.plannedDays) * 100).toFixed(0)}% complete` : "N/A"} icon={Calendar} color="pink" />
                    <KPICard title="Active Locations" value={metrics.activeLocations.toString()} subtitle={`${metrics.activeLocations} locations`} icon={MapPin} color="orange" />
                    <KPICard title="Today's Distribution" value={metrics.todayDistribution.toString()} subtitle="Samples today" icon={TrendingUp} color="indigo" />
                    <KPICard title="Unique Recipients" value={metrics.uniqueRecipients.toString()} subtitle="Distinct users" icon={Users} color="teal" />
                </div>

                {/* Distribution Timeline Chart */}
                <DistributionTimelineChart timelineData={timelineData} />

                {/* Demographics & Campaign Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <SprukoPieChart male={demographics.male} female={demographics.female} other={demographics.other} />

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 ">
                        <h3 className="text-lg px-6 py-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50  font-semibold text-slate-900 mb-4 border-b border-slate-200">Campaign Details</h3>
                        <div className="space-y-4 px-6">
                            <DetailRow label="Target Audience" value={campaign?.gender || "All"} />
                            <DetailRow label="Age Group" value={campaign?.ageGroup || "All"} />
                            <DetailRow label="Reward Type" value={campaign?.reward || "N/A"} />
                            <DetailRow label="Campaign Objective" value={campaign?.campaignObjective || "N/A"} />
                            <DetailRow label="Physical Locations" value={campaign?.physicalLocations?.join(", ") || "N/A"} />
                            {campaign?.keywords?.length > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Keywords</span>
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        {campaign.keywords.map((kw, i) => (
                                            <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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