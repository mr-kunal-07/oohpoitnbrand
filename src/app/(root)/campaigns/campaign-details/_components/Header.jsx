import { ArrowRight, Calendar } from 'lucide-react'
import React from 'react'

const Header = ({ campaign, status }) => {
    console.log(campaign)
    const getStatusConfig = (status) => {
        const configs = {
            active: {
                bg: 'bg-green-100',
                text: 'text-green-700',
                border: 'border-green-200',
                icon: '●',
                label: 'Active'
            },
            upcoming: {
                bg: 'bg-amber-100',
                text: 'text-amber-700',
                border: 'border-amber-200',
                icon: '⏳',
                label: 'Upcoming'
            },
            completed: {
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                border: 'border-blue-200',
                icon: '✓',
                label: 'Completed'
            },
            draft: {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                border: 'border-gray-200',
                icon: '●',
                label: 'Draft'
            }
        }
        return configs[status] || configs.draft
    }

    const statusConfig = getStatusConfig(status)
    const logoUrl = campaign?.adCreativeImages?.[0]

    return (
        <div className="bg-white w-full max-w-6xl mx-auto rounded-xl shadow-sm border border-gray-100">
            <div className="p-3">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Logo Section */}
                    {logoUrl && (
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-50 border border-gray-200 shadow-sm">
                                <img
                                    src={logoUrl}
                                    alt={campaign?.campaignName || "Campaign"}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                        {/* Title and Status Row */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        {campaign?.campaignName || "Campaign Analytics"}
                                    </h1>

                                    {/* Status Badge - Mobile */}
                                    <span className={`sm:hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                        <span>{statusConfig.icon}</span>
                                        {statusConfig.label}
                                    </span>
                                </div>
                            </div>


                            {/* Status Badge - Desktop */}
                            <div className="hidden sm:flex flex-shrink-0">
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                    <span>{statusConfig.icon}</span>
                                    {statusConfig.label}
                                </span>
                            </div>
                        </div>
                        {/* Campaign Details */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4">
                            {/* Date Range */}
                            {campaign?.startDate && (
                                <div className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 bg-gray-100 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-100">
                                    <Calendar className="w-4 h-4 text-gray-700" />
                                    <span className="font-medium whitespace-nowrap">
                                        {new Date(campaign.startDate.seconds * 1000).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>

                                    {campaign?.endDate && (
                                        <>
                                            <span className="text-gray-400 hidden sm:inline">→</span>
                                            <span className="text-gray-400 sm:hidden">-</span>
                                            <span className="font-medium whitespace-nowrap">
                                                {new Date(campaign.endDate.seconds * 1000).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Target Scans */}
                            {campaign?.targetScans && (
                                <div className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 bg-gray-100 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-100">
                                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="font-medium whitespace-nowrap">
                                        <span className="hidden lg:inline">Target: </span>
                                        {campaign.targetScans.toLocaleString()}
                                        <span className="hidden sm:inline"> Engagements</span>
                                    </span>
                                </div>
                            )}

                            {/* Duration */}
                            {campaign?.startDate && campaign?.endDate && (
                                <div className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 bg-gray-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-100">
                                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium whitespace-nowrap">
                                        {Math.ceil((campaign.endDate.seconds - campaign.startDate.seconds) / (60 * 60 * 24))} days
                                    </span>
                                </div>
                            )}
                        </div>


                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header