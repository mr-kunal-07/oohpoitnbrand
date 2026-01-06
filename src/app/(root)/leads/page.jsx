"use client";

import { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { Send, TrendingUp, CheckCircle, XCircle, Clock, Search, AlertCircle, RefreshCw } from "lucide-react";
import { MyContext } from "@/context/MyContext";

// Reusable Components
const StatCard = ({ icon: Icon, label, value, trend, colorClass }) => (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 lg:p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 ${colorClass} rounded-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">{label}</p>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <p className="text-2xl lg:text-3xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500">{trend}</p>
        </div>
    </div>
);

const EmptyState = ({ icon, title, subtitle }) => (
    <div className="flex items-center justify-center py-16 px-4">
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-gray-700 mb-4">
                <span className="text-4xl">{icon}</span>
            </div>
            <p className="text-white font-semibold text-lg mb-1">{title}</p>
            <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>
    </div>
);

const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-blue-600 mb-4"></div>
            <p className="text-gray-300 font-medium">Loading leads...</p>
        </div>
    </div>
);

const ErrorState = ({ message, onRetry }) => (
    <div className="flex items-center justify-center py-16 px-4">
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30 mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-white font-semibold mb-2">Something went wrong</p>
            <p className="text-gray-400 text-sm mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            )}
        </div>
    </div>
);

const LeadCard = ({ lead, onSendMessage }) => {
    const responses = Array.isArray(lead.leadResponses)
        ? lead.leadResponses
        : lead.leadResponses ? [lead.leadResponses] : [];

    const firstResponse = responses[0] || {};
    const hasMultipleResponses = responses.length > 1;

    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-gray-700 hover:border-blue-500/50 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                        {lead.userName || lead.user?.name || "Unknown User"}
                    </h3>
                    <p className="text-sm text-gray-300 mb-0.5">
                        {lead.userEmail || lead.user?.email || "No email"}
                    </p>
                    <p className="text-sm text-gray-400">
                        {lead.userPhone || lead.user?.phoneNumber || "No phone"}
                    </p>
                    {lead.userId && (
                        <p className="text-xs text-gray-500 mt-1">ID: {lead.userId.slice(0, 8)}...</p>
                    )}
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold self-start border ${
                    firstResponse.selectedAnswer === "yes"
                        ? "bg-green-600/20 text-green-300 border-green-500/30"
                        : firstResponse.selectedAnswer === "no"
                        ? "bg-red-600/20 text-red-300 border-red-500/30"
                        : "bg-gray-600/20 text-gray-300 border-gray-500/30"
                }`}>
                    {firstResponse.selectedAnswer === "yes" && <CheckCircle className="w-3.5 h-3.5" />}
                    {firstResponse.selectedAnswer === "no" && <XCircle className="w-3.5 h-3.5" />}
                    {firstResponse.selectedAnswer?.toUpperCase() || "PENDING"}
                </span>
            </div>

            <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">Campaign:</span>
                    <span className="inline-block px-2 py-0.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded text-xs font-medium">
                        {lead.campaignId || "—"}
                    </span>
                </div>

                {lead.brandId && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-400">Brand:</span>
                        <span className="inline-block px-2 py-0.5 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded text-xs font-medium">
                            {lead.brandId}
                        </span>
                    </div>
                )}

                {firstResponse.question && (
                    <p className="text-sm text-gray-300 line-clamp-2 mt-2">
                        <span className="font-medium text-white">Q:</span> {firstResponse.question}
                    </p>
                )}

                {hasMultipleResponses && (
                    <p className="text-xs text-blue-400 font-medium mt-2">
                        +{responses.length - 1} more response{responses.length - 1 > 1 ? 's' : ''}
                    </p>
                )}

                {lead.createdAt && (
                    <p className="text-xs text-gray-500 mt-2">
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

            <button
                onClick={() => onSendMessage(lead)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:shadow-lg active:scale-95 text-sm"
            >
                <Send className="w-4 h-4" />
                Send Message
            </button>
        </div>
    );
};

const Page = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterAnswer, setFilterAnswer] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const [lastFetch, setLastFetch] = useState(null);

    const { user } = useContext(MyContext);

    // Fetch leads from API
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setLeads(data.leads);
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

    // Initial fetch and refresh
    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!user?.brandId) return;

        const interval = setInterval(() => {
            fetchLeads();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchLeads, user?.brandId]);

    // Calculate stats
    const stats = useMemo(() => {
        const getAnswerCount = (answer) => {
            return leads.filter(lead => {
                const responses = Array.isArray(lead.leadResponses) ? lead.leadResponses : [lead.leadResponses].filter(Boolean);
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

    // Filter and sort leads
    const filteredLeads = useMemo(() => {
        let result = [...leads];

        if (filterAnswer !== "all") {
            result = result.filter(lead => {
                const responses = Array.isArray(lead.leadResponses) ? lead.leadResponses : [lead.leadResponses].filter(Boolean);
                return responses.some(r => r?.selectedAnswer === filterAnswer);
            });
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(lead => {
                const name = lead.userName || lead.user?.name || "";
                const email = lead.userEmail || lead.user?.email || "";
                const campaign = lead.campaignId || "";
                const userId = lead.userId || "";

                return (
                    name.toLowerCase().includes(term) ||
                    email.toLowerCase().includes(term) ||
                    campaign.toLowerCase().includes(term) ||
                    userId.toLowerCase().includes(term)
                );
            });
        }

        // Client-side sorting for "yes-first" option
        if (sortBy === "yes-first") {
            result.sort((a, b) => {
                const aResponses = Array.isArray(a.leadResponses) ? a.leadResponses : [a.leadResponses].filter(Boolean);
                const bResponses = Array.isArray(b.leadResponses) ? b.leadResponses : [b.leadResponses].filter(Boolean);
                const aHasYes = aResponses.some(r => r?.selectedAnswer === "yes");
                const bHasYes = bResponses.some(r => r?.selectedAnswer === "yes");
                return bHasYes - aHasYes;
            });
        }

        return result;
    }, [leads, filterAnswer, searchTerm, sortBy]);

    const handleSendMessage = useCallback((lead) => {
        console.log("Sending message to lead:", lead);
        alert(`Message will be sent to ${lead.userName || lead.user?.name || 'Unknown'}\nEmail: ${lead.userEmail || lead.user?.email || 'N/A'}`);
    }, []);

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
            trend: `${100 - stats.conversion}% rejection`,
            colorClass: "bg-red-600"
        },
        {
            icon: Clock,
            label: "Pending",
            value: stats.pending,
            trend: stats.pending > 0 ? "Action required" : "All clear",
            colorClass: "bg-purple-600"
        }
    ], [stats]);

    if (!user?.brandId) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
                <EmptyState
                    icon="👤"
                    title="No brand ID found"
                    subtitle="Please log in to view your leads"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Header */}
                <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Lead Dashboard</h1>
                        <p className="text-gray-400 text-sm sm:text-base">
                            Tracking leads for brand: <span className="font-semibold text-white">{user.brandId}</span>
                        </p>
                    </div>
                    <button
                        onClick={fetchLeads}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-all hover:shadow-lg active:scale-95 text-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
                    {statsConfig.map((stat, idx) => (
                        <StatCard key={idx} {...stat} />
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 p-4 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="relative sm:col-span-2 lg:col-span-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, campaign..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800 text-white placeholder-gray-400 text-sm"
                            />
                        </div>

                        <select
                            value={filterAnswer}
                            onChange={(e) => setFilterAnswer(e.target.value)}
                            className="px-4 py-2.5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800 text-white text-sm"
                        >
                            <option value="all">All Responses</option>
                            <option value="yes">Positive Only</option>
                            <option value="no">Negative Only</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2.5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800 text-white text-sm"
                        >
                            <option value="recent">Most Recent</option>
                            <option value="yes-first">Positive First</option>
                        </select>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
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
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                                {filteredLeads.map(lead => (
                                    <LeadCard key={lead.id} lead={lead} onSendMessage={handleSendMessage} />
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-4 sm:px-6 py-4 bg-slate-800 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-gray-300">
                                <p>
                                    Showing <span className="font-semibold text-white">{filteredLeads.length}</span> of{" "}
                                    <span className="font-semibold text-white">{leads.length}</span> leads
                                </p>
                                <p className="text-gray-400">
                                    {lastFetch ? `Last updated: ${lastFetch.toLocaleTimeString()}` : 'Never updated'}
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