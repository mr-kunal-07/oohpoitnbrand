"use client";
import { useContext } from "react";

import { MyContext } from "@/context/MyContext";
import NoCampagin from "./_components/NoCampagin";
import { useCampaignTypes } from "@/hook/useCampaignTypes";
import BrandDashboard from "./_components/BrandDashboard";
import SamplingDashboard from "./sampling/page";


const page = () => {
        const { hasPrizeMode, hasProductMode, hasSocietyMode, bothTypes } = useCampaignTypes();
    const { user, campaigns } = useContext(MyContext);

    if (!user || !campaigns) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    // Product mode only
    if (hasProductMode && !hasPrizeMode && !hasSocietyMode) {
        return <SamplingDashboard />;
    }

    // Prize mode only
    if (hasPrizeMode && !hasProductMode && !hasSocietyMode) {
        return <BrandDashboard />;
    }

    // // Society mode only
    // if (hasSocietyMode && !hasProductMode && !hasPrizeMode) {
    //     return <SocietyDashboard />;
    // }

    // Mixed modes (user chooses via dropdown)
    if (bothTypes || (hasProductMode && hasSocietyMode) || (hasPrizeMode && hasSocietyMode)) {
        return <BrandDashboard />;
    }

    // Fallback
    return <NoCampagin />;
}

export default page
