
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AreaChartComponent = ({ head, data }) => {
    const [activeIndex, setActiveIndex] = useState(null);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white px-4 py-3 rounded-lg shadow-md border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
                    <p className="text-sm text-purple-600 font-bold">
                        {payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomDot = (props) => {
        const { cx, cy, index } = props;
        if (index === activeIndex) {
            return (
                <g>
                    <circle cx={cx} cy={cy} r={6} fill="#9333EA" stroke="#fff" strokeWidth={3} />
                    <circle cx={cx} cy={cy} r={3} fill="#fff" />
                </g>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-2xl shadow-md border border-purple-100/50 overflow-hidden col-span-1 md:col-span-2 hover:shadow-xl transition-shadow duration-300">
            <div className="px-6 py-5 border-b border-purple-100/50 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-900">{head}</h4>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                        <span className="text-xs font-medium text-gray-600">Trend</span>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart
                        data={data}
                        onMouseMove={(state) => {
                            if (state.isTooltipActive) {
                                setActiveIndex(state.activeTooltipIndex);
                            } else {
                                setActiveIndex(null);
                            }
                        }}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#9333EA" stopOpacity={0.4} />
                                <stop offset="50%" stopColor="#A855F7" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#C084FC" stopOpacity={0.05} />
                            </linearGradient>
                            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                <feOffset dx="0" dy="2" result="offsetblur" />
                                <feComponentTransfer>
                                    <feFuncA type="linear" slope="0.2" />
                                </feComponentTransfer>
                                <feMerge>
                                    <feMergeNode />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#E5E7EB"
                            strokeOpacity={0.5}
                        />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 13, fill: '#6B7280', fontWeight: 500 }}
                            axisLine={{ stroke: '#E5E7EB' }}
                            tickLine={{ stroke: '#E5E7EB' }}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 13, fill: '#6B7280', fontWeight: 500 }}
                            axisLine={{ stroke: '#E5E7EB' }}
                            tickLine={{ stroke: '#E5E7EB' }}
                            dx={-10}
                            tickFormatter={(value) => value.toLocaleString()}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{
                                stroke: '#9333EA',
                                strokeWidth: 2,
                                strokeDasharray: '5 5',
                                strokeOpacity: 0.5
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#9333EA"
                            strokeWidth={3}
                            fill="url(#areaGradient)"
                            dot={<CustomDot />}
                            activeDot={{
                                r: 7,
                                fill: '#9333EA',
                                stroke: '#fff',
                                strokeWidth: 3,
                                filter: 'url(#shadow)'
                            }}
                            animationDuration={1000}
                            animationEasing="ease-in-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
export default AreaChartComponent
