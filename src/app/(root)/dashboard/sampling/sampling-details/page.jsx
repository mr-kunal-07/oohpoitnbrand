import React, { useEffect, useState, useContext } from "react";
import { Loader2, TrendingUp, Package, Target, MapPin, Users, Calendar, Activity, Clock, BarChart3, Camera, MessageSquare, Filter, Download, Share2, Star } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { useSearchParams } from "next/navigation";

// Import your real context
import { MyContext } from "@/context/MyContext";

const SamplingCampaignDetail = () => {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const { users = [], vendors = [] } = useContext(MyContext);
    const searchParams = useSearchParams();
    const campaignId = searchParams.get("campaignId");

    const [metrics, setMetrics] = useState({
        totalTargetSamples: 0,
        totalDistributed: 0,
        completionPercentage: 0,
        remainingSamples: 0,
        plannedDays: 0,
        completedDays: 0,
        activeLocations: 0,
        todayDistribution: 0,
        conversionRate: 0,
        avgRating: 0,
        totalRedirects: 0,
        redemptionRate: 0,
    });

    const [demographics, setDemographics] = useState({
        maleCount: 0,
        femaleCount: 0,
        otherCount: 0,
    });

    const [timelineData, setTimelineData] = useState({
        monthlyDistribution: [],
        hourlyDistribution: [],
        dailyDistribution: [],
    });

    const [productPerformance, setProductPerformance] = useState([]);
    const [locationPerformance, setLocationPerformance] = useState([]);
    const [vendorPerformance, setVendorPerformance] = useState([]);
    const [funnelData, setFunnelData] = useState([]);
    const [feedbackData, setFeedbackData] = useState({
        positive: 0,
        mixed: 0,
        negative: 0,
    });

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

    const calculateMetrics = () => {
        if (!campaign) return;

        const targetSamples = campaign?.targetSamples || campaign?.sampleDistribution?.targetQuantity || 0;
        const distributedSamples = campaign?.sampleDistribution?.distributions || [];
        const totalDistributed = distributedSamples.reduce((sum, dist) => sum + (dist?.quantity || 0), 0);

        const completion = targetSamples > 0 ? ((totalDistributed / targetSamples) * 100).toFixed(1) : 0;
        const remaining = Math.max(0, targetSamples - totalDistributed);

        const startDate = campaign?.startDate ? new Date(campaign.startDate) : null;
        const endDate = campaign?.endDate ? new Date(campaign.endDate) : null;
        const today = new Date();

        let plannedDays = 0;
        let completedDays = 0;

        if (startDate && endDate) {
            plannedDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            completedDays = Math.min(
                Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)),
                plannedDays
            );
            if (completedDays < 0) completedDays = 0;
        }

        const activeLocations = campaign?.targetLocations?.length || campaign?.physicalLocations?.length || 0;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayDistribution = distributedSamples.filter(
            dist => new Date(dist?.timestamp || dist?.createdAt) >= todayStart
        ).length || 0;

        let totalRedemptions = 0;
        users?.forEach(user => {
            if (user?.coupons?.length) {
                user.coupons.forEach(coupon => {
                    if (coupon?.campaignId === campaignId && coupon?.isRedeemed) {
                        totalRedemptions++;
                    }
                });
            }
        });

        const conversionRate = totalDistributed > 0 ? ((totalRedemptions / totalDistributed) * 100).toFixed(1) : 0;

        const feedbackItems = campaign?.feedback?.responses || campaign?.feedback || [];
        const ratings = feedbackItems.filter(f => f?.rating).map(f => f.rating);
        const avgRating = ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
            : 0;

        setMetrics({
            totalTargetSamples: targetSamples,
            totalDistributed: totalDistributed,
            completionPercentage: parseFloat(completion),
            remainingSamples: remaining,
            plannedDays,
            completedDays,
            activeLocations,
            todayDistribution,
            conversionRate: parseFloat(conversionRate),
            avgRating: parseFloat(avgRating),
            totalRedirects: totalRedemptions,
            redemptionRate: parseFloat(conversionRate),
        });
    };

    const calculateDemographics = () => {
        if (!campaign || !users) return;

        let male = 0, female = 0, other = 0;
        const distributions = campaign?.sampleDistribution?.distributions || [];

        distributions.forEach(dist => {
            const userId = dist?.userId || dist?.recipientId;
            if (userId) {
                const user = users.find(u => u?.id === userId || u?._id === userId || u?.uid === userId);
                if (user) {
                    if (user?.gender === "Male" || user?.gender === "male") male++;
                    else if (user?.gender === "Female" || user?.gender === "female") female++;
                    else other++;
                }
            }
        });

        setDemographics({ maleCount: male, femaleCount: female, otherCount: other });
    };

    const calculateTimelineData = () => {
        const distributions = campaign?.sampleDistribution?.distributions || [];

        if (distributions.length === 0) {
            setTimelineData({ monthlyDistribution: [], hourlyDistribution: [], dailyDistribution: [] });
            return;
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Monthly
        const monthlyScans = distributions.reduce((acc, dist) => {
            const date = new Date(dist?.timestamp || dist?.createdAt || dist?.date);
            const month = date.getMonth();
            acc[month] = (acc[month] || 0) + (dist?.quantity || 1);
            return acc;
        }, {});

        const monthlyData = Object.keys(monthlyScans).map(monthIndex => ({
            name: monthNames[monthIndex],
            value: monthlyScans[monthIndex] || 0,
        }));

        // Hourly
        const hourlyScans = distributions.reduce((acc, dist) => {
            const date = new Date(dist?.timestamp || dist?.createdAt || dist?.date);
            const hour = date.getHours();
            acc[hour] = (acc[hour] || 0) + (dist?.quantity || 1);
            return acc;
        }, {});

        const hourlyData = Object.keys(hourlyScans).map(hour => {
            const hourInt = parseInt(hour, 10);
            const period = hourInt >= 12 ? "PM" : "AM";
            const formattedHour = hourInt % 12 === 0 ? 12 : hourInt % 12;
            return { name: `${formattedHour}${period}`, value: hourlyScans[hour] || 0 };
        });

        // Daily (last 30 days)
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date.toISOString().split('T')[0];
        });

        const dailyScans = distributions.reduce((acc, dist) => {
            const date = new Date(dist?.timestamp || dist?.createdAt || dist?.date).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + (dist?.quantity || 1);
            return acc;
        }, {});

        const dailyData = last30Days.map(date => ({
            date: new Date(date).getDate(),
            samples: dailyScans[date] || 0,
        }));

        setTimelineData({ monthlyDistribution: monthlyData, hourlyDistribution: hourlyData, dailyDistribution: dailyData });
    };

    const calculateVendorPerformance = () => {
        const distributions = campaign?.sampleDistribution?.distributions || [];

        if (distributions.length === 0 || !vendors) {
            setVendorPerformance([]);
            return;
        }

        const vendorData = [];

        distributions.forEach(dist => {
            const vendorId = dist?.vendorId || dist?.distributedBy;
            if (vendorId) {
                const vendor = vendors?.find(v => v?.vendorId === vendorId || v?._id === vendorId || v?.id === vendorId);
                const existing = vendorData.find(v => v?.vendorId === vendorId);

                if (existing) {
                    existing.totalSamples += (dist?.quantity || 1);
                } else if (vendor) {
                    vendorData.push({
                        vendorId: vendorId,
                        businessName: vendor?.businessName || vendor?.name || "Unknown Vendor",
                        vendorLogo: vendor?.vendorLogo || vendor?.logo || null,
                        totalSamples: dist?.quantity || 1,
                    });
                }
            }
        });

        setVendorPerformance(vendorData);
    };

    const calculateFunnelData = () => {
        if (!campaign) {
            setFunnelData([]);
            return;
        }

        const distributions = campaign?.sampleDistribution?.distributions || [];
        const samplesDistributed = distributions.reduce((sum, d) => sum + (d?.quantity || 1), 0);

        const uniqueRecipients = new Set(
            distributions.map(d => d?.userId || d?.recipientId).filter(Boolean)
        ).size || samplesDistributed;

        const couponsDelivered = users?.reduce((count, user) => {
            return count + (user?.coupons?.filter(c => c?.campaignId === campaignId).length || 0);
        }, 0) || 0;

        const redeemedCoupons = users?.reduce((count, user) => {
            return count + (user?.coupons?.filter(
                c => c?.campaignId === campaignId && c?.isRedeemed
            ).length || 0);
        }, 0) || 0;

        setFunnelData([
            { name: "Samples Distributed", value: samplesDistributed },
            { name: "Unique Recipients", value: uniqueRecipients },
            { name: "Coupons Delivered", value: couponsDelivered },
            { name: "Redeemed Coupons", value: redeemedCoupons },
        ]);
    };

    const calculateFeedbackData = () => {
        const feedbackItems = campaign?.feedback?.responses || campaign?.feedback || [];

        if (feedbackItems.length === 0) {
            setFeedbackData({ positive: 0, mixed: 0, negative: 0 });
            return;
        }

        const total = feedbackItems.length;
        const positive = feedbackItems.filter(f =>
            f?.sentiment === "positive" || f?.rating >= 4
        ).length;
        const negative = feedbackItems.filter(f =>
            f?.sentiment === "negative" || f?.rating <= 2
        ).length;
        const mixed = total - positive - negative;

        setFeedbackData({
            positive: ((positive / total) * 100).toFixed(0),
            mixed: ((mixed / total) * 100).toFixed(0),
            negative: ((negative / total) * 100).toFixed(0),
        });
    };

    useEffect(() => {
        fetchCampaign();
    }, [campaignId]);

    useEffect(() => {
        if (campaign) {
            calculateMetrics();
            calculateDemographics();
            calculateTimelineData();
            calculateVendorPerformance();
            calculateFunnelData();
            calculateFeedbackData();
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

    const getColorClass = (color) => {
        const colors = {
            purple: '#8b5cf6',
            blue: '#3b82f6',
            green: '#10b981',
            orange: '#f97316',
            pink: '#ec4899',
            indigo: '#6366f1',
            teal: '#14b8a6',
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
                            <span className={`px-3 py-1 ${campaign?.status === 'paused' || campaign?.isPaused ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'} text-xs font-bold rounded-md`}>
                                {campaign?.status === 'paused' || campaign?.isPaused ? "PAUSED" : campaign?.status?.toUpperCase() || "ACTIVE"}
                            </span>
                        </div>
                        <p className="text-gray-400">
                            Campaign: <span className="font-mono font-semibold text-gray-300">{campaign?.campaignName || campaign?.name || "N/A"}</span>
                        </p>
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
                    <KPICard title="Conversion Rate" value={`${metrics.conversionRate}%`} subtitle="Sample → Purchase" icon={BarChart3} color="teal" getColorClass={getColorClass} />
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
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        color: '#fff',
                                    }}
                                />
                                <Area type="monotone" dataKey="samples" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSamples)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No timeline data available
                        </div>
                    )}
                </div>

                {/* Conversion Funnel & Demographics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h3>
                        <div className="space-y-3">
                            {funnelData.map((stage, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-400">{stage.name}</span>
                                        <span className="text-sm font-bold text-white">{stage.value}</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                                            style={{ width: `${funnelData[0]?.value > 0 ? (stage.value / funnelData[0].value) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Demographics</h3>
                        {(demographics.maleCount + demographics.femaleCount + demographics.otherCount) > 0 ? (
                            <div className="flex items-center justify-center h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: "Male", value: demographics.maleCount },
                                                { name: "Female", value: demographics.femaleCount },
                                                { name: "Other", value: demographics.otherCount },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            <Cell fill="#8b5cf6" />
                                            <Cell fill="#ec4899" />
                                            <Cell fill="#f59e0b" />
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #374151',
                                                borderRadius: '8px',
                                                color: '#fff',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                No demographic data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Vendor Performance Table */}
                {vendorPerformance.length > 0 && (
                    <div className="mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-white">Vendor Performance</h3>
                        </div>
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full">
                                <thead className="bg-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vendor ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Logo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Business Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Samples</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {vendorPerformance.map((vendor, idx) => (
                                        <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{vendor.vendorId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {vendor.vendorLogo ? (
                                                    <img src={vendor.vendorLogo} alt={vendor.businessName} className="w-8 h-8 rounded-full" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                                        <Users className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{vendor.businessName}</td>
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
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Monthly Distribution</h3>
                        {timelineData.monthlyDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={timelineData.monthlyDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#fff',
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                No distribution data available
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Hourly Distribution</h3>
                        {timelineData.hourlyDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={timelineData.hourlyDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                  <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#fff',
                                        }}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                No hourly data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Cards: Audit Photos, Feedback, Team Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Audit Photos */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30">
                                <Camera className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Audit Photos</h3>
                                <p className="text-sm text-gray-400">Quality verification</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {campaign?.auditPhotos?.length > 0 || campaign?.photos?.length > 0 ? (
                                (campaign?.auditPhotos || campaign?.photos || []).slice(0, 6).map((photo, i) => (
                                    <div key={i} className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer border border-gray-700">
                                        <img src={photo?.url || photo} alt={`Audit ${i + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))
                            ) : (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="aspect-square bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-purple-500/30">
                                        <Camera className="w-6 h-6 text-purple-400" />
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="w-full mt-4 py-2 text-sm font-medium text-purple-400 hover:bg-purple-600/10 rounded-lg transition-colors border border-purple-500/30">
                            View All Photos ({campaign?.auditPhotos?.length || campaign?.photos?.length || 0})
                        </button>
                    </div>

                    {/* Feedback Card */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Feedback</h3>
                                <p className="text-sm text-gray-400">Customer sentiment</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-600/10 rounded-lg border border-green-500/30">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-sm font-medium text-gray-300">Positive</span>
                                </div>
                                <span className="text-lg font-bold text-green-400">{feedbackData.positive}%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-yellow-600/10 rounded-lg border border-yellow-500/30">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span className="text-sm font-medium text-gray-300">Mixed</span>
                                </div>
                                <span className="text-lg font-bold text-yellow-400">{feedbackData.mixed}%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-600/10 rounded-lg border border-red-500/30">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-sm font-medium text-gray-300">Negative</span>
                                </div>
                                <span className="text-lg font-bold text-red-400">{feedbackData.negative}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Team Metrics Card */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-orange-600/20 rounded-xl border border-orange-500/30">
                                <Users className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Team Metrics</h3>
                                <p className="text-sm text-gray-400">Performance overview</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-gray-600">
                                <span className="text-sm font-medium text-gray-400">Active Promoters</span>
                                <span className="text-lg font-bold text-white">{campaign?.activePromoters || campaign?.team?.activeCount || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-600/10 rounded-lg border border-green-500/30">
                                <span className="text-sm font-medium text-gray-400">Compliance Score</span>
                                <span className="text-lg font-bold text-green-400">{campaign?.complianceScore || campaign?.compliance?.score || 0}%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-600/10 rounded-lg border border-blue-500/30">
                                <span className="text-sm font-medium text-gray-400">Feedback Count</span>
                                <span className="text-lg font-bold text-blue-400">{campaign?.feedback?.responses?.length || campaign?.feedback?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, subtitle, icon: Icon, color, getColorClass }) => {
    const bgGradient = {
        purple: 'from-purple-600/20 to-purple-700/20',
        blue: 'from-blue-600/20 to-blue-700/20',
        green: 'from-green-600/20 to-green-700/20',
        orange: 'from-orange-600/20 to-orange-700/20',
        pink: 'from-pink-600/20 to-pink-700/20',
        indigo: 'from-indigo-600/20 to-indigo-700/20',
        teal: 'from-teal-600/20 to-teal-700/20',
    };

    const borderColor = {
        purple: 'border-purple-500/30',
        blue: 'border-blue-500/30',
        green: 'border-green-500/30',
        orange: 'border-orange-500/30',
        pink: 'border-pink-500/30',
        indigo: 'border-indigo-500/30',
        teal: 'border-teal-500/30',
    };

    return (
        <div className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-all`}>
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

export default SamplingCampaignDetail;
