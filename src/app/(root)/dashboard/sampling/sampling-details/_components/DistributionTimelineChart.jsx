import { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, BarChart3, Clock, TrendingUp } from 'lucide-react';

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

// Custom Tooltip Component - Optimized
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2">
            <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
            <p className="text-sm font-bold text-purple-700">
                {payload[0].value} {payload[0].value === 1 ? 'sample' : 'samples'}
            </p>
        </div>
    );
};

const DistributionTimelineChart = ({ timelineData = {} }) => {
    const [timelineView, setTimelineView] = useState('daily');

    const config = VIEW_CONFIG[timelineView];
    const chartData = timelineData[`${timelineView}Distribution`] || [];

    return (
        <div className="mb-4 sm:mb-5 md:mb-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header - Fully Responsive */}
            <div className="flex px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-slate-200 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-600 flex-shrink-0" />
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-slate-900 line-clamp-2">
                        {config.title}
                    </h3>
                </div>

                {/* Filter Buttons - Mobile Optimized */}
                <div className="flex gap-1 sm:gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                    {VIEW_OPTIONS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setTimelineView(id)}
                            aria-label={`View ${label} distribution`}
                            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${timelineView === id
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Container - Responsive Height */}
            <div className="p-3 sm:p-4 md:p-6">
                {chartData.length > 0 ? (
                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={250} className="sm:!h-[280px] md:!h-[320px]">
                            {timelineView === 'hourly' ? (
                                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis
                                        dataKey={config.xKey}
                                        stroke="#64748b"
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        tickLine={false}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(147, 51, 234, 0.1)' }} />
                                    <Bar
                                        dataKey={config.dataKey}
                                        fill="#9333ea"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={40}
                                    />
                                </BarChart>
                            ) : (
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorSamples" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis
                                        dataKey={config.xKey}
                                        stroke="#64748b"
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        tickLine={false}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9333ea', strokeWidth: 1 }} />
                                    <Area
                                        type="monotone"
                                        dataKey={config.dataKey}
                                        stroke="#9333ea"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorSamples)"
                                    />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                ) : (
                    // Empty State - Improved Styling
                    <div className="h-48 sm:h-56 md:h-64 flex flex-col items-center justify-center text-slate-400 gap-2 sm:gap-3">
                        <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 opacity-30" />
                        <p className="text-sm sm:text-base font-medium text-center px-4">No timeline data available</p>
                        <p className="text-xs text-slate-400 text-center px-4">Data will appear here once samples are distributed</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DistributionTimelineChart;