import { MapPin } from "lucide-react";

const VendorPerformanceTable = ({ campaign = {}, vendors = [] }) => {
    const campaignVendors = campaign?.vendors || [];

    if (campaignVendors.length === 0) {
        return null;
    }

    // Calculate vendor performance data
    const vendorData = campaignVendors.map(campaignVendor => {
        const vendor = vendors.find(
            v => v?.vendorId === campaignVendor.vendorId ||
                v?._id === campaignVendor.vendorId ||
                v?.id === campaignVendor.vendorId
        );

        // Calculate distributed samples for this vendor
        const distributedCount = (campaign?.ipAddress || []).filter(
            scan => scan.vendorId === campaignVendor.vendorId
        ).length;

        return {
            vendorId: campaignVendor.vendorId,
            businessName: vendor?.businessName || campaignVendor.businessName || "Unknown Vendor",
            location: vendor?.address || vendor?.location || vendor?.city || campaignVendor.location || "N/A",
            samplesAssigned: campaignVendor.numberOfSamplings || 0,
            samplesDistributed: distributedCount,
        };
    });

    return (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 flex items-center justify-between border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Vendor Performance</h3>
                <p className="text-md text-slate-800 mt-1">Total Vendors: {vendorData.length}</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                Vendor Name
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">
                                Assigned
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">
                                Distributed
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {vendorData.map((vendor) => (
                            <tr key={vendor.vendorId} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 sm:px-6 py-4 text-sm text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        <span className="truncate max-w-[200px]">{vendor.location}</span>
                                    </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-900">
                                    {vendor.businessName}
                                </td>
                                <td className="px-4 sm:px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
                                        {vendor.samplesAssigned}
                                    </span>
                                </td>
                                <td className="px-4 sm:px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-md">
                                        {vendor.samplesDistributed}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Scroll Hint */}
            <p className="text-xs text-slate-500 text-center py-3 sm:hidden border-t border-slate-200">
                Swipe left to see more →
            </p>
        </div>
    );
};

export default VendorPerformanceTable;