import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, MapPin, TrendingUp } from 'lucide-react';
import { MdOutlineFormatTextdirectionRToL } from 'react-icons/md';

const AreaDistributionTable = ({ areaWiseDistribution }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'scans', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Sorting
    const sortedData = useMemo(() => {
        if (!areaWiseDistribution || areaWiseDistribution.length === 0) return [];
        
        const sorted = [...areaWiseDistribution];
        if (sortConfig.key) {
            sorted.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                return sortConfig.direction === 'asc'
                    ? aVal.toString().localeCompare(bVal.toString())
                    : bVal.toString().localeCompare(aVal.toString());
            });
        }
        return sorted;
    }, [areaWiseDistribution, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(start, start + itemsPerPage);
    }, [sortedData, currentPage]);

    // Statistics
    const totalScans = useMemo(() => {
        if (!areaWiseDistribution) return 0;
        return areaWiseDistribution.reduce((sum, item) => sum + (item.scans || 0), 0);
    }, [areaWiseDistribution]);

    const maxScans = useMemo(() => {
        if (!areaWiseDistribution || areaWiseDistribution.length === 0) return 1;
        return Math.max(...areaWiseDistribution.map(d => d.scans || 0), 1);
    }, [areaWiseDistribution]);

    // Early returns AFTER all hooks
    if (!areaWiseDistribution) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-800/50 rounded-xl border border-gray-700">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium">Loading distribution data...</p>
            </div>
        );
    }

    if (areaWiseDistribution.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-800/50 rounded-xl border border-gray-700">
                <div className="bg-slate-700 p-6 rounded-full shadow-lg mb-4">
                    <MdOutlineFormatTextdirectionRToL className="text-5xl text-gray-500" />
                </div>
                <p className="text-gray-300 font-medium">No location data available</p>
                <p className="text-gray-500 text-sm mt-1">Data will appear here once scans are recorded</p>
            </div>
        );
    }

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setCurrentPage(1);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="opacity-40" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="text-purple-400" />
            : <ArrowDown size={14} className="text-purple-400" />;
    };

    return (
        <div className="space-y-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-lg shadow-lg">
                        <MapPin size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Area Distribution</h2>
                        <p className="text-sm text-gray-400">{sortedData.length} locations tracked</p>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 px-4 py-2 rounded-lg border border-purple-500/30">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-purple-400" />
                        <div>
                            <p className="text-xs text-purple-300 font-medium">Total Scans</p>
                            <p className="text-lg font-bold text-white">{totalScans.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800 border-b border-gray-700">
                            <tr>
                                <th
                                    onClick={() => handleSort('state')}
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-slate-700 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        State
                                        {getSortIcon('state')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('city')}
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-slate-700 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        City
                                        {getSortIcon('city')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('neighbourhood')}
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-slate-700 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        Area
                                        {getSortIcon('neighbourhood')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('pincode')}
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-slate-700 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        Pincode
                                        {getSortIcon('pincode')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('scans')}
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-slate-700 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        Scans
                                        {getSortIcon('scans')}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {paginatedData.map(({ state, city, neighbourhood, pincode, scans }, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-slate-700/50 transition-colors group"
                                >
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        <span className="font-medium">{state || '—'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="font-semibold text-white">{city || '—'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {neighbourhood || '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-700/50 text-gray-300 font-mono text-xs border border-gray-600 group-hover:bg-purple-600/20 group-hover:text-purple-300 group-hover:border-purple-500/30 transition-colors">
                                            {pincode || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-purple-400">{scans || 0}</span>
                                            <div className="flex-1 max-w-[100px] bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all"
                                                    style={{ width: `${Math.min(((scans || 0) / maxScans) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-slate-800 px-6 py-4 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">
                                Showing <span className="font-semibold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of{' '}
                                <span className="font-semibold text-white">{sortedData.length}</span> results
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-300"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                                                    currentPage === pageNum
                                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                                        : 'bg-slate-800 border border-gray-700 text-gray-300 hover:bg-slate-700'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-300"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AreaDistributionTable;