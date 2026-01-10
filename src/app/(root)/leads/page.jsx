"use client";

import { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { Send, TrendingUp, CheckCircle, XCircle, Clock, Search, AlertCircle, RefreshCw } from "lucide-react";
import { MyContext } from "@/context/MyContext";

// Optimized Stat Card - Light Theme
const StatCard = ({ icon: Icon, label, value, trend, colorClass }) => (
    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className={`p-2 sm:p-2.5 ${colorClass} rounded-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
        </div>
        <p className="text-slate-600 text-xs font-medium mb-1 line-clamp-1">{label}</p>
        <div className="flex flex-col xs:flex-row xs:items-baseline gap-1">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 truncate">{trend}</p>
        </div>
    </div>
);

// Empty State Component - Light Theme
const EmptyState = ({ icon, title, subtitle }) => (
    <div className="flex items-center justify-center py-12 sm:py-16 px-4">
        <div className="text-center max-w-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl">{icon}</span>
            </div>
            <p className="text-slate-900 font-semibold text-base sm:text-lg mb-1">{title}</p>
            <p className="text-slate-600 text-sm">{subtitle}</p>
        </div>
    </div>
);

// Loading Spinner - Light Theme
const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12 sm:py-16">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-slate-200 border-t-purple-600 mb-3 sm:mb-4"></div>
            <p className="text-slate-700 font-medium text-sm sm:text-base">Loading leads...</p>
        </div>
    </div>
);

// Error State Component - Light Theme
const ErrorState = ({ message, onRetry }) => (
    <div className="flex items-center justify-center py-12 sm:py-16 px-4">
        <div className="text-center max-w-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-50 border border-red-200 mb-3 sm:mb-4">
                <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
            </div>
            <p className="text-slate-900 font-semibold mb-2 text-base sm:text-lg">Something went wrong</p>
            <p className="text-slate-600 text-sm mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all active:scale-95 shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            )}
        </div>
    </div>
);

// Optimized Lead Card - Light Theme
const LeadCard = ({ lead, onSendMessage }) => {
    const responses = useMemo(() => {
        return Array.isArray(lead.leadResponses)
            ? lead.leadResponses
            : lead.leadResponses ? [lead.leadResponses] : [];
    }, [lead.leadResponses]);

    const firstResponse = responses[0] || {};
    const hasMultipleResponses = responses.length > 1;

    const getStatusConfig = useCallback((answer) => {
        switch (answer) {
            case "yes":
                return {
                    bg: "bg-green-50",
                    text: "text-green-700",
                    border: "border-green-200",
                    icon: CheckCircle
                };
            case "no":
                return {
                    bg: "bg-red-50",
                    text: "text-red-700",
                    border: "border-red-200",
                    icon: XCircle
                };
            default:
                return {
                    bg: "bg-slate-50",
                    text: "text-slate-700",
                    border: "border-slate-200",
                    icon: null
                };
        }
    }, []);

    const statusConfig = getStatusConfig(firstResponse.selectedAnswer);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2 sm:gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base truncate">
                        {lead.userName || lead.user?.name || "Unknown User"}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 mb-0.5 truncate">
                        {lead.userEmail || lead.user?.email || "No email"}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 truncate">
                        {lead.userPhone || lead.user?.phoneNumber || "No phone"}
                    </p>
                    {lead.userId && (
                        <p className="text-xs text-slate-500 mt-1 truncate">
                            ID: {lead.userId.slice(0, 8)}...
                        </p>
                    )}
                </div>

                <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold self-start flex-shrink-0 border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                    {StatusIcon && <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                    <span className="whitespace-nowrap">
                        {firstResponse.selectedAnswer?.toUpperCase() || "PENDING"}
                    </span>
                </span>
            </div>

            {/* Metadata */}
            <div className="space-y-1.5 sm:space-y-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-600 flex-shrink-0">Campaign:</span>
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium truncate max-w-[200px]">
                        {lead.campaignId || "—"}
                    </span>
                </div>

                {lead.brandId && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-slate-600 flex-shrink-0">Brand:</span>
                        <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-medium truncate max-w-[200px]">
                            {lead.brandId}
                        </span>
                    </div>
                )}

                {firstResponse.question && (
                    <p className="text-xs sm:text-sm text-slate-700 line-clamp-2 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="font-medium text-slate-900">Q:</span> {firstResponse.question}
                    </p>
                )}

                {hasMultipleResponses && (
                    <p className="text-xs text-blue-600 font-medium mt-2">
                        +{responses.length - 1} more response{responses.length - 1 > 1 ? 's' : ''}
                    </p>
                )}

                {lead.createdAt && (
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {new Date(lead.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                )}
            </div>

            {/* Action Button */}
            <button
                onClick={() => onSendMessage(lead)}
                className="w-full inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all hover:shadow-md active:scale-95 text-sm"
            >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Send Message
            </button>
        </div>
    );
};

// Main Page Component - Light Theme
const Page = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterAnswer, setFilterAnswer] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const [lastFetch, setLastFetch] = useState(null);

    const { user } = useContext(MyContext);

    // Fetch leads from API - Memoized
    const fetchLeads = useCallback(async () => {
        if (!user?.brandId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                brandId: user.brandId,
                sortBy: sortBy
            });

            const response = await fetch(`/api/leads?${params}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch leads (${response.status})`);
            }

            const data = await response.json();

            if (data.success) {
                setLeads(data.leads || []);
                setLastFetch(new Date());
            } else {
                throw new Error(data.error || "Failed to fetch leads");
            }
        } catch (err) {
            console.error("Error fetching leads:", err);
            setError(err.message || "Failed to fetch leads");
        } finally {
            setLoading(false);
        }
    }, [user?.brandId, sortBy]);

    // Initial fetch
    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!user?.brandId) return;

        const interval = setInterval(fetchLeads, 30000);
        return () => clearInterval(interval);
    }, [fetchLeads, user?.brandId]);

    // Calculate stats - Memoized
    const stats = useMemo(() => {
        const getAnswerCount = (answer) => {
            return leads.filter(lead => {
                const responses = Array.isArray(lead.leadResponses)
                    ? lead.leadResponses
                    : lead.leadResponses ? [lead.leadResponses] : [];
                return responses.some(r => r?.selectedAnswer === answer);
            }).length;
        };

        const yesCount = getAnswerCount("yes");
        const noCount = getAnswerCount("no");
        const total = leads.length;
        const conversion = total > 0 ? Math.round((yesCount / total) * 100) : 0;

        return {
            total,
            yes: yesCount,
            no: noCount,
            pending: total - (yesCount + noCount),
            conversion
        };
    }, [leads]);

    // Filter and sort leads - Memoized
    const filteredLeads = useMemo(() => {
        let result = [...leads];

        // Filter by answer
        if (filterAnswer !== "all") {
            result = result.filter(lead => {
                const responses = Array.isArray(lead.leadResponses)
                    ? lead.leadResponses
                    : lead.leadResponses ? [lead.leadResponses] : [];
                return responses.some(r => r?.selectedAnswer === filterAnswer);
            });
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(lead => {
                const searchFields = [
                    lead.userName,
                    lead.user?.name,
                    lead.userEmail,
                    lead.user?.email,
                    lead.campaignId,
                    lead.userId
                ].filter(Boolean).map(field => field.toLowerCase());

                return searchFields.some(field => field.includes(term));
            });
        }

        // Sort
        if (sortBy === "yes-first") {
            result.sort((a, b) => {
                const aResponses = Array.isArray(a.leadResponses)
                    ? a.leadResponses
                    : a.leadResponses ? [a.leadResponses] : [];
                const bResponses = Array.isArray(b.leadResponses)
                    ? b.leadResponses
                    : b.leadResponses ? [b.leadResponses] : [];

                const aHasYes = aResponses.some(r => r?.selectedAnswer === "yes");
                const bHasYes = bResponses.some(r => r?.selectedAnswer === "yes");

                return bHasYes - aHasYes;
            });
        }

        return result;
    }, [leads, filterAnswer, searchTerm, sortBy]);

    // Handle send message
    const handleSendMessage = useCallback((lead) => {
        const name = lead.userName || lead.user?.name || 'Unknown';
        const email = lead.userEmail || lead.user?.email || 'N/A';

        console.log("Sending message to lead:", lead);
        alert(`Message will be sent to ${name}\nEmail: ${email}`);
    }, []);

    // Stats configuration - Memoized
    const statsConfig = useMemo(() => [
        {
            icon: TrendingUp,
            label: "Total Leads",
            value: stats.total,
            trend: stats.total > 0 ? "Active" : "No data",
            colorClass: "bg-blue-600"
        },
        {
            icon: CheckCircle,
            label: "Positive",
            value: stats.yes,
            trend: `${stats.conversion}% conversion`,
            colorClass: "bg-green-600"
        },
        {
            icon: XCircle,
            label: "Negative",
            value: stats.no,
            trend: `${100 - stats.conversion}% rate`,
            colorClass: "bg-red-600"
        },
        {
            icon: Clock,
            label: "Pending",
            value: stats.pending,
            trend: stats.pending > 0 ? "Action needed" : "All clear",
            colorClass: "bg-purple-600"
        }
    ], [stats]);

    // No brand ID
    if (!user?.brandId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
                <EmptyState
                    icon="👤"
                    title="No brand ID found"
                    subtitle="Please log in to view your leads"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

                {/* Header - Responsive */}
                <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
                            Lead Dashboard
                        </h1>
                        <p className="text-slate-600 text-xs sm:text-sm md:text-base truncate">
                            Brand: <span className="font-semibold text-slate-900">{user.brandId}</span>
                        </p>
                    </div>
                    <button
                        onClick={fetchLeads}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all hover:shadow-md active:scale-95 text-sm whitespace-nowrap shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden xs:inline">Refresh</span>
                    </button>
                </div>

                {/* Stats Grid - Responsive */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 lg:mb-8">
                    {statsConfig.map((stat, idx) => (
                        <StatCard key={idx} {...stat} />
                    ))}
                </div>

                {/* Filters - Responsive */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
                        {/* Search */}
                        <div className="relative md:col-span-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-400 text-sm"
                            />
                        </div>

                        {/* Filter by Answer */}
                        <select
                            value={filterAnswer}
                            onChange={(e) => setFilterAnswer(e.target.value)}
                            className="px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-slate-900 text-sm"
                        >
                            <option value="all">All Responses</option>
                            <option value="yes">Positive Only</option>
                            <option value="no">Negative Only</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-slate-900 text-sm"
                        >
                            <option value="recent">Most Recent</option>
                            <option value="yes-first">Positive First</option>
                        </select>
                    </div>
                </div>

                {/* Content - Responsive */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <ErrorState message={error} onRetry={fetchLeads} />
                    ) : filteredLeads.length === 0 ? (
                        <EmptyState
                            icon={searchTerm || filterAnswer !== "all" ? "🔍" : "📭"}
                            title={searchTerm || filterAnswer !== "all" ? "No leads found" : "No leads yet"}
                            subtitle={searchTerm || filterAnswer !== "all" ? "Try adjusting your filters" : "Leads will appear here once collected"}
                        />
                    ) : (
                        <>
                            {/* Leads Grid - Responsive */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4">
                                {filteredLeads.map(lead => (
                                    <LeadCard
                                        key={lead.id || lead.userId}
                                        lead={lead}
                                        onSendMessage={handleSendMessage}
                                    />
                                ))}
                            </div>

                            {/* Footer - Responsive */}
                            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-600">
                                <p>
                                    Showing <span className="font-semibold text-slate-900">{filteredLeads.length}</span> of{" "}
                                    <span className="font-semibold text-slate-900">{leads.length}</span> leads
                                </p>
                                <p className="text-slate-500 text-center sm:text-right">
                                    {lastFetch
                                        ? `Updated: ${lastFetch.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}`
                                        : 'Never updated'
                                    }
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Page;