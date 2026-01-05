"use client";
import React, { useContext, useState } from "react";
import CampaignsHome from "./CampaignsHome";
import { MyContext } from "@/context/MyContext";

const NewCampaigns = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [searchText, setSearchText] = useState("");
  const { campaigns, setCampaigns , fetchUser, uid} = useContext(MyContext);
  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <CampaignsHome />;
    //   case "vendorsDetails":
    //     return <VendorsDetails />;
    //   case "verificationAndApprovals":
    //     return <VerificationAndAprrovals />;
    //   case "Payments":
    //     return <Payment />;
    //   case "CreateCampaign":
    //     return <CreateCampaign />;
      default:
        return <CampaignsHome />;
    }
  };

  const handleSearch = async (e) => {
    setSearchText(e.target.value);
    const filteredCampaigns = campaigns.filter((campaign) => campaign.campaignId.toLowerCase().includes(e.target.value.toLowerCase()));
    setCampaigns(filteredCampaigns);
    if (e.target.value === "") {
      fetchUser(uid);
    }
  }

  return (
    <div className="bg-oohpoint-grey-200 w-full h-full flex flex-col justify-start items-start ">
      <div className=" w-full flex flex-col items-start justify-center px-8 py-4 gap-1">
        <h1 className=" text-oohpoint-grey-500 font-bold text-4xl">Campaigns</h1>
        <p className=" text-oohpoint-tertiary-2">All you need to know about campaigns!</p>
        {/* <div className="flex justify-between  w-full max-xl:flex-col max-xl:gap-6 mt-4">
          <ul className="flex  gap-5 text-oohpoint-grey-300 max-md:flex-col cursor-pointer">
           
            <li
              className={`cursor-pointer bg-oohpoint-primary-2 text-white rounded-lg px-4 py-2 text-sm my-auto`}
              onClick={() => {
                setActiveSection("CreateCampaign");
              }}
            >
              Create New Campaign
            </li>
          </ul>
          <div className="flex gap-5 max-md:flex-wrap max-md:gap-4 max-md:mt-3">
            <input
              type="text"
              placeholder="Search"
              className="px-4 py-1 rounded-lg"
              value={searchText}
              onChange={(e) => handleSearch(e)}
            />
            <div>
              <img src="/assets/refresh.png" alt="" srcset="" />
            </div>
          </div>
        </div> */}
      </div>
      <div className=" w-full flex flex-col items-start justify-start px-8 gap-4">
        {renderSection()}
      </div>
    </div>
  );
};

export default NewCampaigns;
