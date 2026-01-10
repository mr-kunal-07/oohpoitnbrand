"use client";
import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, MapPin, TrendingUp } from 'lucide-react';
import { MdOutlineFormatTextdirectionRToL } from 'react-icons/md';

const AreaDistributionTable = ({ areaWiseDistribution }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'scans', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Sorting logic
    const sortedData = useMemo(() => {
        if (!areaWiseDistribution?.length) return [];

        const sorted = [...areaWiseDistribution];
        sorted.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            return sortConfig.direction === 'asc'
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
        return sorted;
    }, [areaWiseDistribution, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(start, start + itemsPerPage);
    }, [sortedData, currentPage]);

    // Statistics
    const totalScans = useMemo(() =>
        areaWiseDistribution?.reduce((sum, item) => sum + (item.scans || 0), 0) || 0,
        [areaWiseDistribution]
    );

    const maxScans = useMemo(() =>
        Math.max(...(areaWiseDistribution?.map(d => d.scans || 0) || [0]), 1),
        [areaWiseDistribution]
    );

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

    const getPageNumbers = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 3) {
            return [1, 2, 3, 4, 5];
        }

        if (currentPage >= totalPages - 2) {
            return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
        }

        return Array.from({ length: 5 }, (_, i) => currentPage - 2 + i);
    };

    // Loading state
    if (!areaWiseDistribution) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading distribution data...</p>
            </div>
        );
    }

    // Empty state
    if (areaWiseDistribution.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-200">
                <div className="bg-gray-200 p-6 rounded-full shadow-lg mb-4">
                    <MdOutlineFormatTextdirectionRToL className="text-5xl text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium">No location data available</p>
                <p className="text-gray-500 text-sm mt-1">Data will appear here once scans are recorded</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2.5 sm:p-3 rounded-lg shadow-lg">
                        <MapPin size={20} className="sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Area Distribution</h2>
                        <p className="text-xs sm:text-sm text-gray-600">{sortedData.length} locations tracked</p>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 px-4 py-2.5 rounded-lg border border-purple-300 shadow-sm">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-purple-600" />
                        <div>
                            <p className="text-xs text-purple-700 font-medium">Total Scans</p>
                            <p className="text-base sm:text-lg font-bold text-purple-900">{totalScans.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {[
                                    { key: 'state', label: 'State' },
                                    { key: 'city', label: 'City' },
                                    { key: 'neighbourhood', label: 'Area' },
                                    { key: 'pincode', label: 'Pincode' },
                                    { key: 'scans', label: 'Scans' }
                                ].map(({ key, label }) => (
                                    <th
                                        key={key}
                                        onClick={() => handleSort(key)}
                                        className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="truncate">{label}</span>
                                            {getSortIcon(key)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedData.map((row, index) => (
                                <tr
                                    key={`${row.pincode}-${row.city}-${index}`}
                                    className="hover:bg-gray-50 transition-colors group"
                                >
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-700">
                                        <span className="font-medium truncate block">{row.state || '—'}</span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm">
                                        <span className="font-semibold text-gray-900 truncate block">{row.city || '—'}</span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-700">
                                        <span className="truncate block">{row.neighbourhood || '—'}</span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm">
                                        <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-mono text-xs border border-gray-300 group-hover:bg-purple-100 group-hover:text-purple-700 group-hover:border-purple-300 transition-colors">
                                            {row.pincode || '—'}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-purple-600 min-w-[2ch]">{row.scans || 0}</span>
                                            <div className="flex-1 max-w-[60px] sm:max-w-[100px] bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min(((row.scans || 0) / maxScans) * 100, 100)}%` }}
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
                    <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> of{' '}
                                <span className="font-semibold text-gray-900">{sortedData.length}</span> results
                            </p>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <div className="flex gap-1">
                                    {getPageNumbers().map(pageNum => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${currentPage === pageNum
                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                                    aria-label="Next page"
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