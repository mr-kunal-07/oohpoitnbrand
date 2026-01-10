import { useMemo } from 'react';
import { List, MapPin, Package, TrendingUp } from "lucide-react";

const VendorPerformanceTable = ({ campaign = {}, vendors = [] }) => {
    // Memoize vendor data calculation for performance
    const vendorData = useMemo(() => {
        const campaignVendors = campaign?.vendors || [];

        return campaignVendors.map(campaignVendor => {
            const vendor = vendors.find(
                v => v?.vendorId === campaignVendor.vendorId ||
                    v?._id === campaignVendor.vendorId ||
                    v?.id === campaignVendor.vendorId
            );

            // Calculate distributed samples for this vendor
            const distributedCount = (campaign?.ipAddress || []).filter(
                scan => scan.vendorId === campaignVendor.vendorId
            ).length;

            const assigned = campaignVendor.numberOfSamplings || 0;
            const completionRate = assigned > 0 ? ((distributedCount / assigned) * 100).toFixed(1) : 0;

            return {
                vendorId: campaignVendor.vendorId,
                businessName: vendor?.businessName || campaignVendor.businessName || "Unknown Vendor",
                location: vendor?.address || vendor?.location || vendor?.city || campaignVendor.location || "N/A",
                samplesAssigned: assigned,
                samplesDistributed: distributedCount,
                completionRate: parseFloat(completionRate),
            };
        });
    }, [campaign?.vendors, campaign?.ipAddress, vendors]);

    if (vendorData.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 sm:mb-5 md:mb-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header - Fully Responsive */}
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-slate-200">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <List className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-600 flex-shrink-0" />
                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-slate-900">
                            Vendor Performance
                        </h3>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium">
                        Total Vendors: <span className="font-bold text-slate-900">{vendorData.length}</span>
                    </p>
                </div>
            </div>

            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                Vendor Name
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">
                                Assigned
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">
                                Distributed
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">
                                Progress
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {vendorData.map((vendor) => (
                            <tr key={vendor.vendorId} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 lg:px-6 py-4 text-sm font-medium text-slate-900">
                                    {vendor.businessName}
                                </td>
                                <td className="px-4 lg:px-6 py-4 text-sm text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        <span className="line-clamp-1">{vendor.location}</span>
                                    </div>
                                </td>
                                <td className="px-4 lg:px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
                                        {vendor.samplesAssigned}
                                    </span>
                                </td>
                                <td className="px-4 lg:px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-md">
                                        {vendor.samplesDistributed}
                                    </span>
                                </td>
                                <td className="px-4 lg:px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-300"
                                                style={{ width: `${Math.min(vendor.completionRate, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-slate-600 min-w-[3ch]">
                                            {vendor.completionRate}%
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View - Visible on Tablets and Below */}
            <div className="md:hidden divide-y divide-slate-200">
                {vendorData.map((vendor) => (
                    <div key={vendor.vendorId} className="p-3 sm:p-4 hover:bg-slate-50 transition-colors">
                        {/* Vendor Name */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <h4 className="font-semibold text-sm sm:text-base text-slate-900 flex-1 line-clamp-2">
                                {vendor.businessName}
                            </h4>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm text-slate-600">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                            <span className="line-clamp-1">{vendor.location}</span>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                            {/* Assigned */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-2.5">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Package className="w-3.5 h-3.5 text-blue-600" />
                                    <p className="text-[10px] sm:text-xs font-medium text-blue-700 uppercase tracking-wide">
                                        Assigned
                                    </p>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-blue-700">
                                    {vendor.samplesAssigned}
                                </p>
                            </div>

                            {/* Distributed */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-2.5">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                                    <p className="text-[10px] sm:text-xs font-medium text-green-700 uppercase tracking-wide">
                                        Distributed
                                    </p>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-green-700">
                                    {vendor.samplesDistributed}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-medium text-slate-600">Progress</span>
                                <span className="text-xs font-bold text-slate-900">{vendor.completionRate}%</span>
                            </div>
                            <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-300"
                                    style={{ width: `${Math.min(vendor.completionRate, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Summary - Optional */}
            <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-slate-50 border-t border-slate-200">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 text-xs sm:text-sm text-slate-600">
                    <span>
                        Total Assigned: <span className="font-semibold text-slate-900">
                            {vendorData.reduce((sum, v) => sum + v.samplesAssigned, 0).toLocaleString()}
                        </span>
                    </span>
                    <span>
                        Total Distributed: <span className="font-semibold text-slate-900">
                            {vendorData.reduce((sum, v) => sum + v.samplesDistributed, 0).toLocaleString()}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VendorPerformanceTable;