import React from 'react';
import { TrendingUp, Store } from 'lucide-react';

const VendorTable = ({ vendorShopWiseScans }) => {
    if (!vendorShopWiseScans) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (vendorShopWiseScans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Store className="mb-4 opacity-20" size={64} strokeWidth={1.5} />
                <p className="text-lg font-medium text-gray-300">No vendor data available</p>
                <p className="text-sm text-gray-500 mt-1">Vendors will appear here once they start receiving scans</p>
            </div>
        );
    }

    // Sort by engagements (highest to lowest)
    const sortedVendors = [...vendorShopWiseScans].sort((a, b) => b.totalScans - a.totalScans);
    const totalEngagements = vendorShopWiseScans.reduce((sum, v) => sum + v.totalScans, 0);

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="p-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 rounded-xl p-6 border border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-300 mb-1">Total Vendors</p>
                            <p className="text-3xl font-bold text-white">{vendorShopWiseScans.length}</p>
                        </div>
                        <Store className="text-purple-400" size={40} strokeWidth={1.5} />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-xl p-6 border border-blue-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-300 mb-1">Total Engagements</p>
                            <p className="text-3xl font-bold text-white">{totalEngagements.toLocaleString()}</p>
                        </div>
                        <TrendingUp className="text-blue-400" size={40} strokeWidth={1.5} />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-xl p-6 border border-green-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-300 mb-1">Avg per Vendor</p>
                            <p className="text-3xl font-bold text-white">
                                {Math.round(totalEngagements / vendorShopWiseScans.length)}
                            </p>
                        </div>
                        <div className="text-green-400 text-2xl font-bold">📊</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-800 border-b border-gray-700">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Vendor
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Vendor ID
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Engagements
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Share
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {sortedVendors.map(({ vendorId, businessName, totalScans, vendorLogo }, index) => {
                                const sharePercent = ((totalScans / totalEngagements) * 100).toFixed(1);

                                return (
                                    <tr key={vendorId} className="hover:bg-slate-700/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    index === 0
                                                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                        : index === 1
                                                        ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                                        : index === 2
                                                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                                        : 'bg-slate-700 text-gray-400'
                                                }`}
                                            >
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {vendorLogo ? (
                                                    <img
                                                        src={vendorLogo}
                                                        alt={businessName}
                                                        className="w-12 h-12 rounded-xl object-cover border-2 border-gray-700 group-hover:border-purple-500 transition-colors shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border-2 border-gray-700 group-hover:border-purple-500 transition-colors">
                                                        <Store className="text-gray-500" size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{businessName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono text-gray-400 bg-slate-700/50 px-2 py-1 rounded border border-gray-600">
                                                {vendorId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-lg font-bold text-purple-400">
                                                    {totalScans.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${sharePercent}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-300 w-12">
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