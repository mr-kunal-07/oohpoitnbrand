"use client"
import React, { useContext, useEffect, useState } from "react";
import SimpleLineChart from "./LineChart";
import SimplePieChart from "./PieChart";
import GradientBarChart from "./BarChart";
import Card from "./Card";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlineCampaign } from "react-icons/md";
import { PiHandshake } from "react-icons/pi";
import Table from "./Table";
import DonutChart from "./DonutChart";
import dynamic from "next/dynamic";
import StackCard from "./StackCard.jsx/StackCard";
import CustomLineGraph from "./CustomLineGraph";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { MyContext } from "@/context/MyContext";
import VendorsCard2 from "./Vendors/VendorsDetails/VendorsCard2";
import Sec1 from "./Sec1";
import Sec2 from "./Sec2";
import { AiOutlineStock } from "react-icons/ai";

const MapLocation = dynamic(() => import("./MapLocation"), {
  ssr: false, // This will disable server-side rendering for the map
});

const Campaigns = () => {
  const router = useRouter();
  const {user, campaigns} = useContext(MyContext)
  const [totalScans, setTotalScans] = useState(0)
  const [uniqueScans, setUniqueScans] = useState(0)
  const [weeklyScans, setWeeklyScans] = useState([])
  const [totalCampaignsData, setTotalCampaignsData] = useState([])
  const [locations, setLocations] = useState([])
  const [budget, setBudget] = useState(0)
  const [average, setAverage] = useState(0)

// Helper function to get the weekday from a date string
function getWeekdayName(dateString) {
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date)) {
    console.error(`Invalid date string: ${dateString}`);
    return "Invalid Date"; // Handle this case as needed
  }

  const options = { weekday: 'short' }; // "short" will give Mon, Tue, etc.
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

function convertTimestampToDate(timestamp) {
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
}

  useEffect(() => {
    // calculate total scans
    let total = 0
    let unique = 0
    let bd = 0
    campaigns.forEach(campaign => {
      if (campaign.ipAddress) {
        total += campaign.ipAddress.length
      }
      if (campaign.locationIp) {
        unique += campaign.locationIp.length
      }    
      bd += parseInt(campaign.campaignBudget)
    })
    setTotalScans(total)
    setUniqueScans(unique)
    setBudget(bd)
    setAverage(bd/campaigns.length)
    const data = campaigns.map(campaign => campaign.ipAddress)
    const ipData = data.flat()
    const loc = campaigns.map(campaign => campaign.location)
    const locationData = loc.flat()
    setLocations(locationData)
    console.log(ipData)
// Assuming ipData is the array of objects
const weekdayCounts = ipData.reduce((acc, item) => {
  const weekday = getWeekdayName(item?.createdAt);
  
  // Skip invalid dates
  if (weekday !== "Invalid Date") {
    acc[weekday] = (acc[weekday] || 0) + 1;
  }
  
  return acc;
}, {});

const transformedData = Object.entries(weekdayCounts).map(([name, value]) => ({
  name,
  value,
}));
console.log(transformedData)


  setWeeklyScans(transformedData)

  const weekdayCountss = campaigns.reduce((acc, campaign) => {
    const date = convertTimestampToDate(campaign.createdAt);
    const weekday = getWeekdayName(date);
    acc[weekday] = (acc[weekday] || 0) + 1; // Increment the count for that day
    return acc;
  }, {});
  
  // Convert the object into an array of objects for easier display
  const transformedDataa = Object.entries(weekdayCountss).map(([name, value]) => ({
    name,
    value,
  }));
  setTotalCampaignsData(transformedDataa)
  console.log(transformedData)
  

  }, [campaigns])
  

  return (
    <div className="bg-oohpoint-grey-200 w-full h-full flex flex-col justify-start items-start  mt-2">
    <div className=" w-full flex flex-col items-start justify-center lg:px-8   px-1 py-4 gap-1">
        <h1 className=" text-oohpoint-grey-500 font-bold text-4xl">
          Campaigns
        </h1>
        <p className=" text-oohpoint-tertiary-2 font-medium">
          All you need to know about campaigns!
        </p>
      </div>
      <div className=" w-full flex flex-col items-start justify-start lg:px-8  px-1 gap-4">
      <div className=" w-full flex flex-wrap lg:justify-between justify-around items-center gap-4 lg:gap-2">
          <Card
            head="Active Campaigns"
            count={campaigns.length}
            Icon={IoIosCheckmarkCircleOutline}
          />
          <Card
            head="Number of scans"
            count={totalScans}
            Icon={MdOutlineCampaign }
          />
          <Card head="Number of Unique scans" count={uniqueScans} Icon={PiHandshake} />
        </div>
        <div className=" w-full flex flex-col items-start justify-start px-1 gap-4 mt-10 py-5">
        <Table data={campaigns} vendor={user} />
      </div>
      <div className=" w-full flex flex-wrap lg:justify-between justify-around items-center gap-4 lg:gap-2">
      <GradientBarChart
            head="Number of campaigns"
            count={campaigns.length}
            Icon={true}
            darkColor="#441886"
            lightColor="#E6D6FF"
            data={totalCampaignsData}
          />
          <Sec2 Icon={AiOutlineStock} para="Total Budget" img="/money.png" value={`Rs.${budget}`} />
        <SimpleLineChart
            head="Brand Growth"
            Icon={true}
            data={weeklyScans}
          />
      </div>
       
        <div className=" w-full flex flex-wrap lg:justify-between justify-around items-center gap-4 lg:gap-2 pb-8">
        <MapLocation locations={locations} />
        <Sec2 Icon={AiOutlineStock} para="Av. Campaign Value" img="/value.png" value={`Rs.${average.toFixed(2)}`} />
        <div className="flex flex-col gap-4">
          <Sec1 p1="Total QR Code Scans" c1={totalScans} c2={uniqueScans} p2="Unique QR Code Scans" />
          <Sec1 p1="CPA" c1={campaigns.length} c2={`Rs.${budget}`} p2="Revenue Generated" />
        </div>
          {/* <GradientBarChart
            head="Total Users"
            count="7000"
            Icon={false}
            darkColor="#441886"
            lightColor="#E6D6FF"
          />
          <SimpleLineChart
            head="Total Number of scans"
            count="65748"
            Icon={true}
          /> */}
        </div>
        {/* <div className=" w-full flex flex-wrap lg:justify-between justify-around items-center gap-4 lg:gap-2">
          <SpiderChart head="Vendors" />
          <DonutChart />
          <MapLocation />
        </div> */}
        {/* <div className="  w-full flex flex-wrap lg:justify-between justify-around items-center gap-4 lg:gap-2">
          <StackCard
            head={"07 Sept Approval"}
            count={"Team Payments"}
            Icon={true}
          />
          <SimpleLineChart head="Income Statistics" count="+8%" Icon={true} />
          <CustomLineGraph head="Savings" count="Rs. 7000" Icon={true} />
        </div> */}
      </div>
      
    </div>
  );
};

export default Campaigns;
