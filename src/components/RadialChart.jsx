// components/CampaignCompletionCircle.js
import React from 'react';

const CampaignCompletionCircle = ({ completedPercentage }) => {
  const validCompletedPercentage = Math.min(100, Math.max(0, completedPercentage)); // Ensure percentage is between 0-100

  return (
    <div className="flex justify-center items-center p-4 bg-white rounded-lg h-full">
      <div className="relative">
        {/* Circle background */}
        <svg className="w-40 h-40">
          <circle
            cx="50%"
            cy="50%"
            r="60"
            strokeWidth="15"
            className="stroke-gray-200 fill-none"
          />
          {/* Dynamic circle progress */}
          <circle
            cx="50%"
            cy="50%"
            r="60"
            strokeWidth="15"
            className="stroke-oohpoint-tertiary-1 fill-none transition-all duration-500"
            strokeDasharray="377"
            strokeDashoffset={377 - (377 * validCompletedPercentage) / 100}
            strokeLinecap="round"
          />
        </svg>
        {/* Percentage in the center */}
        <div className="absolute top-[-0.8rem] left-[0.2rem] w-full h-full flex justify-center items-center">
          <span className="text-2xl font-bold text-center my-auto">
            {validCompletedPercentage.toFixed(1)}%
          </span>
        </div>
        <h3 className=' text-center font-semibold text-oohpoint-primary-2 text-2xl'>Completion</h3>
      </div>
    </div>
  );
};

export default CampaignCompletionCircle;
