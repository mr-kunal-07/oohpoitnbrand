import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { FiBarChart2, FiTrendingUp, FiDownload, FiMaximize2, FiX } from 'react-icons/fi';

const BarChartComponent = ({ head, data, description, showStats = true, colorScheme = "purple" }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoveredBar, setHoveredBar] = useState(null);

    const gradientId = useMemo(() => `barGradient-${Math.random().toString(36).substr(2, 9)}`, []);
    const filteredData = useMemo(() => data?.filter((item) => item !== undefined) || [], [data]);

    // Color schemes
    const colorSchemes = {
        purple: {
            gradient: ['#9333EA', '#C084FC'],
            hover: '#7C3AED',
            stats: 'bg-purple-50 border-purple-100 text-purple-700'
        },
        blue: {
            gradient: ['#2563EB', '#60A5FA'],
            hover: '#3B82F6',
            stats: 'bg-blue-50 border-blue-100 text-blue-700'
        },
        green: {
            gradient: ['#059669', '#34D399'],
            hover: '#10B981',
            stats: 'bg-green-50 border-green-100 text-green-700'
        },
        orange: {
            gradient: ['#EA580C', '#FB923C'],
            hover: '#F97316',
            stats: 'bg-orange-50 border-orange-100 text-orange-700'
        }
    };

    const currentScheme = colorSchemes[colorScheme] || colorSchemes.purple;

    // Calculate statistics
    const stats = useMemo(() => {
        if (!filteredData.length) return null;

        const values = filteredData.map(item => item.value || 0);
        const total = values.reduce((sum, val) => sum + val, 0);
        const average = total / values.length;
        const max = Math.max(...values);
        const maxItem = filteredData.find(item => item.value === max);

        return { total, average: average.toFixed(1), max, maxItem };
    }, [filteredData]);

    // Custom Tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload;
        const percentage = stats ? ((data.value / stats.total) * 100).toFixed(1) : 0;

        return (
            <div className="bg-white px-4 py-3 rounded-xl shadow-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-1">{data.name}</p>
                <p className="text-lg font-bold text-purple-600">{data.value}</p>
                {stats && (
                    <p className="text-xs text-gray-600 mt-1">{percentage}% of total</p>
                )}
            </div>
        );
    };

    // Export data as CSV
    const exportData = () => {
        const csvContent = [
            ['Name', 'Value'],
            ...filteredData.map(item => [item.name, item.value])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${head.replace(/\s+/g, '_')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Empty state
    if (!filteredData.length) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden col-span-1 md:col-span-2">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h4 className="text-base font-semibold text-gray-900">{head}</h4>
                </div>
                <div className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <FiBarChart2 className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                    <p className="text-sm text-gray-500">Data will appear here once available.</p>
                </div>
            </div>
        );
    }

    const ChartContent = ({ height = 280 }) => (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={filteredData}
                onMouseMove={(state) => {
                    if (state.isTooltipActive) {
                        setHoveredBar(state.activeTooltipIndex);
                    } else {
                        setHoveredBar(null);
                    }
                }}
                onMouseLeave={() => setHoveredBar(null)}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={currentScheme.gradient[0]} stopOpacity={1} />
                        <stop offset="100%" stopColor={currentScheme.gradient[1]} stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id={`${gradientId}-hover`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={currentScheme.hover} stopOpacity={1} />
                        <stop offset="100%" stopColor={currentScheme.gradient[1]} stopOpacity={0.8} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(147, 51, 234, 0.05)' }} />
                <Bar
                    dataKey="value"
                    barSize={32}
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                >
                    {filteredData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={hoveredBar === index ? `url(#${gradientId}-hover)` : `url(#${gradientId})`}
                            style={{ transition: 'fill 0.2s ease' }}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <>
            {/* Main Chart Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden col-span-1 md:col-span-2 hover:shadow-md transition-shadow duration-300">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${currentScheme.stats}`}>
                                <FiBarChart2 size={20} />
                            </div>
                            <div>
                                <h4 className="text-base font-semibold text-gray-900">{head}</h4>
                                {description && (
                                    <p className="text-sm text-gray-600 mt-0.5">{description}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={exportData}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Export data"
                            >
                                <FiDownload size={18} />
                            </button>
                            <button
                                onClick={() => setIsFullscreen(true)}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Fullscreen"
                            >
                                <FiMaximize2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics Bar */}
                {showStats && stats && (
                    <div className="px-6 py-4 bg-gradient-to-br from-purple-50 to-blue-50 border-b border-gray-100">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-xs text-gray-600 mb-1">Total</p>
                                <p className="text-lg font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                            </div>
                            <div className="text-center border-x border-gray-200">
                                <p className="text-xs text-gray-600 mb-1">Average</p>
                                <p className="text-lg font-bold text-gray-900">{parseFloat(stats.average).toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-600 mb-1">Highest</p>
                                <p className="text-lg font-bold text-purple-600 flex items-center justify-center gap-1">
                                    <FiTrendingUp size={16} />
                                    {stats.max.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        {stats.maxItem && (
                            <div className="mt-3 text-center">
                                <p className="text-xs text-gray-600">
                                    Top performer: <span className="font-semibold text-gray-900">{stats.maxItem.name}</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Chart */}
                <div className="p-6">
                    <ChartContent />
                </div>

                {/* Footer with data points */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{filteredData.length} data points</span>
                        <span>Last updated: {new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
                            <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-3">
                                    <FiBarChart2 size={24} />
                                    <div>
                                        <h2 className="text-xl font-bold">{head}</h2>
                                        {description && (
                                            <p className="text-sm text-blue-100 mt-0.5">{description}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsFullscreen(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Statistics */}
                        {showStats && stats && (
                            <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-blue-50 border-b border-gray-200">
                                <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
                                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                                        <p className="text-sm text-gray-600 mb-2">Total Value</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                                        <p className="text-sm text-gray-600 mb-2">Average</p>
                                        <p className="text-3xl font-bold text-gray-900">{parseFloat(stats.average).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                                        <p className="text-sm text-gray-600 mb-2">Peak Value</p>
                                        <p className="text-3xl font-bold text-purple-600 flex items-center justify-center gap-2">
                                            <FiTrendingUp size={24} />
                                            {stats.max.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {stats.maxItem && (
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-gray-600">
                                            Highest performing category: <span className="font-semibold text-gray-900 text-base">{stats.maxItem.name}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Modal Chart */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <ChartContent height={500} />
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {filteredData.length} data points • Last updated: {new Date().toLocaleDateString()}
                            </div>
                            <button
                                onClick={exportData}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <FiDownload size={16} />
                                Export Data
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
        </>
    );
};

export default BarChartComponent
