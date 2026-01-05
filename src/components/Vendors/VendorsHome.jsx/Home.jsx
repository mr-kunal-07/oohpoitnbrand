"use client";
import React from "react";
import Card from "../../Card";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlineCampaign } from "react-icons/md";
import { PiHandshake } from "react-icons/pi";
import SimpleLineChart from "../../LineChart";
import GradientBarChart from "../../BarChart";
import Table from "@/components/Table";
import dynamic from "next/dynamic";
const SpiderChart = dynamic(() => import("../../SpiderChart"), {
  ssr: false,
});

const Home = ({vendor}) => {
  return (
    <div className="w-full h-full flex-col">
      <div className=" w-full flex flex-wrap lg:justify-between justify-around items-center gap-4 lg:gap-2">
        <Card
          head="Pending Approvals"
          count="60"
          Icon={IoIosCheckmarkCircleOutline}
        />
        <Card head="Active Vendors" count="90" Icon={MdOutlineCampaign} />
        <Card head="Total number of vendors" count="60" Icon={PiHandshake} />
      </div>
      <div className=" w-full flex flex-wrap lg:justify-between justify-around items-center gap-4 lg:gap-2 mt-5">
        <GradientBarChart
          head="Vendor Registration"
          count="+24 (this month)"
          Icon={true}
          darkColor="#B77DC4"
          lightColor="#F7D5FF"
        />
        <SpiderChart head="Vendors" />
        <SimpleLineChart
          head="Active Vendors"
          count="65748"
          Icon={true}
        />
      </div>
      {/* <div className="mt-5 w-full ">
        <div className="flex w-full bg-oohpoint-grey-100 justify-between px-10 py-4 rounded-lg max-md:flex-col">
          <div className="flex gap-4">
            {[0, 1, 2, 3, 4].map((item) => (
              <div
                className={`w-7 h-7 rounded-full bg-oohpoint-grey-300`}
              ></div>
            ))}
          </div>
          <h2 className="text-3xl font-extrabold text-oohpoint-tertiary-1">Signup</h2>
        </div>
      </div> */}
      <div className=" w-full flex flex-col items-start justify-start ">
        <h2 className="my-10 text-3xl text-oohpoint-grey-400 font-bold">
          Recent Vendors Approval
        </h2>
        {vendor && <Table data={vendor} isShow={true} />}
      </div>
    </div>
  );
};

export default Home;
