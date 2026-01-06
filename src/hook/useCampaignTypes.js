"use client";
import { useContext, useMemo } from "react";
import { MyContext } from "@/context/MyContext";

export const useCampaignTypes = () => {
  const { campaigns, user } = useContext(MyContext);

  const campaignTypes = useMemo(() => {
    if (!campaigns || !user?.brandId) {
      return {
        hasPrizeMode: false,
        hasProductMode: false,
        hasSocietyMode: false,
        bothTypes: false,
        allTypes: false,
      };
    }

    // Filter campaigns belonging to this brand
    const brandCampaigns = campaigns.filter((c) => c.client === user.brandId);

    if (brandCampaigns.length === 0) {
      return {
        hasPrizeMode: false,
        hasProductMode: false,
        hasSocietyMode: false,
        bothTypes: false,
        allTypes: false,
      };
    }

    /** -----------------------------
     * 🔍 Detect Product Mode
     * ----------------------------- */
    const isProductModeCampaign = (campaign) => {
      if (campaign.isProductMode || campaign.mode === "ProductMode") return true;

      if (Array.isArray(campaign.vendors)) {
        return campaign.vendors.some(
          (v) => v?.isProductMode === true || v?.mode === "ProductMode"
        );
      }

      return false;
    };

    /** -----------------------------
     * 🔍 Detect Society Mode
     * ----------------------------- */
    const isSocietyModeCampaign = (campaign) => {
      if (campaign.mode === "society") return true;

      if (Array.isArray(campaign.vendors)) {
        return campaign.vendors.some(
          (v) => v?.mode === "society"
        );
      }

      return false;
    };

    /** -----------------------------
     * 🔍 Logic Checks
     * ----------------------------- */
    const hasProductMode = brandCampaigns.some(isProductModeCampaign);
    const hasSocietyMode = brandCampaigns.some(isSocietyModeCampaign);
    const hasPrizeMode = brandCampaigns.some(
      (c) => !isProductModeCampaign(c) && !isSocietyModeCampaign(c)
    );

    const result = {
      hasPrizeMode,
      hasProductMode,
      hasSocietyMode,
      bothTypes: hasProductMode && hasPrizeMode,
      allTypes: hasProductMode && hasPrizeMode && hasSocietyMode,
    };

    // Debug log
    console.log("🔎 Campaign Type Detection:", {
      brandId: user.brandId,
      totalCampaigns: brandCampaigns.length,
      productModeCount: brandCampaigns.filter(isProductModeCampaign).length,
      societyModeCount: brandCampaigns.filter(isSocietyModeCampaign).length,
      prizeModeCount: brandCampaigns.filter(
        (c) => !isProductModeCampaign(c) && !isSocietyModeCampaign(c)
      ).length,
      result,
    });

    return result;
  }, [campaigns, user]);

  return campaignTypes;
};
