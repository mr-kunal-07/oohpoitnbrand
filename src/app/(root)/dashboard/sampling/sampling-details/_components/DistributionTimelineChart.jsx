import { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

const VIEW_OPTIONS = [
    { id: 'daily', label: 'Daily', icon: Calendar },
    { id: 'monthly', label: 'Monthly', icon: TrendingUp },
    { id: 'hourly', label: 'Hourly', icon: Clock },
];

const VIEW_CONFIG = {
    daily: { title: 'Distribution Timeline (Last 30 Days)', dataKey: 'samples', xKey: 'date' },
    monthly: { title: 'Monthly Distribution', dataKey: 'value', xKey: 'name' },
    hourly: { title: 'Hourly Distribution', dataKey: 'value', xKey: 'name' },
};

const DistributionTimelineChart = ({ timelineData = {} }) => {
    const [timelineView, setTimelineView] = useState('daily');

    const config = VIEW_CONFIG[timelineView];
    const chartData = timelineData[`${timelineView}Distribution`] || [];

    const tooltipStyle = {
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        color: '#1e293b',
        fontSize: '14px',
    };

    return (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex px-6 py-3 flex-col bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <h3 className="text-2xl font-semibold text-slate-900">{config.title}</h3>

                {/* Filter Buttons */}
                <div className="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    {VIEW_OPTIONS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setTimelineView(id)}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${timelineView === id
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    {timelineView === 'hourly' ? (
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey={config.xKey}
                                stroke="#64748b"
                                style={{ fontSize: '12px' }}
                                tick={{ fill: '#64748b' }}
                            />
                            <YAxis
                                stroke="#64748b"
                                style={{ fontSize: '12px' }}
                                tick={{ fill: '#64748b' }}
                            />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar
                                dataKey={config.dataKey}
                                fill="#9333ea"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={50}
                            />
                        </BarChart>
                    ) : (
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorSamples" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey={config.xKey}
                                stroke="#64748b"
                                style={{ fontSize: '12px' }}
                                tick={{ fill: '#64748b' }}
                            />
                            <YAxis
                                stroke="#64748b"
                                style={{ fontSize: '12px' }}
                                tick={{ fill: '#64748b' }}
                            />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area
                                type="monotone"
                                dataKey={config.dataKey}
                                stroke="#9333ea"
                                fillOpacity={1}
                                fill="url(#colorSamples)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">
                    No timeline data available
                </div>
            )}
        </div>
    );
};

export default DistributionTimelineChart;