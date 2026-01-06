"use client";
import BrandCampaigns from '@/components/BrandCampaigns'
import { MyContext } from '@/context/MyContext';
import React, { useContext, useEffect, useState } from 'react'
import { MdCampaign } from "react-icons/md";

const page = () => {
  const { campaigns, user } = useContext(MyContext);
  const [brandCampaigns, setBrandCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      const data = [];
      campaigns.forEach((campaign) => {
        if (campaign.client === user.brandId) {
          data.push(campaign);
        }
      });
      setBrandCampaigns(data);
      setLoading(false);
    } else if (campaigns) {
      // Campaigns loaded but empty
      setLoading(false);
    }
  }, [campaigns, user?.brandId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading campaigns...</div>
      </div>
    );
  }

  // No campaigns state
  if (brandCampaigns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] py-12 px-4">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-full p-6">
              <MdCampaign className="text-gray-400 text-6xl" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            No Campaigns Assigned
          </h2>

          {/* Description */}
          <p className="text-gray-500 mb-8">
            You don't have any campaigns assigned to you yet. Get started by creating your first campaign or contact your administrator.
          </p>

          {/* Additional Help Text */}
          <p className="text-sm text-gray-400 mt-6">
            Need help? <a href="#" className="text-blue-500 hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    );
  }

  // Display campaigns
  return <div className='px-6 py-4' > <BrandCampaigns campaigns={brandCampaigns} /></div>;
}

export default page;