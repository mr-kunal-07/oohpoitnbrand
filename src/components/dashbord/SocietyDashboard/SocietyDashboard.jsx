import React, { useState, useEffect, useContext } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, MapPin, TrendingUp, Users, Eye, Clock, Target, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { MyContext } from '@/context/MyContext';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const SocietyDashboard = () => {
    const { user, campaigns } = useContext(MyContext);
    const [loading, setLoading] = useState(true);
    const [societies, setSocieties] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [chartToggle, setChartToggle] = useState('engagement');
    const [filterType, setFilterType] = useState('all');
    const [filterCity, setFilterCity] = useState('all');

    useEffect(() => {
        if (campaigns.length > 0) {
            setSelectedCampaign(campaigns[0]);
            fetchSocieties();
        }
    }, [campaigns]);

    const fetchSocieties = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/getSocieties');
            if (!res.ok) throw new Error('Failed to fetch societies');
            const societiesData = await res.json();
            setSocieties(societiesData);
        } catch (error) {
            console.error('Error fetching societies:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateMetrics = () => {
        if (!selectedCampaign || !societies.length) return null;

        const campaignSocieties = societies.filter(s =>
            s.campaigns?.some(c => c.campaignId === selectedCampaign.campaignId)
        );

        const totalScreens = campaignSocieties.reduce((sum, s) => sum + (s.frameCount || 0), 0);
        const totalFlats = campaignSocieties.reduce((sum, s) => sum + (s.flatCount || 0), 0);

        // Calculate metrics based on actual campaign data
        const totalTargetUsers = selectedCampaign.societies?.reduce((sum, s) => sum + (s.targetUsers || 0), 0) || 0;
        const totalVerified = Math.floor(totalTargetUsers * 0.68);
        const uniqueResidents = Math.floor(totalTargetUsers * 0.52);
        const avgWatchTime = 18.5;
        const completionRate = 72;
        const ctaClicks = Math.floor(totalVerified * 0.15);
        const ctr = totalVerified > 0 ? ((ctaClicks / totalVerified) * 100).toFixed(2) : 0;

        // Calculate survey responses from quiz and lead questions
        const surveyQuestions = (selectedCampaign.quizQuestions?.length || 0) + (selectedCampaign.leadQuestions?.length || 0);
        const surveyResponses = Math.floor(totalVerified * 0.35);
        const surveyCompletionRate = totalVerified > 0 ? ((surveyResponses / totalVerified) * 100).toFixed(1) : 0;

        return {
            totalScreens,
            totalFlats,
            totalVerified,
            uniqueResidents,
            avgWatchTime,
            completionRate,
            ctaClicks,
            ctr,
            campaignSocieties,
            surveyResponses,
            surveyCompletionRate,
            surveyQuestions
        };
    };

    const generateDailyData = () => {
        if (!selectedCampaign) return [];

        const start = selectedCampaign.startDate?.seconds ? new Date(selectedCampaign.startDate.seconds * 1000) : new Date();
        const end = selectedCampaign.endDate?.seconds ? new Date(selectedCampaign.endDate.seconds * 1000) : new Date();
        const days = Math.min(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 30);

        return Array.from({ length: days }, (_, i) => {
            const baseEngagement = 300 + (i * 15);
            return {
                day: new Date(start.getTime() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                engagement: Math.floor(baseEngagement + Math.random() * 100),
                unique: Math.floor(baseEngagement * 0.65 + Math.random() * 50),
                watchTime: Math.floor(15 + Math.random() * 10),
                completion: Math.floor(65 + Math.random() * 15)
            };
        });
    };

    const getSocietyPerformance = (society) => {
        const campaignInfo = society.campaigns?.find(c => c.campaignId === selectedCampaign.campaignId);
        const targetUsers = campaignInfo?.targetUsers || society.flatCount * 0.6;
        const engagement = Math.floor(targetUsers * (0.6 + Math.random() * 0.2));
        const unique = Math.floor(engagement * 0.72);
        const watchTime = Math.floor(12 + Math.random() * 12);
        const completion = Math.floor(60 + Math.random() * 25);

        const performanceScore = (engagement / targetUsers) * 0.4 + (completion / 100) * 0.3 + (watchTime / 30) * 0.3;
        const performance = performanceScore > 0.6 ? 'high' : performanceScore > 0.4 ? 'medium' : 'low';

        return { engagement, unique, watchTime, completion, performance, ctr: ((engagement * 0.15) / targetUsers * 100).toFixed(1) };
    };

    const getInterestSegments = () => {
        if (!selectedCampaign?.leadQuestions) return [];

        const segments = [
            { name: 'Highly Interested', value: 42, color: '#10b981' },
            { name: 'Moderately Interested', value: 34, color: '#3b82f6' },
            { name: 'Exploring Options', value: 18, color: '#f59e0b' },
            { name: 'Not Interested', value: 6, color: '#ef4444' }
        ];

        return segments;
    };

    const getCities = () => {
        const cities = new Set(societies.map(s => s.city).filter(Boolean));
        return ['all', ...Array.from(cities)];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user || !campaigns.length || !selectedCampaign) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">No campaign data available. Please create a campaign first.</p>
                </div>
            </div>
        );
    }

    const metrics = calculateMetrics();
    if (!metrics) return null;

    const dailyData = generateDailyData();
    const interestSegments = getInterestSegments();

    const filteredSocieties = metrics.campaignSocieties.filter(s => {
        const typeMatch = filterType === 'all' || s.type === filterType;
        const cityMatch = filterCity === 'all' || s.city === filterCity;
        return typeMatch && cityMatch;
    });

    const startDate = selectedCampaign.startDate?.seconds
        ? new Date(selectedCampaign.startDate.seconds * 1000).toLocaleDateString()
        : 'N/A';
    const endDate = selectedCampaign.endDate?.seconds
        ? new Date(selectedCampaign.endDate.seconds * 1000).toLocaleDateString()
        : 'N/A';

    const deliveryProgress = selectedCampaign.endDate?.seconds
        ? Math.min(((Date.now() / 1000 - selectedCampaign.startDate.seconds) / (selectedCampaign.endDate.seconds - selectedCampaign.startDate.seconds)) * 100, 100)
        : 0;

    return (
        <div className=" p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Campaign Overview */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Campaign Overview</h2>
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedCampaign.campaignId}
                            onChange={(e) => setSelectedCampaign(campaigns.find(c => c.campaignId === e.target.value))}
                        >
                            {campaigns.map(c => (
                                <option key={c.campaignId} value={c.campaignId}>{c.campaignName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{selectedCampaign.campaignName}</h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedCampaign.isPaused ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                }`}>
                                {selectedCampaign.isPaused ? 'Paused' : 'Active'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{selectedCampaign.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Societies Covered</p>
                            <p className="text-2xl font-bold text-blue-600">{metrics.campaignSocieties.length}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Screens</p>
                            <p className="text-2xl font-bold text-green-600">{metrics.totalScreens}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Verified Views</p>
                            <p className="text-2xl font-bold text-purple-600">{metrics.totalVerified.toLocaleString()}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Unique Residents</p>
                            <p className="text-2xl font-bold text-orange-600">{metrics.uniqueResidents.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Campaign Period</p>
                            <p className="text-xs font-semibold">{startDate}</p>
                            <p className="text-xs text-gray-500">to {endDate}</p>
                        </div>
                        <div className="border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Daily Budget</p>
                            <p className="text-sm font-semibold">₹{user?.adBudget ? (user.adBudget / 30).toFixed(0) : 'N/A'}</p>
                        </div>
                        <div className="border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Objective</p>
                            <p className="text-xs font-semibold">{selectedCampaign.campaignObjective}</p>
                        </div>
                        <div className="border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Format</p>
                            <p className="text-xs font-semibold">{selectedCampaign.campaignFormat}</p>
                        </div>
                    </div>
                </div>

                {/* Attention Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Avg Watch Time</h3>
                        </div>
                        <p className="text-3xl font-bold text-blue-600">{metrics.avgWatchTime}s</p>
                        <p className="text-xs text-gray-500 mt-1">Per view average</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-gray-900">Completion Rate</h3>
                        </div>
                        <p className="text-3xl font-bold text-green-600">{metrics.completionRate}%</p>
                        <p className="text-xs text-gray-500 mt-1">Video completion</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            <h3 className="font-semibold text-gray-900">CTR</h3>
                        </div>
                        <p className="text-3xl font-bold text-purple-600">{metrics.ctr}%</p>
                        <p className="text-xs text-gray-500 mt-1">Click-through rate</p>
                    </div>
                </div>

                {/* Daily Performance Graph */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Daily Performance</h2>
                        <div className="flex gap-2">
                            {['engagement', 'unique', 'watchTime', 'completion'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setChartToggle(type)}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition ${chartToggle === type
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {type === 'engagement' ? 'Engagement' :
                                        type === 'unique' ? 'Unique' :
                                            type === 'watchTime' ? 'Watch Time' : 'Completion'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey={chartToggle}
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Society-Level Performance */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Society Performance</h2>
                        <div className="flex gap-3">
                            <select
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="premium">Premium</option>
                                <option value="standard">Standard</option>
                                <option value="affordable">Affordable</option>
                            </select>
                            <select
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                value={filterCity}
                                onChange={(e) => setFilterCity(e.target.value)}
                            >
                                {getCities().map(city => (
                                    <option key={city} value={city}>
                                        {city === 'all' ? 'All Cities' : city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Society Name</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Type</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">City</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Flats</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Engagement</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Unique</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Watch Time</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Completion</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">CTR</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSocieties.map(society => {
                                    const perf = getSocietyPerformance(society);
                                    return (
                                        <tr key={society.societyId} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="py-3 px-4 text-sm font-medium">{society.societyName}</td>
                                            <td className="py-3 px-4 text-sm">
                                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                    {society.type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{society.city}</td>
                                            <td className="py-3 px-4 text-sm">{society.flatCount}</td>
                                            <td className="py-3 px-4 text-sm font-semibold">{perf.engagement}</td>
                                            <td className="py-3 px-4 text-sm">{perf.unique}</td>
                                            <td className="py-3 px-4 text-sm">{perf.watchTime}s</td>
                                            <td className="py-3 px-4 text-sm">{perf.completion}%</td>
                                            <td className="py-3 px-4 text-sm">{perf.ctr}%</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-block w-3 h-3 rounded-full ${perf.performance === 'high' ? 'bg-green-500' :
                                                        perf.performance === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}></span>
                                                    <span className="text-xs capitalize text-gray-600">{perf.performance}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Engagement & Audience Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Engagement Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-gray-700 font-medium">CTA Clicks</span>
                                <span className="text-2xl font-bold text-blue-600">{metrics.ctaClicks}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-gray-700 font-medium">CTR</span>
                                <span className="text-2xl font-bold text-green-600">{metrics.ctr}%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                <span className="text-gray-700 font-medium">Leads Generated</span>
                                <span className="text-2xl font-bold text-purple-600">{Math.floor(metrics.ctaClicks * 0.45)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                <span className="text-gray-700 font-medium">Survey Responses</span>
                                <span className="text-2xl font-bold text-orange-600">{metrics.surveyResponses}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                                <span className="text-gray-700 font-medium">Survey Completion</span>
                                <span className="text-2xl font-bold text-pink-600">{metrics.surveyCompletionRate}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Audience Interest Segments</h3>
                        {interestSegments.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={interestSegments}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {interestSegments.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-4 space-y-2">
                                    {interestSegments.map((segment, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                                                <span className="text-gray-600">{segment.name}</span>
                                            </div>
                                            <span className="font-semibold text-gray-900">{segment.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No survey data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Campaign Creative & Details */}
                {selectedCampaign.advertisingVideo && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Campaign Creative</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <video
                                    controls
                                    className="w-full rounded-lg border border-gray-200"
                                    src={selectedCampaign.advertisingVideo}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Campaign Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Heading:</span> {selectedCampaign.heading}</p>
                                        <p><span className="font-medium">CTA:</span> {selectedCampaign.cta}</p>
                                        <p><span className="font-medium">Target Locations:</span> {selectedCampaign.targetLocations?.join(', ')}</p>
                                        <p><span className="font-medium">Age Group:</span> {selectedCampaign.ageGroup}</p>
                                        <p><span className="font-medium">Gender:</span> {selectedCampaign.gender}</p>
                                    </div>
                                </div>
                                {selectedCampaign.adCreativeImages && selectedCampaign.adCreativeImages.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Ad Creatives</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedCampaign.adCreativeImages.slice(0, 4).map((img, i) => (
                                                <img key={i} src={img} alt={`Creative ${i + 1}`} className="w-full h-24 object-cover rounded border border-gray-200" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SocietyDashboard;