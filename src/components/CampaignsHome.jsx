"use client";
import React, { useContext, useEffect, useState } from "react";
import SimpleLineChart from "./LineChart";
import GradientBarChart from "./BarChart";
import Card from "./Card";
import { MdOutlineCampaign } from "react-icons/md";
import { MyContext } from "@/context/MyContext";
import DynamicTable from "@/components/NewTable";
import CampaignDetails from "./CampaignDetails";
import dynamic from "next/dynamic";

const MapLocation = dynamic(() => import("./MapLocation"), {
  ssr: false, // This will disable server-side rendering for the map
});

const SpiderChart = dynamic(() => import("./SpiderChart"), {
  ssr: false,
});

const CampaignsHome = () => {
  const { campaigns } = useContext(MyContext);
  const [show, setShow] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // States for card data
  const [totalScans, setTotalScans] = useState(0);
  const [uniqueScans, setUniqueScans] = useState(0);
  const [budget, setBudget] = useState(0);
  const [average, setAverage] = useState(0);
  const [barChartData, setBarChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [spiderChartData, setSpiderChartData] = useState([]);
  const [locations, setLocations] = useState([]);

  // Function to get status of campaigns (Active, Upcoming, Closed)
  const getStatus = (startDate, endDate) => {
    const currentDate = new Date().setHours(0, 0, 0, 0); // Current date without time
    const start = new Date(startDate.seconds * 1000).setHours(0, 0, 0, 0); // Start date
    const end = new Date(endDate.seconds * 1000).setHours(0, 0, 0, 0); // End date

    if (currentDate < start) {
      return "Upcoming"; // Before start date
    } else if (currentDate > end) {
      return "Closed"; // After end date
    } else {
      return "Active"; // Between start and end dates
    }
  };

  // Function to generate data for Bar Chart (Campaigns by status)
  const generateBarChartData = (campaigns) => {
    const statusCounts = {
      Active: 0,
      Closed: 0,
      Upcoming: 0,
    };

    campaigns.forEach((campaign) => {
      const status = getStatus(campaign.startDate, campaign.endDate);
      statusCounts[status] += 1;
    });

    return Object.keys(statusCounts).map((status) => ({
      name: status,
      value: statusCounts[status],
    }));
  };

  // Function to generate data for Line Chart (Campaigns over time)
  const generateLineChartData = (campaigns) => {
    const dateCounts = campaigns.reduce((acc, campaign) => {
      const date = new Date(
        campaign.startDate.seconds * 1000
      ).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(dateCounts).map((date) => ({
      name: date,
      value: dateCounts[date],
    }));
  };

  // Function to generate data for Spider Chart (Campaigns by status)
  const generateSpiderChartData = (campaigns) => {
    const statusCounts = {
      Active: 0,
      Closed: 0,
      Upcoming: 0,
    };

    campaigns.forEach((campaign) => {
      const status = getStatus(campaign.startDate, campaign.endDate);
      statusCounts[status] += 1;
    });

    return [
      { subject: "Active", A: statusCounts.Active },
      { subject: "Closed", A: statusCounts.Closed },
      { subject: "Upcoming", A: statusCounts.Upcoming },
    ];
  };

  // Function to get locations from campaigns for MapLocation component
  const getLocations = (campaigns) => {
    return campaigns.map((campaign) => campaign.location || []).flat(); // Flatten nested arrays
  };

  // Function to generate table data for campaigns
  const transformCampaignsData = (campaigns) => {
    return campaigns.map((campaign) => ({
      campaign: {
        name: campaign.campaignName || "N/A",
        img: campaign.adCreative || "",
      },
      id: campaign.campaignId || "N/A", // Campaign ID
      impressions: campaign.ipAddress?.length || 0, // Assuming impressions are based on ipAddress
      startDate:
        new Date(campaign.startDate.seconds * 1000).toLocaleDateString() ||
        "N/A", // Start Date
      endDate:
        new Date(campaign.endDate.seconds * 1000).toLocaleDateString() || "N/A", // End Date
      status: getStatus(campaign.startDate, campaign.endDate), // Status
      // budgetAllocated: `Rs. ${campaign.campaignBudget || 0}`, // Budget Allocated
      button: "Insights", // Button to view more details
    }));
  };

  // UseEffect to calculate total data and set chart data
  useEffect(() => {
    if (campaigns.length > 0) {
      // Calculate total scans, unique scans, and budget
      let total = 0;
      let unique = 0;
      let bd = 0;

      campaigns.forEach((campaign) => {
        if (campaign.ipAddress) {
          total += campaign.ipAddress.length;
        }
        if (campaign.locationIp) {
          unique += campaign.locationIp.length;
        }
        bd += parseInt(campaign.campaignBudget);
      });

      setTotalScans(total);
      setUniqueScans(unique);
      setBudget(bd);
      setAverage(bd / campaigns.length);

      // Generate data for charts and map
      setBarChartData(generateBarChartData(campaigns));
      setLineChartData(generateLineChartData(campaigns));
      setSpiderChartData(generateSpiderChartData(campaigns));
      setLocations(getLocations(campaigns));
    }
  }, [campaigns]);

  const handleShow = (campaignId) => {
    console.log(campaignId);
    const campaign = campaigns.find((c) => c.campaignId === campaignId);
    setSelectedCampaign(campaign);
    setShow(true);
  };

  return (
    <div className="w-full h-full">
      {show && selectedCampaign ? (
        <CampaignDetails campaign={selectedCampaign} />
      ) : (
        <>
          {/* <div className="w-full flex flex-wrap lg:justify-between justify-around items-center gap-4 lg:gap-2 mb-4">
       
            <SimpleLineChart
              head="Campaigns Over Time"
              count={`+${campaigns.length}`}
              Icon={true}
              data={lineChartData} // Line chart data
            />
            <SpiderChart
              head="Campaigns by Status"
              data={spiderChartData} // Spider chart data
            />
            <div className=" flex flex-col w-[30%] min-w-[18rem] gap-4">
            <Card head="Total Engagements" count={totalScans} Icon={MdOutlineCampaign} />
            <Card head="Unique Engagements" count={uniqueScans} Icon={MdOutlineCampaign} />
            </div>
          </div> */}
          {/* 
          <div className="w-full flex flex-wrap lg:justify-between justify-around items-center gap-4 lg:gap-2 mt-10">
            <Card head="Total Engagements" count={totalScans} Icon={MdOutlineCampaign} />
            <Card head="Unique Engagements" count={uniqueScans} Icon={MdOutlineCampaign} />
            <Card head="Total Budget" count={`Rs. ${budget}`} Icon={MdOutlineCampaign} />
            <Card head="Average Budget per Campaign" count={`Rs. ${average}`} Icon={MdOutlineCampaign} />
          </div> */}

          {/* MapLocation component for displaying campaign locations */}
          {/* <div className="w-full flex flex-wrap lg:justify-between justify-around items-start gap-4 lg:gap-2">
          <GradientBarChart
              head="Campaign Status"
              count={`+${campaigns.length}`}
              Icon={true}
              darkColor="#B77DC4"
              lightColor="#F7D5FF"
              data={barChartData} // Bar chart data
            />
            <MapLocation locations={locations} />
            <div className=" flex flex-col w-[30%] min-w-[18rem] gap-4">
            <Card head="Total Budget" count={`Rs. ${budget}`} Icon={MdOutlineCampaign} />
            <Card head="Average Budget" count={`Rs. ${average.toFixed(2)}`} Icon={MdOutlineCampaign} />
            </div>
          </div> */}

          <div className="w-full flex flex-col items-start justify-start lg:px-0 px-1 gap-4 py-5">
            {/* <h3 className="text-3xl text-oohpoint-grey-400 font-semibold">Campaigns</h3> */}
            <DynamicTable
              headings={[
                "Campaign Name",
                "Campaign ID",
                "Impressions",
                "Start Date",
                "End Date",
                "Status",
                // "Budget Allocated",
                "",
              ]}
              data={transformCampaignsData(campaigns)}
              rowsPerPage={4}
              pagination={true}
              functionn={handleShow}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CampaignsHome;
