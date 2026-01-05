import QRCodeGenerator from '@/components/QRCode';
import React, { useEffect, useState } from 'react';

const itemsPerPage = 5;

const VendorsCard3 = ({ profile, vendorId }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [campaignData, setCampaignData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get current data to display based on pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = profile.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(profile.length / itemsPerPage);

    // Pagination click handler
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/getCampaigns');
            if (!res.ok) {
                throw new Error("Failed to fetch Campaigns");
            }
            const data = await res.json();
            setCampaignData(data);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns(); // Fetch campaigns when the component mounts
    }, []);

    const getCampaignId = (campaignId) => {
        const foundCampaign = campaignData.find((campaign) => campaign.cid === campaignId);
        return foundCampaign ? foundCampaign.campaignId : null;
    };

    return (
        <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-sm font-semibold mb-4 text-gray-700">List of Campaigns Participated</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="text-oohpoint-tertiary-1 font-medium text-[14px]">
                            <th className="px-4 py-2">Campaign ID</th>
                            <th className="px-4 py-2">QR Code</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((campaign, index) => {
                            const cid = getCampaignId(campaign.campaignId);
                            return (
                                <tr key={index} className="hover:bg-gray-100 text-oohpoint-primary-2 text-[12px] font-normal">
                                    <td className="px-4 py-1">{campaign.campaignId}</td>
                                    <td className="px-4 py-1">
                                        {cid ? (
                                            <QRCodeGenerator value={`https://user-ooh-point.vercel.app/campaign/${cid}-${vendorId}`} />
                                        ) : (
                                            <p>No QR Code</p>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {/* Pagination */}
            <div className="flex justify-end items-center mt-4 space-x-2">
                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`px-3 py-1 rounded ${
                            currentPage === i + 1
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-purple-300'
                        } text-sm`}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-purple-300 text-sm"
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default VendorsCard3;
