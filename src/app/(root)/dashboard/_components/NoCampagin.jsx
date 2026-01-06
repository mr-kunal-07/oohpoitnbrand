import React from "react";
import { MdCampaign } from "react-icons/md";


const NoCampagin = () => {
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
};

export default NoCampagin;