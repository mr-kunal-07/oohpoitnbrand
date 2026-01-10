import React, { useMemo } from 'react';
import { TrendingUp, Store } from 'lucide-react';

const VendorTable = ({ vendorShopWiseScans }) => {
    const { sortedVendors, totalEngagements, avgPerVendor } = useMemo(() => {
        if (!vendorShopWiseScans?.length) {
            return { sortedVendors: [], totalEngagements: 0, avgPerVendor: 0 };
        }

        const sorted = [...vendorShopWiseScans].sort((a, b) => b.totalScans - a.totalScans);
        const total = vendorShopWiseScans.reduce((sum, v) => sum + v.totalScans, 0);
        const avg = Math.round(total / vendorShopWiseScans.length);

        return { sortedVendors: sorted, totalEngagements: total, avgPerVendor: avg };
    }, [vendorShopWiseScans]);

    // Loading state
    if (!vendorShopWiseScans) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
        );
    }

    // Empty state
    if (vendorShopWiseScans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 px-4">
                <Store className="mb-3 sm:mb-4 opacity-20" size={48} strokeWidth={1.5} />
                <p className="text-base sm:text-lg font-medium text-gray-700">No vendor data available</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 text-center">
                    Vendors will appear here once they start receiving scans
                </p>
            </div>
        );
    }

    const getRankBadgeStyle = (index) => {
        if (index === 0) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        if (index === 1) return 'bg-gray-100 text-gray-700 border-gray-300';
        if (index === 2) return 'bg-orange-100 text-orange-700 border-orange-300';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Vendor
                                </th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Vendor ID
                                </th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Engagements
                                </th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Share
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sortedVendors.map(({ vendorId, businessName, totalScans, vendorLogo }, index) => {
                                const sharePercent = ((totalScans / totalEngagements) * 100).toFixed(1);

                                return (
                                    <tr key={vendorId} className="hover:bg-gray-50 transition-colors group">
                                        {/* Rank */}
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <div
                                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border ${getRankBadgeStyle(
                                                    index
                                                )}`}
                                            >
                                                {index + 1}
                                            </div>
                                        </td>

                                        {/* Vendor Info */}
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                {vendorLogo ? (
                                                    <img
                                                        src={vendorLogo}
                                                        alt={businessName}
                                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border-2 border-gray-200 group-hover:border-purple-400 transition-colors shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200 group-hover:border-purple-400 transition-colors">
                                                        <Store className="text-gray-500" size={20} />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                                        {businessName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Vendor ID */}
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200 inline-block">
                                                {vendorId}
                                            </span>
                                        </td>

                                        {/* Engagements */}
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                            <span className="text-base sm:text-lg font-bold text-purple-600">
                                                {totalScans.toLocaleString()}
                                            </span>
                                        </td>

                                        {/* Share */}
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${Math.min(parseFloat(sharePercent), 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs sm:text-sm font-medium text-gray-700 w-10 sm:w-12">
                                                    {sharePercent}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorTable;